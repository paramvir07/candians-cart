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

      return {
        success: false,
        message: errorMessage || "Validation error",
      };
    }

    await dbConnect();

    let existingProduct;
    let store;

    if (adminRole) {
      existingProduct = await Product.findById(productId);
    } else if (storeRole) {
      store = await Store.findOne({ userId: session.user.id }).lean();

      if (!store) {
        return { success: false, message: "Store not found" };
      }

      existingProduct = await Product.findOne({
        _id: productId,
        storeId: store._id,
      });
    }

    if (!existingProduct) {
      return { success: false, message: "Product not found" };
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

    /**
     * Delete removed images from ImageKit
     */
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

    /**
     * Price comparison
     */
    const newPriceInCents = Math.round(price * 100);
    const priceHasChanged = existingProduct.price !== newPriceInCents;

    /**
     * Primary UPC logic
     *
     * primaryUPC is already a number, so no Number(primaryUPC)
     * and no string checks are needed.
     */
    const newPrimaryUPC =
      primaryUPC !== undefined && primaryUPC !== null ? primaryUPC : undefined;

    const primaryUPCHasChanged =
      newPrimaryUPC !== undefined &&
      existingProduct.primaryUPC !== newPrimaryUPC;

    /**
     * Check duplicate UPC only if UPC was edited
     */
    if (primaryUPCHasChanged) {
      const productWithSameUPC = await Product.findOne({
        primaryUPC: newPrimaryUPC,
        _id: { $ne: productId },
      }).lean();

      if (productWithSameUPC) {
        return {
          success: false,
          message: `Primary UPC is already in use by another product: ${
            productWithSameUPC.name || "Unknown Product"
          }`,
        };
      }
    }

    /**
     * Store must provide invoice when changing price
     */
    if (storeRole && priceHasChanged && !InvoiceId) {
      return {
        success: false,
        message:
          "An Invoice Id is required when changing the price of a product",
      };
    }

    /**
     * Invoice logic
     *
     * If InvoiceId is provided:
     * - If product already exists inside invoice.products, update newPrice/status
     * - Otherwise, push product into invoice.products
     */
    if (storeRole && InvoiceId) {
      const invoice = await ProductInvoice.findById(InvoiceId).lean();

      if (!invoice) {
        return { success: false, message: "Invoice does not exist" };
      }

      const productAlreadyInInvoice = await ProductInvoice.findOne({
        _id: InvoiceId,
        "products.productId": existingProduct._id,
      }).lean();

      if (productAlreadyInInvoice) {
        await ProductInvoice.updateOne(
          {
            _id: InvoiceId,
            "products.productId": existingProduct._id,
          },
          {
            $set: {
              "products.$.oldPrice": existingProduct.price,
              "products.$.newPrice": newPriceInCents,
              "products.$.status": "PENDING",
            },
          },
        );
      } else {
        await ProductInvoice.findByIdAndUpdate(InvoiceId, {
          $push: {
            products: {
              productId: existingProduct._id,
              oldPrice: existingProduct.price,
              newPrice: newPriceInCents,
              status: "PENDING",
            },
          },
        });
      }
    }

    /**
     * Subsidy logic
     */
    const subsidyCategories = ["Fruits", "Vegetables", "Dairy"];
    const isSubsidized = subsidyCategories.includes(otherData.category);

    if (isSubsidized) {
      if (otherData.markup < 10 || otherData.markup > 35) {
        return {
          success: false,
          message:
            "For subsidised products, Markup must be between 10% and 35%",
        };
      }
    } else {
      if (otherData.markup < 0 || otherData.markup > 40) {
        return {
          success: false,
          message:
            "For non-subsidised products, Markup must be between 0% and 40%",
        };
      }
    }

    /**
     * Final DB update payload
     */
    const dbPayload = {
      ...otherData,
      images: images || [],
      tax: tax > 0 ? tax / 100 : 0,
      price: newPriceInCents,
      disposableFee: Math.round((disposableFee || 0) * 100),
      InvoiceId: InvoiceId || existingProduct.InvoiceId,
      subsidised: isSubsidized,
      isMeasuredInWeight,
      UOM,
      primaryUPC: newPrimaryUPC,
    };

    let updatedProduct;

    if (adminRole) {
      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: dbPayload },
        { returnDocument: "after" },
      );
    } else if (storeRole) {
      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          storeId: store?._id,
        },
        { $set: dbPayload },
        { returnDocument: "after" },
      );
    }

    if (!updatedProduct) {
      return {
        success: false,
        message:
          "Product not found or You don't have permission to update the product",
      };
    }

    /**
     * Cache revalidation
     */
    const targetStoreId =
      store?._id?.toString() || existingProduct.storeId.toString();

    const tagToBust = `products-${targetStoreId}`;

    revalidateTag(tagToBust, "max");

    console.log(
      `[Cache] Successfully marked tag '${tagToBust}' as stale via revalidateTag`,
    );

    if (adminRole) {
      revalidatePath(`/admin/store/${targetStoreId}/products`);
    } else if (storeRole) {
      revalidatePath(`/store/products`);
    }

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Something went wrong: ", error);

    return {
      success: false,
      message: "An error occurred while updating the product",
    };
  }
}
