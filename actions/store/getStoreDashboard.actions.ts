"use server";

import { dbConnect } from "@/db/dbConnect";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import productsModel from "@/db/models/store/products.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import mongoose from "mongoose";
import { getUserSession } from "../auth/getUserSession.actions";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface StoreDashboardStats {
  totalProducts: number;
  productGrowthPercent: number;
  totalOrders: number;
  orderGrowthPercent: number;
  totalRevenue: number; // all-time sum of storePayout (cents)
  revenueGrowthPercent: number;
  storeUsers: number; // customers associated with this store
  newUsersRecently: number; // new this month
}

export interface StoreRecentOrder {
  orderId: string;
  customerName: string;
  amount: number; // cartTotal in cents
  status: "pending" | "completed";
  paymentMode: "wallet" | "cash" | "card" | "pending";
  createdAt: Date;
}

export interface StoreRecentPayout {
  payoutId: string;
  weekLabel: string; // e.g. "July 22-28"
  amount: number; // storePayout in cents
  status: "pending" | "paid";
  startDate: Date;
  endDate: Date;
}

export interface StoreDashboardData {
  storeId: string;
  stats: StoreDashboardStats;
  recentOrders: StoreRecentOrder[];
  recentPayouts: StoreRecentPayout[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function growthPercent(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

function formatWeekLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const s = new Date(start).toLocaleDateString("en-CA", opts);
  const eDay = new Date(end).getDate();
  return `${s.replace(",", "")}–${eDay}`;
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function getStoreDashboardData(): Promise<StoreDashboardData> {
  await dbConnect();

  // Resolve the store that belongs to the logged-in user
  const session = await getUserSession();
  const storeDoc = await Store.findOne({ userId: session.user.id })
    .select("_id")
    .lean();

  if (!storeDoc) throw new Error("Store not found for this user");

  const storeId = (storeDoc as any)._id as mongoose.Types.ObjectId;
  const storeIdStr = storeId.toString();

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalProducts,
    productsLastMonth,
    productsThisMonth,

    totalOrders,
    ordersLastMonth,
    ordersThisMonth,

    storeUsers,
    newUsersThisMonth,

    revenueAllTimeAgg,
    revenueThisMonthAgg,
    revenueLastMonthAgg,

    recentOrdersDocs,
    recentPayoutDocs,
  ] = await Promise.all([
    // Products
    productsModel.countDocuments({ storeId }),
    productsModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    productsModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfThisMonth },
    }),

    // Orders
    OrderModel.countDocuments({ storeId }),
    OrderModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    OrderModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfThisMonth },
    }),

    // Users
    Customer.countDocuments({ associatedStoreId: storeId }),
    Customer.countDocuments({
      associatedStoreId: storeId,
      createdAt: { $gte: startOfThisMonth },
    }),

    // Revenue (storePayout) all-time
    storePayoutsModel.aggregate([
      { $match: { storeId } },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),

    // Revenue this month
    storePayoutsModel.aggregate([
      { $match: { storeId, endDate: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),

    // Revenue last month
    storePayoutsModel.aggregate([
      {
        $match: {
          storeId,
          endDate: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),

    // Recent orders — join customer name
    OrderModel.aggregate([
      { $match: { storeId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          customerName: "$customer.name",
          amount: "$cartTotal",
          status: 1,
          paymentMode: 1,
          createdAt: 1,
        },
      },
    ]),

    // Recent payouts
    storePayoutsModel
      .find({ storeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const stats: StoreDashboardStats = {
    totalProducts,
    productGrowthPercent: growthPercent(productsThisMonth, productsLastMonth),
    totalOrders,
    orderGrowthPercent: growthPercent(ordersThisMonth, ordersLastMonth),
    totalRevenue: revenueAllTimeAgg[0]?.total ?? 0,
    revenueGrowthPercent: growthPercent(
      revenueThisMonthAgg[0]?.total ?? 0,
      revenueLastMonthAgg[0]?.total ?? 0,
    ),
    storeUsers,
    newUsersRecently: newUsersThisMonth,
  };

  const recentOrders: StoreRecentOrder[] = recentOrdersDocs.map((o: any) => ({
    orderId: o._id.toString(),
    customerName: o.customerName ?? "Unknown Customer",
    amount: o.amount ?? 0,
    status: o.status,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt,
  }));

  const recentPayouts: StoreRecentPayout[] = recentPayoutDocs.map((p: any) => ({
    payoutId: p._id.toString(),
    weekLabel: formatWeekLabel(p.startDate, p.endDate),
    amount: p.storePayout ?? 0,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  return { storeId: storeIdStr, stats, recentOrders, recentPayouts };
}
