"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import { revalidateTag } from "next/cache";

export async function featuredProduct(
  productId: string,
  isFeatured: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    const result = await productsModel.findByIdAndUpdate(
      productId,
      { isFeatured },
      { returnDocument: "after" },
    );

    if (!result) {
      return { success: false, error: "Product not found" };
    }
    // 1. Add 'await'
    // 2. Destructure the storeId (because select() returns an object like { _id: '...', storeId: '...' })
    const product = await productsModel
      .findById(productId)
      .select("storeId")
      .lean();

    if (product && product.storeId) {
      const tagToBust = `products-${product.storeId.toString()}`;
      revalidateTag(tagToBust, "max");
      console.log(`[Cache] Successfully marked tag '${tagToBust}' as stale`);
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to update product",
    };
  }
}
