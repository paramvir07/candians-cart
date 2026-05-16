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
  inStock?: boolean;
  taxRates?: TaxRate[];
  markupMin?: number;
  markupMax?: number;
  sortBy?: "recommended" | "price_asc" | "price_desc" | "name_asc";
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

    if (filters.subsidised !== undefined) {
      query.subsidised = filters.subsidised;
    }

    if (filters.inStock !== undefined) {
      query.stock = filters.inStock;
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

    let sortOption: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };
    if (filters.sortBy === "price_asc") sortOption = { price: 1, _id: 1 };
    else if (filters.sortBy === "price_desc")
      sortOption = { price: -1, _id: -1 };
    else if (filters.sortBy === "name_asc") {
      sortOption = { name: 1, _id: 1 };
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select(
          "_id name description category markup tax price stock subsidised images disposableFee isFeatured",
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

// ------

export const searchProductsWithFilters = async (
  query: string,
  storeId: string | undefined,
  page: number = 1,
  limit: number = 12,
  filters: ProductFilters = {},
) => {
  try {
    await dbConnect();

    const match: Record<string, any> = {
      name: { $regex: query, $options: "i" },
    };

    if (storeId) {
      match.storeId = new mongoose.Types.ObjectId(storeId);
    }

    if (filters.categories && filters.categories.length > 0) {
      match.category = { $in: filters.categories };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      match.price = {};
      if (filters.minPrice !== undefined) match.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) match.price.$lte = filters.maxPrice;
    }

    if (filters.subsidised !== undefined) match.subsidised = filters.subsidised;
    if (filters.inStock !== undefined) match.stock = filters.inStock;

    if (filters.taxRates && filters.taxRates.length > 0) {
      match.tax = { $in: filters.taxRates };
    }

    if (filters.markupMin !== undefined || filters.markupMax !== undefined) {
      match.markup = {};
      if (filters.markupMin !== undefined)
        match.markup.$gte = filters.markupMin;
      if (filters.markupMax !== undefined)
        match.markup.$lte = filters.markupMax;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (filters.sortBy === "price_asc") sortOption = { price: 1 };
    else if (filters.sortBy === "price_desc") sortOption = { price: -1 };
    else if (filters.sortBy === "name_asc") sortOption = { name: 1 };

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(match)
        .select(
          "_id name description category markup tax price stock subsidised images disposableFee isFeatured",
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(match),
    ]);

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
