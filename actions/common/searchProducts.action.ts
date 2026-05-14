"use server";

import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { ProductActionResponse } from "@/types/store/products.types";
import mongoose, { PipelineStage } from "mongoose";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";
import { cache as reactCache } from "react";

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

// UPDATED: Make path accept a string or array, and make fuzzy optional
type SearchClause = {
  text: {
    query: string;
    path: string | string[];
    fuzzy?: {
      maxEdits: number;
      prefixLength: number;
      maxExpansions: number;
    };
  };
};

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
 */

const fetchProductsDB = async (query: string, storeId?: string) => {
  await dbConnect();

  // If there is a search query, use MongoDB Atlas Search aggregation
  if (query && query.trim() !== "") {
    const cleanQuery = query.trim();

    // 1. Check if the search query can be parsed as a valid number for the UPC check
    const isNumeric = !isNaN(Number(cleanQuery)) && cleanQuery !== "";

    // 2. Build the 'should' clauses for the compound query
    const shouldClauses: SearchClause[] = [
      {
        text: {
          query: cleanQuery,
          path: ["name", "description", "category"],
          fuzzy: { maxEdits: 2, prefixLength: 1, maxExpansions: 50 },
        },
      },
    ];

    // 3. If it's a number, add a 'text' clause for the primaryUPC
    if (isNumeric) {
      shouldClauses.push({
        text: {
          path: "primaryUPC",
          query: cleanQuery,
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
};

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

    const products = await fetchProductsDB(searchQuery, targetStoreId);

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

/**
 * Exact match search for Candian Cart products by primaryUPC.
 * Skips fuzzy search and directly queries the database.
 * 
 * @param {string} upc - The exact UPC string to search for.
 * @param {string} [providedStoreId] - Optional store ID.
 * @returns {Promise<ProductActionResponse>} Success with matching products or an error message.
 */
export const searchProductsByUPC = async (
  upc: string,
  providedStoreId?: string,
): Promise<ProductActionResponse> => {
  try {
    await dbConnect();
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

    const cleanUPC = upc.trim();
    if (!cleanUPC) {
      return { success: false, error: "UPC cannot be empty." };
    }

    // Build the exact match query without using 'any'
    const findQuery: Record<string, string | mongoose.Types.ObjectId> = {
      primaryUPC: cleanUPC,
    };

    if (targetStoreId) {
      findQuery.storeId = new mongoose.Types.ObjectId(targetStoreId);
    }

    // Direct find instead of Atlas Search aggregate for exact match
    const products = await Product.find(findQuery).limit(10).lean();

    if (!products || products.length === 0) {
      return { success: false, error: "No products found for this UPC." };
    }

    // JSON Serialization for safe transfer to Client Components
    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    };
  } catch (error) {
    console.error("Product UPC search error:", error);
    return {
      success: false,
      error: "Failed to search products by UPC. Please try again later.",
    };
  }
};