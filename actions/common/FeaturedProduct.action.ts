"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import { revalidateTag, revalidatePath } from "next/cache";

export async function featuredProduct(
  productId: string,
  isFeatured: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    const product = await productsModel.findByIdAndUpdate(
      productId,
      { isFeatured },
      { returnDocument: "after" },
    );

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const tagToBust = `products-${product.storeId.toString()}`;
    revalidateTag(tagToBust, "max");
    revalidateTag("global-products", "max");
    revalidatePath("/admin/products");
    console.log(`[Cache] Successfully marked tag '${tagToBust}' as stale`);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to update product",
    };
  }
}


// remove after availability check
export async function availableProduct(
  productId: string,
  isAvailable: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    const product = await productsModel.findByIdAndUpdate(
      productId,
      { isAvailable },
      { returnDocument: "after" },
    );

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const tagToBust = `products-${product.storeId.toString()}`;
    revalidateTag(tagToBust, "max");
    revalidateTag("global-products", "max");
    revalidatePath("/admin/products");
    console.log(`[Cache] Successfully marked tag '${tagToBust}' as stale`);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to update product",
    };
  }
}
