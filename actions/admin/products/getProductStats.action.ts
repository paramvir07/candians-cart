"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";
import { getAnalyticsBoundaries } from "@/lib/timezone";

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  subsidised: number;
  soldToday: number;
  soldWeekly: number;
  totalSold: number;
}

interface StatFilterQuery {
  storeId?: mongoose.Types.ObjectId;
  stock?: boolean;
  subsidised?: boolean;
}

interface AggregationResult {
  _id: null;
  total: number;
}

/**
 * Compute product stats.
 * - Pass storeId to scope to one store.
 * - Omit for platform-wide admin stats.
 */
export async function getProductStats(
  storeId?: string | null,
): Promise<ProductStats> {
  await dbConnect();

  const match: StatFilterQuery = {};
  if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

  const orderMatch: StatFilterQuery = {};
  if (storeId) orderMatch.storeId = new mongoose.Types.ObjectId(storeId);

  // 1. Fetch exactly the boundaries you need from your central timezone utility
  const { utcStartOfDay, utcRolling7Days } = getAnalyticsBoundaries();

  const [
    totalProducts,
    inStock,
    subsidised,
    soldTodayAgg,
    soldWeeklyAgg,
    totalSoldAgg,
  ] = await Promise.all([
    productsModel.countDocuments(match),
    productsModel.countDocuments({ ...match, stock: true }),
    productsModel.countDocuments({ ...match, subsidised: true }),

    // Sold today
    OrderModel.aggregate<AggregationResult>([
      { $match: { ...orderMatch, createdAt: { $gte: utcStartOfDay } } },
      {
        $addFields: {
          combinedItems: {
            $concatArrays: [
              { $ifNull: ["$products", []] },
              { $ifNull: ["$subsidyItems", []] },
            ],
          },
        },
      },
      { $unwind: "$combinedItems" },
      {
        $group: {
          _id: null,
          total: { $sum: { $ceil: "$combinedItems.quantity" } },
        },
      },
    ]),

    // Sold weekly (Rolling 7 days)
    OrderModel.aggregate<AggregationResult>([
      { $match: { ...orderMatch, createdAt: { $gte: utcRolling7Days } } },
      {
        $addFields: {
          combinedItems: {
            $concatArrays: [
              { $ifNull: ["$products", []] },
              { $ifNull: ["$subsidyItems", []] },
            ],
          },
        },
      },
      { $unwind: "$combinedItems" },
      {
        $group: {
          _id: null,
          total: { $sum: { $ceil: "$combinedItems.quantity" } },
        },
      },
    ]),

    // Total Sold
    OrderModel.aggregate<AggregationResult>([
      { $match: orderMatch },
      {
        $addFields: {
          combinedItems: {
            $concatArrays: [
              { $ifNull: ["$products", []] },
              { $ifNull: ["$subsidyItems", []] },
            ],
          },
        },
      },
      { $unwind: "$combinedItems" },
      {
        $group: {
          _id: null,
          total: { $sum: { $ceil: "$combinedItems.quantity" } },
        },
      },
    ]),
  ]);

  return {
    totalProducts,
    inStock,
    outOfStock: totalProducts - inStock,
    subsidised,
    soldToday: soldTodayAgg[0]?.total ?? 0,
    soldWeekly: soldWeeklyAgg[0]?.total ?? 0,
    totalSold: totalSoldAgg[0]?.total ?? 0,
  };
}
