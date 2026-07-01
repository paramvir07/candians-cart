"use server";

import mongoose from "mongoose";
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
import { triggerImageGeneration } from "@/actions/inngestActions/generateImage";

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

    let store: any = null;
    let existingProduct: any = null;
    let updatedProduct: any = null;

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
      subsidised,
      ...otherData
    } = validationResult.data;

    const normalizedInvoiceId =
      InvoiceId && InvoiceId.trim() !== "" ? InvoiceId.trim() : undefined;

    const newPriceInCents = Math.round(price * 100);
    const priceHasChanged = existingProduct.price !== newPriceInCents;

    // const subsidyCategories = ["Fruits", "Vegetables", "Dairy"];
    // const isSubsidized = subsidyCategories.includes(otherData.category);

    const normalizedPrimaryUPC =
      typeof primaryUPC === "string" && primaryUPC.trim() !== ""
        ? primaryUPC.trim()
        : undefined;

    const existingPrimaryUPC = existingProduct.primaryUPC || undefined;

    const primaryUPCHasChanged = normalizedPrimaryUPC !== existingPrimaryUPC;

    if (primaryUPCHasChanged && normalizedPrimaryUPC) {
      const productWithSameUPC = await Product.findOne({
        primaryUPC: normalizedPrimaryUPC,
        storeId: existingProduct.storeId,
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
     * Store users must provide invoice only when changing price.
     * Admin can change invoice without price changing.
     */

    // Enable this later when InvoiceId should be required for store users
    // when changing the product price.
    //

    // if (storeRole && priceHasChanged && !normalizedInvoiceId) {
    //   return {
    //     success: false,
    //     message:
    //       "An Invoice Id is required when changing the price of a product",
    //   };
    // }

    /**
     * If invoice is provided, it must belong to the product's store.
     */
    if (normalizedInvoiceId) {
      const invoice = await ProductInvoice.findOne({
        _id: normalizedInvoiceId,
        storeId: existingProduct.storeId,
      }).lean();

      if (!invoice) {
        return {
          success: false,
          message: "Invoice does not exist for this product's store",
        };
      }
    }
    const dbPayload: any = {
      ...otherData,
      images: images || [],
      tax: tax > 0 ? tax / 100 : 0,
      price: newPriceInCents,
      disposableFee: Math.round((disposableFee || 0) * 100),
      subsidised,
      isMeasuredInWeight,
    };

    if (normalizedPrimaryUPC) {
      dbPayload.primaryUPC = normalizedPrimaryUPC;
    }
    if (normalizedInvoiceId) {
      dbPayload.InvoiceId = normalizedInvoiceId;
    }

    if (isMeasuredInWeight && typeof UOM === "string") {
      dbPayload.UOM = UOM.toLowerCase();
    }

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        if (normalizedInvoiceId) {
          const oldInvoiceId = existingProduct.InvoiceId?.toString();
          const newInvoiceId = normalizedInvoiceId.toString();

          if (oldInvoiceId && oldInvoiceId !== newInvoiceId) {
            await ProductInvoice.updateOne(
              {
                _id: oldInvoiceId,
                storeId: existingProduct.storeId,
              },
              {
                $pull: {
                  products: {
                    productId: existingProduct._id,
                  },
                },
              },
              { session: mongoSession },
            );
          }

          const productAlreadyInNewInvoice = await ProductInvoice.findOne({
            _id: newInvoiceId,
            storeId: existingProduct.storeId,
            "products.productId": existingProduct._id,
          }).session(mongoSession);

          if (productAlreadyInNewInvoice) {
            await ProductInvoice.updateOne(
              {
                _id: newInvoiceId,
                storeId: existingProduct.storeId,
                "products.productId": existingProduct._id,
              },
              {
                $set: {
                  "products.$.oldPrice": existingProduct.price,
                  "products.$.newPrice": newPriceInCents,
                  "products.$.status": "PENDING",
                },
              },
              { session: mongoSession },
            );
          } else {
            await ProductInvoice.updateOne(
              {
                _id: newInvoiceId,
                storeId: existingProduct.storeId,
              },
              {
                $push: {
                  products: {
                    productId: existingProduct._id,
                    oldPrice: existingProduct.price,
                    newPrice: newPriceInCents,
                    status: "PENDING",
                  },
                },
              },
              { session: mongoSession },
            );
          }
        }

        const unsetPayload: Record<string, ""> = {};

        if (InvoiceId === "") {
          unsetPayload.InvoiceId = "";
        }

        if (!normalizedPrimaryUPC) {
          unsetPayload.primaryUPC = "";
        }

        if (!isMeasuredInWeight) {
          unsetPayload.UOM = "";
        }

        const updateQuery =
          Object.keys(unsetPayload).length > 0
            ? {
                $set: dbPayload,
                $unset: unsetPayload,
              }
            : {
                $set: dbPayload,
              };

        if (adminRole) {
          updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateQuery,
            {
              returnDocument: "after",
              session: mongoSession,
            },
          );
        } else if (storeRole) {
          updatedProduct = await Product.findOneAndUpdate(
            {
              _id: productId,
              storeId: store._id,
            },
            updateQuery,
            {
              returnDocument: "after",
              session: mongoSession,
            },
          );
        }

        if (!updatedProduct) {
          throw new Error(
            "Product not found or you do not have permission to update the product",
          );
        }
      });
    } catch (error) {
      console.error("Transaction failed:", error);

      return {
        success: false,
        message: "Failed to update product and invoice",
      };
    } finally {
      await mongoSession.endSession();
    }

    /**
     * Delete removed images only after DB transaction succeeds.
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

    const targetStoreId =
      store?._id?.toString() || existingProduct.storeId.toString();

    const oldPrimaryFileId = existingProduct.images?.[0]?.fileId;
    const newPrimaryFileId = images?.[0]?.fileId;
    const imageHasChanged =
      newPrimaryFileId && newPrimaryFileId !== oldPrimaryFileId;

    if (imageHasChanged && images?.[0]) {
      await triggerImageGeneration(productId, images[0], targetStoreId);
    }

    const tagToBust = `products-${targetStoreId}`;

    revalidateTag(tagToBust, "max");

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
    console.error("Something went wrong:", error);

    return {
      success: false,
      message: "An error occurred while updating the product",
    };
  }
}
