"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";
import { getAnalyticsBoundaries } from "@/lib/timezone";

export interface OrderStats {
  dailyOrders: number;
  monthlyOrders: number;
  totalOrders: number;
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

  const { utcStartOfDay, utcStartOfMonth } = getAnalyticsBoundaries();

  const [dailyOrders, monthlyOrders, totalOrders, revenueAgg] =
    await Promise.all([
      OrderModel.countDocuments({
        ...match,
        createdAt: { $gte: utcStartOfDay },
      }),
      OrderModel.countDocuments({
        ...match,
        createdAt: { $gte: utcStartOfMonth },
      }),
      OrderModel.countDocuments(match),

      OrderModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: ["$cartTotal", { $ifNull: ["$subsidy", 0] }],
              },
            },
          },
        },
      ]),
    ]);

  return {
    dailyOrders,
    monthlyOrders,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total ?? 0,
  };
}
