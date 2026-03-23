"use server";

import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import StoreModel from "@/db/models/store/store.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import ProductsModel from "@/db/models/store/products.model";
import CustomerModel from "@/db/models/customer/customer.model"; // Added Customer Model
import StorePayoutModel from "@/db/models/admin/storePayouts.model"; // Adjust path if needed

export interface StoreOverviewMetrics {
  storeName: string;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentPayout: number;
  pendingPayouts: number;
}

export async function getStoreMetricsAction(
  storeId: string,
): Promise<StoreOverviewMetrics> {
  try {
    await dbConnect();

    const objectId = new mongoose.Types.ObjectId(storeId);

    // Fetch all independent metrics in parallel
    const [
      store,
      totalOrders,
      totalProducts,
      totalUsers, // Changed variable name to reflect the direct count
      recentPayoutDoc,
      pendingPayoutsAgg,
    ] = await Promise.all([
      // 1. Get Store Name
      StoreModel.findById(objectId).select("name").lean(),

      // 2. Get Total Orders for this store
      OrderModel.countDocuments({ storeId: objectId }),

      // 3. Get Total Products belonging to this store
      ProductsModel.countDocuments({ storeId: objectId }),

      // 4. FIX: Count customers whose associatedStoreId matches this store
      CustomerModel.countDocuments({ associatedStoreId: objectId }),

      // 5. Get the most recent paid payout
      StorePayoutModel.findOne({ storeId: objectId, status: "paid" })
        .sort({ createdAt: -1 })
        .select("storePayout")
        .lean(),

      // 6. Aggregate the sum of all currently pending payouts
      StorePayoutModel.aggregate([
        { $match: { storeId: objectId, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$storePayout" } } },
      ]),
    ]);

    if (!store) {
      throw new Error("Store not found");
    }

    const recentPayout = recentPayoutDoc?.storePayout || 0;
    const pendingPayouts =
      pendingPayoutsAgg.length > 0 ? pendingPayoutsAgg[0].total : 0;

    return {
      // @ts-ignore
      storeName: store.name || "Unknown Store",
      totalOrders,
      totalProducts,
      totalUsers, // This is now directly an integer from CustomerModel.countDocuments
      recentPayout,
      pendingPayouts,
    };
  } catch (error) {
    console.error("[getStoreMetricsAction] Database error:", error);
    return {
      storeName: "Error loading store",
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      recentPayout: 0,
      pendingPayouts: 0,
    };
  }
}