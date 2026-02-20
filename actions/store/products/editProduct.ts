"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import {
  ProductFormSchema,
  ProductFormValues,
} from "@/zod/schemas/store/addProductsValidation";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import StoreInfo from "@/db/models/store/storeInfo.model";
import { zodErrorResponse } from "@/zod/validation/error";

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

    const validationResult = ProductFormSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = zodErrorResponse(validationResult);
      return { success: false, message: errorMessage || "Validation error" };
    }
    
    await dbConnect();
    const store = await StoreInfo.findOne({ userId: session.user.id }).lean();
    if (!store)
      return {
        success: false,
        message: "Store not found",
      };
    const { price, disposableFee, tax, ...otherData } = validationResult.data;

    const dbPayload = {
      ...otherData,
      // Converting percentage to decimal
      tax: tax > 0 ? tax / 100 : 0,
      // Converting Dollars to cents
      price: Math.round(price * 100),
      // converting dollars to cents
      disposableFee: Math.round((disposableFee || 0) * 100),
    };

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, storeId: store._id },
      { $set: dbPayload },
      { new: true }, // Returns the updated document
    );

    if (!updatedProduct) {
      return {
        success: false,
        message:
          "Product not found or You dont have permission to update the product",
      };
    }
    revalidatePath("/store/products");
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
