"use server";

import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { ProductActionResponse } from "@/types/store/products.types";
import mongoose, { PipelineStage } from "mongoose";

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

export const searchProducts = async (
  searchQuery: string = "",
  storeId?: string, // Optional: filter results by a specific store
): Promise<ProductActionResponse> => {
  try {
    await dbConnect();

    let products;

    if (searchQuery && searchQuery.trim() !== "") {
      // Build the aggregation pipeline
      const pipeline: PipelineStage[] = [
        {
          $search: {
            index: "ProductSearch", // Must match your Atlas Search Index name on the 'products' collection
            text: {
              query: searchQuery.trim(),
              path: ["name", "description", "category"], // Fields to perform fuzzy search on
              fuzzy: {
                maxEdits: 2, // Allows for typos
                prefixLength: 1,
                maxExpansions: 50,
              },
            },
          },
        },
      ];

      // If a storeId is provided, filter the search results to only that store
      if (storeId) {
        pipeline.push({
          $match: {
            storeId: new mongoose.Types.ObjectId(storeId),
          },
        });
      }

      // Limit the results to prevent massive payloads
      pipeline.push({ $limit: 20 });

      // Execute the aggregation
      products = await Product.aggregate(pipeline);
    } else {
      // Fallback: If no search query, return all products (or products for the specific store)
      const query = storeId
        ? { storeId: new mongoose.Types.ObjectId(storeId) }
        : {};
      products = await Product.find(query).lean();
    }

    if (!products) {
      return { success: false, error: `No products found` };
    }

    // Serialize to pass safely to Client Component (Handles ObjectIds and Dates)
    const serializedProducts = JSON.parse(JSON.stringify(products));

    return { success: true, data: serializedProducts };
  } catch (error) {
    console.error("Product search error:", error);
    return {
      success: false,
      error: `Failed to search products. Please try again later.`,
    };
  }
};
