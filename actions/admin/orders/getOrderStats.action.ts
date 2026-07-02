"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";
import { startOfDay, startOfMonth } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export interface OrderStats {
  dailyOrders: number;
  monthlyOrders: number;
  totalOrders: number;
  totalRevenue: number; // cartTotal sum in cents
}

const VANCOUVER_TZ = "America/Vancouver";

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

  const now = new Date(); // Current time (evaluates as UTC on Vercel)

  // 1. Shift current time to Vancouver time
  const vancouverNow = toZonedTime(now, VANCOUVER_TZ);

  // 2. Find the start of the day and month IN Vancouver
  const vancouverStartOfDay = startOfDay(vancouverNow);
  const vancouverStartOfMonth = startOfMonth(vancouverNow);

  // 3. Shift those boundaries back to real UTC Date objects for MongoDB
  const utcStartOfDay = fromZonedTime(vancouverStartOfDay, VANCOUVER_TZ);
  const utcStartOfMonth = fromZonedTime(vancouverStartOfMonth, VANCOUVER_TZ);

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
