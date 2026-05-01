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
import ProductInvoice from "@/db/models/store/invoice.model";

interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function createProduct(
  data: ProductFormValues,
  recievedStoreId?: string,
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

    let storeId: string | undefined = recievedStoreId;

    if (!storeId) {
      const store = await Store.findOne({ userId: session.user.id })
        .select("_id")
        .lean();

      if (!store?._id) {
        return { success: false, message: "Store not found" };
      }

      storeId = String(store._id);
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

    if (storeRole && !InvoiceId) {
      return {
        success: false,
        message: "An Invoice Id is required when adding a new product",
      };
    }

    /**
     * If invoice is provided, validate that it belongs to this store.
     * Store: required
     * Admin: optional, but if provided must be valid
     */
    if (InvoiceId) {
      const invoice = await ProductInvoice.findOne({
        _id: InvoiceId,
        storeId,
      }).lean();

      if (!invoice) {
        return {
          success: false,
          message: "Invoice does not exist for this store",
        };
      }
    }

    /**
     * UPC should be unique inside same store.
     */
    if (primaryUPC !== undefined && primaryUPC !== null) {
      const existingProduct = await Product.findOne({
        primaryUPC: Number(primaryUPC),
        storeId,
      }).lean();

      if (existingProduct) {
        return {
          success: false,
          message: `Primary UPC is already in use by another product: ${
            existingProduct.name || "Unknown Product"
          }`,
        };
      }
    }

    const newPriceInCents = Math.round(price * 100);

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

    const dbPayload = {
      ...otherData,
      storeId,
      images: images ?? [],
      tax: tax > 0 ? tax / 100 : 0,
      price: newPriceInCents,
      disposableFee: Math.round((disposableFee ?? 0) * 100),
      InvoiceId: InvoiceId || undefined,
      subsidised: isSubsidized,
      isMeasuredInWeight,
      UOM,
      primaryUPC:
        primaryUPC !== undefined && primaryUPC !== null
          ? Number(primaryUPC)
          : undefined,
    };

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        const createdProducts = await Product.create([dbPayload], {
          session: mongoSession,
        });

        const newProduct = createdProducts[0];

        if (!newProduct) {
          throw new Error("Failed to create product");
        }

        /**
         * Invoice logic:
         * If InvoiceId exists, add newly created product into invoice products.
         * This is inside transaction, so product create + invoice update succeed/fail together.
         */
        if (InvoiceId) {
          await ProductInvoice.updateOne(
            {
              _id: InvoiceId,
              storeId,
            },
            {
              $push: {
                products: {
                  productId: newProduct._id,
                  newPrice: newPriceInCents,
                  status: "PENDING",
                },
              },
            },
            { session: mongoSession },
          );
        }
      });
    } catch (error) {
      console.error("Transaction failed:", error);

      return {
        success: false,
        message: "Failed to create product and update invoice",
      };
    } finally {
      await mongoSession.endSession();
    }

    const tagToBust = `products-${storeId}`;

    revalidateTag(tagToBust, "max");

    console.log(
      `[Cache] Successfully marked tag '${tagToBust}' as stale via revalidateTag`,
    );

    if (storeRole) {
      revalidatePath("/store/products");
    } else if (adminRole && recievedStoreId) {
      revalidatePath(`/admin/store/${recievedStoreId}/products`);
    }

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);

    return {
      success: false,
      message: "An error occurred while creating the product",
    };
  }
}
