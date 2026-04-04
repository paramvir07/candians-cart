"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import {
  createProductFormSchema,
  ProductFormValues,
} from "@/zod/schemas/store/addProductsValidation";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { zodErrorResponse } from "@/zod/validation/error";
import ImageKit from "@imagekit/nodejs";
import ProductInvoice from "@/db/models/store/invoice.model";

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
    // Automatically sets the subsidy to true, if product category = Fruits, Vegetables, Dairy
    const subsidyCategories = ["Fruits", "Vegetables", "Dairy"];

    const session = await getUserSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userRole = (session.user.role as "admin" | "store") || "store";

    const adminRole = userRole === "admin";
    const storeRole = userRole === "store";

    const schema = createProductFormSchema(userRole);
    const validationResult = schema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }

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
        message: "Product not found",
      };
    }

    const {
      price,
      disposableFee,
      tax,
      images,
      InvoiceId,
      isMeasuredInWeight,
      UOM,
      primaryUPC,
      ...otherData
    } = validationResult.data;

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

    const newPriceInCents = Math.round(price * 100);

    const priceHasChanged = existingProduct.price !== newPriceInCents;

    // Checks if invoice exists for store role, No checks for admin
    if (storeRole && priceHasChanged) {
      if (!InvoiceId) {
        return {
          success: false,
          message:
            "An Invoice Id is required when changing the price of a product",
        };
      }
      const invoice = await ProductInvoice.findById(InvoiceId);
      if (!invoice) {
        return { success: false, message: "Invoice does not exists" };
      }

      await ProductInvoice.findByIdAndUpdate(InvoiceId, {
        $push: {
          products: {
            productId: existingProduct._id,
            oldPrice: existingProduct.price,
            newPrice: newPriceInCents,
            status: "PENDING", // Goes live immediately
          },
        },
      });
    }

    console.log("CATEGORY:", otherData.category);

    const isSubsidized = subsidyCategories.includes(otherData.category);

    const dbPayload = {
      ...otherData,
      images: images || [], // Set the new images array
      // Converting percentage to decimal
      tax: tax > 0 ? tax / 100 : 0,
      // Converting Dollars to cents
      price: newPriceInCents,
      // converting dollars to cents
      disposableFee: Math.round((disposableFee || 0) * 100),
      InvoiceId: InvoiceId || existingProduct.InvoiceId,
      subsidised: isSubsidized,
      isMeasuredInWeight,
      UOM,
      primaryUPC,
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

    const targetStoreId =
      store?._id?.toString() || existingProduct.storeId.toString();

    revalidateTag(`products-${targetStoreId}`, "default" as any);

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
