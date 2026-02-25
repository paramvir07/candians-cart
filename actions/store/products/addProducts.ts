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
): Promise<ActionResponse> {
  try {
    const session = await getUserSession();

    // Validate the incoming JSON data using Zod
    const validationResult = ProductFormSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }

    await dbConnect();

    const store = await Store.findOne({ userId: session.user.id }).lean();
    if (!store) {
      return {
        success: false,
        message: "Store not found",
      };
    }
      
    // Extract images along with other data
    const { price, disposableFee, tax, images, ...otherData } = validationResult.data;

    const dbPayload = {
      ...otherData,
      storeId: store._id,
      images: images || [], // Save the ImageKit array to the database
      tax: tax > 0 ? tax / 100 : 0, // Converting percentage to decimal for storage
      price: Math.round(price * 100), // Converting to cents
      disposableFee: Math.round((disposableFee || 0) * 100), // Converting to cents
    };

    await Product.create(dbPayload);

    revalidatePath("/store/products");
    
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