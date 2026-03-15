"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  subsidised: number;
  soldToday: number;
  soldWeekly: number;
  totalSold: number;
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

  const match: Record<string, any> = {};
  if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

  const orderMatch: Record<string, any> = {};
  if (storeId) orderMatch.storeId = new mongoose.Types.ObjectId(storeId);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
    // Sold today = sum of quantities in orders placed today
    OrderModel.aggregate([
      { $match: { ...orderMatch, createdAt: { $gte: startOfDay } } },
      { $unwind: "$products" },
      { $group: { _id: null, total: { $sum: "$products.quantity" } } },
    ]),
    OrderModel.aggregate([
      { $match: { ...orderMatch, createdAt: { $gte: startOfWeek } } },
      { $unwind: "$products" },
      { $group: { _id: null, total: { $sum: "$products.quantity" } } },
    ]),
    OrderModel.aggregate([
      { $match: orderMatch },
      { $unwind: "$products" },
      { $group: { _id: null, total: { $sum: "$products.quantity" } } },
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
