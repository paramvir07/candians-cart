"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";

export async function featuredProduct(
  productId: string,
  isFeatured: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    const result = await productsModel.findByIdAndUpdate(
      productId,
      { isFeatured },
      { new: true },
    );

    if (!result) {
      return { success: false, error: "Product not found" };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to update product",
    };
  }
}
