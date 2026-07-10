"use server";

import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import mongoose from "mongoose";
import { ProductCategory, TaxRate } from "@/types/store/products.types";

export interface ProductFilters {
  categories?: ProductCategory[];
  minPrice?: number; // in cents
  maxPrice?: number; // in cents
  subsidised?: boolean;
  subsidyLevels?: ("low" | "medium" | "high")[];
  inStock?: boolean;
  taxRates?: TaxRate[];
  markupMin?: number;
  markupMax?: number;
  sortBy?:
    | "recommended"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "markup_desc"
    | "markup_asc";
}

export const getStoreProductsFiltered = async (
  storeId: string | undefined,
  page: number = 1,
  limit: number = 12,
  filters: ProductFilters = {},
) => {
  try {
    await dbConnect();

    const query: Record<string, any> = {};

    if (storeId) {
      query.storeId = new mongoose.Types.ObjectId(storeId);
    }

    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.subsidised === true) query.subsidised = true;

    if (filters.inStock !== undefined) {
      const isFilterInStock =
        filters.inStock === true || String(filters.inStock) === "true";
      query.stock = isFilterInStock;
    }

    if (filters.taxRates && filters.taxRates.length > 0) {
      query.tax = { $in: filters.taxRates };
    }

    if (filters.markupMin !== undefined || filters.markupMax !== undefined) {
      query.markup = {};
      if (filters.markupMin !== undefined)
        query.markup.$gte = filters.markupMin;
      if (filters.markupMax !== undefined)
        query.markup.$lte = filters.markupMax;
    }

    if (filters.subsidyLevels && filters.subsidyLevels.length > 0) {
      query.subsidised = { $ne: true };

      const rangeConditions = filters.subsidyLevels.map((level) => {
        if (level === "low") return { markup: { $gte: 0, $lt: 50 } };
        if (level === "medium") return { markup: { $gte: 50, $lt: 100 } };
        return { markup: { $gte: 100 } }; // "high"
      });

      // Merge with any existing $or from other filters (none exist currently in this
      // function, but this keeps it safe if markupMin/markupMax logic changes later)
      query.$or = rangeConditions;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };
    if (filters.sortBy === "price_asc") sortOption = { price: 1, _id: 1 };
    else if (filters.sortBy === "price_desc")
      sortOption = { price: -1, _id: -1 };
    else if (filters.sortBy === "name_asc") {
      sortOption = { name: 1, _id: 1 };
    } else if (filters.sortBy === "markup_desc")
      sortOption = { markup: -1, _id: -1 };
    else if (filters.sortBy === "markup_asc")
      sortOption = { markup: 1, _id: 1 };

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select(
          "_id name description category markup tax price stock subsidised images disposableFee isFeatured UOM isMeasuredInWeight primaryUPC isAvailable",
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to fetch filtered products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
};

export const searchProductsWithFilters = async (
  query: string,
  storeId: string | undefined,
  page: number = 1,
  limit: number = 12,
  filters: ProductFilters = {},
) => {
  try {
    await dbConnect();

    // --- UPC exact match first (no spaces = could be a barcode) ---
    // const looksLikeUPC = /^[a-zA-Z0-9\-]+$/.test(query.trim()) && !query.includes(" ");
    const looksLikeUPC =
      /^[0-9\-]+$/.test(query.trim()) && !query.includes(" ");
    if (looksLikeUPC) {
      const upcQuery: Record<string, any> = { primaryUPC: query.trim() };
      if (storeId) upcQuery.storeId = new mongoose.Types.ObjectId(storeId);
      // const exactMatches = await Product.find(upcQuery).limit(10).lean();
      const exactMatches = await Product.aggregate([
        { $match: upcQuery },
        { $limit: 10 },
        {
          $lookup: {
            from: "stores",
            localField: "storeId",
            foreignField: "_id",
            as: "store",
          },
        },
        { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
        { $addFields: { storeName: "$store.name" } },
        { $project: { store: 0 } },
      ]);
      if (exactMatches.length > 0) {
        return {
          success: true,
          data: JSON.parse(JSON.stringify(exactMatches)),
          totalPages: 1,
          currentPage: 1,
          totalCount: exactMatches.length,
        };
      }
    }

    // --- Atlas fuzzy search pipeline ---
    const pipeline: any[] = [
      {
        $search: {
          index: "ProductSearch",
          compound: {
            should: [
              {
                text: {
                  query: query.trim(),
                  path: ["name", "description", "category"],
                  fuzzy: { maxEdits: 2, prefixLength: 1, maxExpansions: 50 },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
    ];

    // --- Post-search filters via $match ---
    const matchStage: Record<string, any> = {};

    if (storeId) matchStage.storeId = new mongoose.Types.ObjectId(storeId);
    if (filters.categories && filters.categories.length > 0)
      matchStage.category = { $in: filters.categories };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      matchStage.price = {};
      if (filters.minPrice !== undefined)
        matchStage.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined)
        matchStage.price.$lte = filters.maxPrice;
    }
    if (filters.subsidised === true) matchStage.subsidised = true;

    if (filters.inStock !== undefined) {
      const isFilterInStock =
        filters.inStock === true || String(filters.inStock) === "true";
      matchStage.stock = isFilterInStock;
    }

    if (filters.taxRates && filters.taxRates.length > 0)
      matchStage.tax = { $in: filters.taxRates };

    if (filters.markupMin !== undefined || filters.markupMax !== undefined) {
      matchStage.markup = {};

      if (filters.markupMin !== undefined)
        matchStage.markup.$gte = filters.markupMin;

      if (filters.markupMax !== undefined)
        matchStage.markup.$lte = filters.markupMax;
    }

    if (filters.subsidyLevels && filters.subsidyLevels.length > 0) {
      matchStage.subsidised = { $ne: true };

      const rangeConditions = filters.subsidyLevels.map((level) => {
        if (level === "low") return { markup: { $gte: 0, $lt: 50 } };
        if (level === "medium") return { markup: { $gte: 50, $lt: 100 } };
        return { markup: { $gte: 100 } }; // "high"
      });

      matchStage.$or = rangeConditions;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // --- Sort ---
    if (filters.sortBy === "price_asc")
      pipeline.push({ $sort: { price: 1, _id: 1 } });
    else if (filters.sortBy === "price_desc")
      pipeline.push({ $sort: { price: -1, _id: -1 } });
    else if (filters.sortBy === "name_asc")
      pipeline.push({ $sort: { name: 1, _id: 1 } });
    else if (filters.sortBy === "markup_desc")
      pipeline.push({ $sort: { markup: -1, _id: -1 } });
    else if (filters.sortBy === "markup_asc")
      pipeline.push({ $sort: { markup: 1, _id: 1 } });
    // default: Atlas search score order (most relevant first)

    // ADD these three stages right before the $project push
    pipeline.push(
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      { $addFields: { storeName: "$store.name" } },
    );

    // UPDATE the $project to include storeId and storeName
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        category: 1,
        markup: 1,
        tax: 1,
        price: 1,
        stock: 1,
        subsidised: 1,
        images: 1,
        disposableFee: 1,
        isFeatured: 1,
        UOM: 1,
        isMeasuredInWeight: 1,
        primaryUPC: 1,
        storeId: 1,
        storeName: 1,
        isAvailable: 1,
      },
    });

    // --- Count total (before pagination) ---
    const countPipeline = [...pipeline, { $count: "total" }];
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const [products, countResult] = await Promise.all([
      Product.aggregate(pipeline),
      Product.aggregate(countPipeline),
    ]);

    const totalCount = countResult[0]?.total ?? 0;

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to search with filters:", error);
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: "Failed to search",
    };
  }
};
