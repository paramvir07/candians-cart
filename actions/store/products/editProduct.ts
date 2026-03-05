"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import {
  ProductFormSchema,
  ProductFormValues,
} from "@/zod/schemas/store/addProductsValidation";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { zodErrorResponse } from "@/zod/validation/error";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function updateProduct(
  productId: string,
  data: ProductFormValues,
): Promise<ActionResponse> {
  try {
    const validationResult = ProductFormSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }

    const session = await getUserSession();
    const storeRole = session.user.role === "store";
    const adminRole = session.user.role === "admin";
    await dbConnect();

    let existingProduct;
    let store;

    if (adminRole) {
      existingProduct = await Product.findById(productId);
    } else if (storeRole) {
      store = await Store.findOne({ userId: session.user.id }).lean();
      if (!store)
        return {
          success: false,
          message: "Store not found",
        };

      // Fetching existing products
      existingProduct = await Product.findOne({
        _id: productId,
        storeId: store?._id,
      });
    }

    if (!existingProduct) {
      return {
        success: false,
        message:
          "Product not found or you don't have permission to update the product",
      };
    }

    const { price, disposableFee, tax, images, ...otherData } =
      validationResult.data;

    // Comparing the old and the new images
    const newImageIds = images?.map((img) => img.fileId) || [];
    const imagesToDelete =
      existingProduct.images?.filter(
        (oldImg: { fileId: string; url: string }) =>
          oldImg.fileId && !newImageIds.includes(oldImg.fileId),
      ) || [];

    for (const img of imagesToDelete) {
      try {
        await imagekit.files.delete(img.fileId);
        console.log(
          `Successfully deleted old image ${img.fileId} from ImageKit`,
        );
      } catch (err) {
        console.error(
          `Failed to delete old image ${img.fileId} from ImageKit:`,
          err,
        );
      }
    }

    const dbPayload = {
      ...otherData,
      images: images || [], // Set the new images array
      // Converting percentage to decimal
      tax: tax > 0 ? tax / 100 : 0,
      // Converting Dollars to cents
      price: Math.round(price * 100),
      // converting dollars to cents
      disposableFee: Math.round((disposableFee || 0) * 100),
    };

    let updatedProduct;
    if (adminRole) {
      updatedProduct = await Product.findByIdAndUpdate(
        productId, // Add the store using _id
        { $set: dbPayload },
        { returnDocument: "after" }, // Returns the updated document
      );
    } else if (storeRole) {
      updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, storeId: store?._id }, // Add the store using _id
        { $set: dbPayload },
        { returnDocument: "after" }, // Returns the updated document
      );
    }

    if (!updatedProduct) {
      return {
        success: false,
        message:
          "Product not found or You dont have permission to update the product",
      };
    }

    if (adminRole) {
      revalidatePath(`/admin/store/${store?._id}/products`);
    } else if (storeRole) {
      revalidatePath(`/store/products`);
    }
    return {
      success: true,
      message: "Product updation successfull",
    };
  } catch (error) {
    console.log("Something went wrong: ", error);
    return {
      success: false,
      message: "An error occured while updating the product",
    };
  }
}
