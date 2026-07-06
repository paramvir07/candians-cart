"use server";

import { unstable_cache } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import mongoose from "mongoose";
import type { QueryFilter, SortOrder } from "mongoose";
import { IProduct } from "@/types/store/products.types";

export interface ProductCacheFilters {
  categories?: string[];
  inStockOnly?: boolean;
  subsidisedOnly?: boolean;
  subsidyLevel?: "high" | "medium" | "low";
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "markup_desc"
    | "markup_asc"
    | "default";
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
 * Highly optimized caching layer for Candian's Cart products.
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
      if (filters.subsidyLevel) {
        query.subsidised = { $ne: true };
        query.markup = query.markup || {};
        if (filters.subsidyLevel === "low") {
          query.markup.$gte = 0;
          query.markup.$lt = 50;
        } else if (filters.subsidyLevel === "medium") {
          query.markup.$gte = 50;
          query.markup.$lt = 100;
        } else if (filters.subsidyLevel === "high") {
          query.markup.$gte = 100;
        }
      }

      const skipAmount = (page - 1) * limit;

      // Default sort needs a computed priority: high-markup NON-subsidised products
      // first (group 0), then everything else (subsidised, or markup < 100) mixed
      // together by markup (group 1). Plain field sort can't express this
      // conditional, so we use an aggregation pipeline with a computed sort key.
      if (!filters.sortBy || filters.sortBy === "default") {
        const basePipeline: mongoose.PipelineStage[] = [
          { $match: query },
          {
            $addFields: {
              sortGroup: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$markup", 100] },
                      { $ne: ["$subsidised", true] },
                    ],
                  },
                  0, // high markup, not subsidised -> top priority
                  1, // subsidised OR markup < 100 -> mixed second group
                ],
              },
            },
          },
        ];

        const [products, countResult] = await Promise.all([
          Product.aggregate([
            ...basePipeline,
            {
              $sort: {
                sortGroup: 1,
                markup: -1,
                isFeatured: -1,
                createdAt: -1,
                _id: 1,
              },
            },
            { $skip: skipAmount },
            { $limit: limit },
            { $project: { sortGroup: 0 } },
          ]),
          Product.aggregate([...basePipeline, { $count: "totalCount" }]),
        ]);

        return {
          products: JSON.parse(JSON.stringify(products)),
          totalCount: countResult[0]?.totalCount ?? 0,
        };
      }

      // sorting logic for explicit sort options
      let sortConfig: { [key: string]: SortOrder } = {};
      if (filters.sortBy === "price_asc") sortConfig = { price: 1, _id: 1 };
      else if (filters.sortBy === "price_desc")
        sortConfig = { price: -1, _id: -1 };
      else if (filters.sortBy === "name_asc") sortConfig = { name: 1, _id: 1 };
      else if (filters.sortBy === "markup_desc")
        sortConfig = { markup: -1, _id: -1 };
      else if (filters.sortBy === "markup_asc")
        sortConfig = { markup: 1, _id: 1 };

      const [products, totalCount] = await Promise.all([
        Product.find(query)
          .sort(sortConfig)
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
      revalidate: 86400,
      tags: [`products-${storeId}`, "global-products"],
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
