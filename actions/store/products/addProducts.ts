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
    const schema = createProductFormSchema(userRole);
    const validationResult = schema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }

    await dbConnect();

    let storeId = recievedStoreId;

    if (!storeId) {
      const store = await Store.findOne({ userId: session.user.id })
        .select("_id")
        .lean();

      if (!store?._id) {
        return { success: false, message: "Store not found" };
      }

      storeId = String(store._id); // ensure it's not undefined
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

    // Checks if the invoice Id exists when the role is Store, for admin no checking so it can bypass
    if (userRole === "store") {
      if (!InvoiceId) {
        return {
          success: false,
          message: "An Invoice Id is required when adding a new product",
        };
      }
      const invoice = await ProductInvoice.findById(InvoiceId);
      if (!invoice) {
        return { success: false, message: "Invoice does not exists" };
      }

      // Checks if the primary upc is unique or not
      // if (!primaryUPC) {
      //   return {
      //     success: false,
      //     message: "Primary UPC is required when adding a new product",
      //   };
      // }

      if (primaryUPC !== undefined) {
        const existingProduct = await Product.findOne({
          primaryUPC: Number(primaryUPC),
        }).lean();

        if (existingProduct) {
          return {
            success: false,
            message: `Primary UPC is already in use by another product: ${existingProduct.name || "Unknown Product"}`,
          };
        }
      }
    }

    const newPriceinCents = Math.round(price * 100);

    // Automatically sets the subsidy to true, if product category = Fruits, Vegetables, Dairy
    const subsidyCategories = ["Fruits", "Vegetables", "Dairy"];
    const isSubsidized = subsidyCategories.includes(otherData.category);

    if (subsidyCategories.includes(otherData.category)) {
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
      storeId, // guaranteed defined now
      images: images ?? [],
      tax: tax > 0 ? tax / 100 : 0,
      price: newPriceinCents,
      disposableFee: Math.round((disposableFee ?? 0) * 100),
      InvoiceId: InvoiceId || undefined,
      subsidised: isSubsidized,
      isMeasuredInWeight,
      UOM,
      primaryUPC: primaryUPC ? Number(primaryUPC) : undefined,
    };

    const newProduct = await Product.create(dbPayload);

    if (userRole === "store" && InvoiceId) {
      await ProductInvoice.findByIdAndUpdate(InvoiceId, {
        $push: {
          products: {
            productId: newProduct._id,
            newPrice: newPriceinCents,
            status: "PENDING",
          },
        },
      });
    }

    // BUST THE CACHE GLOBALLY FOR THIS STORE!
    const tagToBust = `products-${storeId}`;
    revalidateTag(tagToBust, "max");
    // Logging to verify it fired
    console.log(
      `[Cache] Successfully marked tag '${tagToBust}' as stale via revalidateTag`,
    );

    if (userRole === "store") {
      revalidatePath("/store/products");
    } else if (userRole === "admin" && recievedStoreId) {
      revalidatePath(`/admin/store/${recievedStoreId}/products`);
    }

    return { success: true, message: "Product created successfully" };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message: "An error occurred while creating the product",
    };
  }
}
