"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { BurstCacheResponse } from "@/types/cache/ProductCache";

export async function burstStoreProductsCache(
  storeId: string,
): Promise<BurstCacheResponse> {
  if (!storeId) {
    return {
      success: false,
      message: "Store ID is required to revalidate cache.",
    };
  }
  try {
    const tagToBurst = `products-${storeId}`;
    revalidateTag(tagToBurst, "max");

    console.log(`Cache revalidation triggered for tag: ${tagToBurst}`);

    revalidatePath(`/admin/store/${storeId}/products`);

    return {
      success: true,
      message: `Cache revalidation triggered for store ${storeId}.`,
    };
  } catch (error) {
    console.error("[Cache] Failed to burst cache:", error);
    return {
      success: false,
      message: "An error occurred while bursting the cache. Please try again.",
    };
  }
}
