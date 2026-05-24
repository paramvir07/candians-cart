"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { BurstCacheResponse } from "@/types/cache/ProductCache";

export async function burstGlobalProductsCache(): Promise<BurstCacheResponse> {
  try {
    // Bust the shared tag that ALL product cache entries are tagged with
    revalidateTag("global-products", "max");

    // Also revalidate the admin products path directly
    revalidatePath("/admin/products");

    console.log("[Cache] Global revalidation complete.");

    return {
      success: true,
      message: "Global cache successfully purged.",
    };
  } catch (error) {
    console.error("[Cache] Failed to burst global cache:", error);
    return {
      success: false,
      message: "An error occurred while bursting the global cache.",
    };
  }
}
