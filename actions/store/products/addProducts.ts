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
    const validationResult = ProductFormSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }

    const session = await getUserSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
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

    const { price, disposableFee, tax, images, ...otherData } =
      validationResult.data;

    const dbPayload = {
      ...otherData,
      storeId, // guaranteed defined now
      images: images ?? [],
      tax: tax > 0 ? tax / 100 : 0,
      price: Math.round(price * 100),
      disposableFee: Math.round((disposableFee ?? 0) * 100),
    };

    await Product.create(dbPayload);

    revalidatePath("/store/products");

    return { success: true, message: "Product created successfully" };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message: "An error occurred while creating the product",
    };
  }
}
