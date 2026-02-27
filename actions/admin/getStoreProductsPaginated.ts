"use server";

import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import mongoose from "mongoose";

/**
 * Retrieves paginated products for a specific store.
 *
 * Fetches a subset of products belonging to the provided storeId,
 * using skip/limit pagination. Only selected fields are returned
 * to reduce payload size. Also calculates total document count
 * and total pages for frontend pagination control.
 *
 * @param {string} storeId - The MongoDB ObjectId of the store.
 * @param {number} [page=1] - The current page number.
 * @param {number} [limit=25] - Number of products per page.
 *
 * @returns {Promise<{
 *   success: boolean;
 *   data?: any[];
 *   totalPages?: number;
 *   currentPage?: number;
 *   totalCount?: number;
 *   error?: string;
 * }>}
 *
 * @example
 * const result = await getStoreProductsPaginated(storeId, 1, 25);
 * if (result.success) {
 *   console.log(result.data);
 *   console.log(result.totalPages);
 * }
 */

export const getStoreProductsPaginated = async (
  storeId: string,
  page: number = 1,
  limit: number = 25,
) => {
  try {
    await dbConnect();
    // takes the current page number and show the results, like page 1 will have 1-1 * 25 = 0, so it skips 0 products and show 25.
    const skip = (page - 1) * limit;

    // search for products and count the number of returned items
    const [products, totalCount] = await Promise.all([
      Product.find({ storeId: new mongoose.Types.ObjectId(storeId) })
        .select("_id name description category markup tax price stock subsidised images") // Added all the fields
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ storeId: new mongoose.Types.ObjectId(storeId) }), // This counts how many total products exist for that store.
    ]);
    const totalPages = Math.ceil(totalCount / limit); // divides total number of products with the limit to show page numbers
    const serializedProducts = JSON.parse(JSON.stringify(products));

    return {
      success: true,
      data: serializedProducts,
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to fetch paginated products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
};
