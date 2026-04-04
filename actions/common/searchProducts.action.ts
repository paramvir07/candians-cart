"use server";

import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { ProductActionResponse } from "@/types/store/products.types";
import mongoose, { PipelineStage } from "mongoose";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";
import { cache as reactCache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Deduplicated fetch for customer profile within a single request.
 *
 */
const getCustomerProfile = reactCache(async (userId: string) => {
  await dbConnect();
  return await Customer.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();
});

/**
 * Searches products using MongoDB Atlas full-text search with optional store filtering.
 *
 * If a search query is provided, performs a fuzzy text search on
 * name, description, and category fields using the "ProductSearch" index.
 * Results can optionally be restricted to a specific store.
 * Search results are limited to 20 documents.
 *
 * If no search query is provided, returns all products or
 * only products belonging to the specified store.
 *
 * Returned documents are serialized into JSON-safe objects.
 *
 * @param {string} [searchQuery=""] - Optional text input for fuzzy search.
 * @param {string} [storeId] - Optional store ID to restrict results to a specific store.
 * @returns {Promise<ProductActionResponse>} Success with matching products or an error message.
 *
 * @example
 * const result = await searchProducts("milk", "65f2c9e8a3d4b123456789ab");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */

/**
 * Cached product search logic using Next.js unstable_cache.
 *
 */
const getCachedProducts = (query: string, storeId?: string) =>
  unstable_cache(
    async () => {
      await dbConnect();

      // If there is a search query, use MongoDB Atlas Search aggregation
      if (query && query.trim() !== "") {
        const cleanQuery = query.trim();

        // 1. Check if the search query can be parsed as a valid number for the UPC check
        const parsedNumber = Number(cleanQuery);
        const isNumeric = !isNaN(parsedNumber) && cleanQuery !== "";

        // 2. Build the 'should' clauses for the compound query
        const shouldClauses: any[] = [
          {
            text: {
              query: cleanQuery,
              path: ["name", "description", "category"],
              fuzzy: { maxEdits: 2, prefixLength: 1, maxExpansions: 50 },
            },
          },
        ];

        // 3. If it's a number, add an 'equals' clause for the primaryUPC
        if (isNumeric) {
          shouldClauses.push({
            equals: {
              path: "primaryUPC",
              value: parsedNumber,
            },
          });
        }

        const pipeline: PipelineStage[] = [
          {
            $search: {
              index: "ProductSearch",
              // Use a compound query to match EITHER the text fields OR the UPC
              compound: {
                should: shouldClauses,
                minimumShouldMatch: 1,
              },
            },
          },
        ];

        if (storeId) {
          pipeline.push({
            $match: { storeId: new mongoose.Types.ObjectId(storeId) },
          });
        }

        pipeline.push({ $limit: 20 });
        return await Product.aggregate(pipeline);
      }

      // Fallback for no query: return all products or store-specific products
      const findQuery = storeId
        ? { storeId: new mongoose.Types.ObjectId(storeId) }
        : {};
      return await Product.find(findQuery).limit(50).lean();
    },
    [`product-search-${query}-${storeId}`],
    { revalidate: 3600, tags: ["products"] },
  )();

/**
 * Role-aware search for Candian Cart.
 *
 */

export const searchProducts = async (
  searchQuery: string = "",
  providedStoreId?: string,
): Promise<ProductActionResponse> => {
  try {
    const session = await getUserSession();
    const { id: userId, role } = session.user;

    let targetStoreId = providedStoreId;

    // Enforcement Rule: Customers MUST only see their associated store
    if (role === "customer") {
      const customer = await getCustomerProfile(userId);
      if (!customer?.associatedStoreId) {
        return {
          success: false,
          error: "Associated store not found for customer.",
        };
      }
      targetStoreId = customer.associatedStoreId.toString();
    }
    // Roles like 'admin', 'store', or 'cashier' use the providedStoreId if available

    const products = await getCachedProducts(searchQuery, targetStoreId);

    if (!products) {
      return { success: false, error: "No products found in Candian Cart." };
    }

    // JSON Serialization for safe transfer to Client Components
    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    };
  } catch (error) {
    console.error("Product search error:", error);
    return {
      success: false,
      error: "Failed to search products. Please try again later.",
    };
  }
};
