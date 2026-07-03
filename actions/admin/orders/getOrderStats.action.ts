"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";
import { getAnalyticsBoundaries } from "@/lib/timezone";

export interface OrderStats {
  dailyOrders: number;
  monthlyOrders: number;
  totalOrders: number;
  totalRevenue: number; // calculated revenue sum in cents
}

interface RevenueAggResult {
  totalCartTotal: number;
  totalSubsidy: number;
  totalSubsidyUsed: number;
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

  // Strongly type the match object to eliminate explicit 'any' types
  const match: { storeId?: mongoose.Types.ObjectId } = {};
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

      // Extract only flat raw sum metrics from the database layer
      OrderModel.aggregate<RevenueAggResult>([
        { $match: match },
        {
          $group: {
            _id: null,
            totalCartTotal: { $sum: "$cartTotal" },
            totalSubsidy: { $sum: { $ifNull: ["$subsidy", 0] } },
            totalSubsidyUsed: { $sum: { $ifNull: ["$subsidyUsed", 0] } },
          },
        },
      ]),
    ]);

  // Extract raw sums with clean zero-fallback operators
  const rawRevenueStats = revenueAgg[0];
  const totalCustomerPaid = rawRevenueStats?.totalCartTotal ?? 0;
  const totalSubsidy = rawRevenueStats?.totalSubsidy ?? 0;
  const totalSubsidyUsed = rawRevenueStats?.totalSubsidyUsed ?? 0;

  // Execute your deliberate application-level calculations explicitly
  const paidAfterSubsidy = totalCustomerPaid - (totalSubsidy - totalSubsidyUsed);
  const totalRevenue = paidAfterSubsidy + totalSubsidy;

  return {
    dailyOrders,
    monthlyOrders,
    totalOrders,
    totalRevenue,
  };
}