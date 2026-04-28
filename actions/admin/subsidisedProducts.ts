"use server";

import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { revalidateTag } from "next/cache";

/**
 * Marks a product as subsidised (admin-only action).
 *
 * Verifies that the current user has an "admin" role,
 * updates the specified product by setting `subsidised` to true,
 * and revalidates the relevant Next.js cache path.
 *
 * @param {string} productId - The MongoDB ObjectId of the product to update.
 * @returns {Promise<{ success: boolean; message?: string; error?: string }>}
 * Returns success with a confirmation message or an error response.
 *
 * @example
 * const result = await subsidisedProduct("65f2c9e8a3d4b123456789ab");
 * if (result.success) {
 *   console.log(result.message);
 * } else {
 *   console.error(result.error);
 * }
 */

export async function subsidisedProduct(
  productId: string,
  isSubsidised: boolean,
) {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorised: Admin accress required",
      };
    }
    await dbConnect();

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { subsidised: isSubsidised },
      { returnDocument: "after" },
    );

    if (!updatedProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const product = await Product.findById(productId).select("storeId").lean();
    if (product && product.storeId) {
      const tagToBust = `products-${product.storeId.toString()}`;
      revalidateTag(tagToBust, "max");
      console.log(`[Cache] Successfully marked tag '${tagToBust}' as stale`);
    }

    return {
      success: true,
      message: "Product successfully marked as subsidised.",
    };
  } catch (error) {
    console.error("Error subsidising product:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
