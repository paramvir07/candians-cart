"use server";

import { unstable_cache } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";
import { IProduct } from "@/types/store/products.types";

export interface ProductCacheFilters {
  categories?: string[];
  inStockOnly?: boolean;
  subsidisedOnly?: boolean;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "default";
}

export interface PaginatedProductsResponse {
  success: boolean;
  products: IProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  error?: string;
}

/**
 * Highly optimized caching layer for Candian Cart products.
 * Uses next/cache unstable_cache to persist results across requests.
 * Executes query and count in parallel to eliminate waterfalls.
 */
export const getCachedStoreProducts = async (
  storeId: string,
  page: number = 1,
  limit: number = 25,
  filters: ProductCacheFilters = { sortBy: "default", categories: [] },
): Promise<PaginatedProductsResponse> => {
  const filterKey = JSON.stringify(filters);

  // The cache key combines storeId, pagination, and filters so every unique view is cached
  const cacheKey = `store-products-${storeId}-p${page}-l${limit}-${filterKey}`;

  const fetchCachedData = unstable_cache(
    async () => {
      await dbConnect();

      const query: QueryFilter<typeof Product> = {
        storeId: new mongoose.Types.ObjectId(storeId),
      };
      if (filters.categories && filters.categories.length > 0) {
        query.category = { $in: filters.categories };
      }
      if (filters.inStockOnly) {
        query.stock = { $gt: 0 };
      }
      if (filters.subsidisedOnly) {
        query.subsidised = true;
      }

      // sorting logic
      let sortConfig: Record<string, 1 | -1> = {};
      if (filters.sortBy === "price_asc") sortConfig = { price: 1 };
      else if (filters.sortBy === "price_desc") sortConfig = { price: -1 };
      else if (filters.sortBy === "name_asc") sortConfig = { name: 1 };
      // Default: Featured products float to top, followed by newest
      else sortConfig = { isFeatured: -1, createdAt: -1 };

      const skipAmount = (page - 1) * limit;

      // execute in parallel
      const [products, totalCount] = await Promise.all([
        Product.find(query)
          .sort(sortConfig as any)
          .skip(skipAmount)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);

      return {
        products: JSON.parse(JSON.stringify(products)),
        totalCount,
      };
    },
    [cacheKey], // dependencies for cache invalidation
    {
      revalidate: 3600, // revalidate after every hour
      tags: [`products-${storeId}`], // tag for manual invalidation when products change
    },
  );

  try {
    const data = await fetchCachedData();

    return {
      success: true,
      products: data.products,
      totalCount: data.totalCount,
      totalPages: Math.ceil(data.totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching cached products:", error);
    return {
      success: false,
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      error: "Failed to fetch products",
    };
  }
};
