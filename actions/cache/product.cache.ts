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

// ✅ Factory defined at module level — Next.js can properly track this cache entry
const createCachedFetcher = (
  storeId: string,
  page: number,
  limit: number,
  filters: ProductCacheFilters,
) => {
  const filterKey = JSON.stringify(filters);
  const cacheKey = `store-products-${storeId}-p${page}-l${limit}-${filterKey}`;

  return unstable_cache(
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

      let sortConfig: Record<string, 1 | -1> = {};
      if (filters.sortBy === "price_asc") sortConfig = { price: 1 };
      else if (filters.sortBy === "price_desc") sortConfig = { price: -1 };
      else if (filters.sortBy === "name_asc") sortConfig = { name: 1 };
      else sortConfig = { isFeatured: -1, createdAt: -1 };

      const skipAmount = (page - 1) * limit;

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
    [cacheKey],
    {
      revalidate: 3600,
      tags: [`products-${storeId}`],
    },
  );
};

export const getCachedStoreProducts = async (
  storeId: string,
  page: number = 1,
  limit: number = 25,
  filters: ProductCacheFilters = { sortBy: "default", categories: [] },
): Promise<PaginatedProductsResponse> => {
  try {
    const fetchCachedData = createCachedFetcher(storeId, page, limit, filters);
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