"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import {
  ProductFormSchema,
  ProductFormValues,
} from "@/zod/validation/products/addProductsValidation";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function createProduct(
  data: ProductFormValues,
): Promise<ActionResponse> {
  const session = await getUserSession();
  const CurrentstoreId = session.user.id;

  try {
    const validationResult = ProductFormSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "validation failed",
        errors: validationResult.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }
    await dbConnect();

    const { price, disposableFee, tax, ...otherData } = validationResult.data;

    const dbPayload = {
      ...otherData,
      storeId: CurrentstoreId,
      tax: tax > 0 ? tax / 100 : 0, // converting percentage to decimal for storage
      price: Math.round(price * 100), // converting to cents
      disposableFee: Math.round((disposableFee || 0) * 100), // converting to cents}
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
