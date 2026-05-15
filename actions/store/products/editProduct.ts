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
      ...otherData
    } = validationResult.data;

    const newPriceInCents = Math.round(price * 100);
    const priceHasChanged = existingProduct.price !== newPriceInCents;

    const subsidyCategories = ["Fruits", "Vegetables", "Dairy"];
    const isSubsidized = subsidyCategories.includes(otherData.category);

    const newPrimaryUPC = primaryUPC;

    const primaryUPCHasChanged =
      newPrimaryUPC !== undefined &&
      existingProduct.primaryUPC !== newPrimaryUPC;

    if (primaryUPCHasChanged) {
      const productWithSameUPC = await Product.findOne({
        primaryUPC: newPrimaryUPC,
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
    if (storeRole && priceHasChanged && !InvoiceId) {
      return {
        success: false,
        message:
          "An Invoice Id is required when changing the price of a product",
      };
    }

    /**
     * If invoice is provided, it must belong to the product's store.
     */
    if (InvoiceId) {
      const invoice = await ProductInvoice.findOne({
        _id: InvoiceId,
        storeId: existingProduct.storeId,
      }).lean();

      if (!invoice) {
        return {
          success: false,
          message: "Invoice does not exist for this product's store",
        };
      }
    }

    const dbPayload = {
      ...otherData,
      images: images || [],
      tax: tax > 0 ? tax / 100 : 0,
      price: newPriceInCents,
      disposableFee: Math.round((disposableFee || 0) * 100),
      InvoiceId: InvoiceId ?? existingProduct.InvoiceId,
      subsidised: isSubsidized,
      isMeasuredInWeight,
      UOM,
      primaryUPC: newPrimaryUPC,
    };

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        if (InvoiceId) {
          const oldInvoiceId = existingProduct.InvoiceId?.toString();
          const newInvoiceId = InvoiceId.toString();

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

        if (adminRole) {
          const adminDbPayload: any = { ...dbPayload };

          const adminUpdateQuery =
            InvoiceId === ""
              ? {
                  $set: adminDbPayload,
                  $unset: { InvoiceId: "" },
                }
              : {
                  $set: adminDbPayload,
                };

          if (InvoiceId === "") {
            delete adminDbPayload.InvoiceId;
          }

          updatedProduct = await Product.findByIdAndUpdate(
            productId,
            adminUpdateQuery,
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
            { $set: dbPayload },
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
