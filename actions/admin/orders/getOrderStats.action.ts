"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";

export interface OrderStats {
  dailyOrders: number;
  monthlyOrders: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number; // cartTotal sum in cents
}

/**
 * Compute order stats.
 * - Pass storeId to scope to one store (used by store side + admin store detail).
 * - Omit for platform-wide admin stats.
 */
export async function getOrderStats(
  storeId?: string | null,
): Promise<OrderStats> {
  await dbConnect();

  const match: Record<string, any> = {};
  if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    dailyOrders,
    monthlyOrders,
    totalOrders,
    pendingOrders,
    completedOrders,
    revenueAgg,
  ] = await Promise.all([
    OrderModel.countDocuments({ ...match, createdAt: { $gte: startOfDay } }),
    OrderModel.countDocuments({ ...match, createdAt: { $gte: startOfMonth } }),
    OrderModel.countDocuments(match),
    OrderModel.countDocuments({ ...match, status: "pending" }),
    OrderModel.countDocuments({ ...match, status: "completed" }),
    OrderModel.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$cartTotal" } } },
    ]),
  ]);

  return {
    dailyOrders,
    monthlyOrders,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: revenueAgg[0]?.total ?? 0,
  };
}
