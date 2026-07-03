"use server";

import { dbConnect } from "@/db/dbConnect";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import productsModel from "@/db/models/store/products.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import mongoose from "mongoose";
import { getUserSession } from "../auth/getUserSession.actions";
import { getAnalyticsBoundaries } from "@/lib/timezone";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface StoreDashboardStats {
  totalProducts: number;
  productGrowthPercent: number;
  totalOrders: number;
  orderGrowthPercent: number;
  totalRevenue: number;
  revenueGrowthPercent: number;
  totalStoreProfit: number;
  storeProfitGrowthPercent: number;
  storeUsers: number;
  newUsersRecently: number;
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

// ─── Database Aggregation Interfaces ──────────────────────────────────────────

interface FlatRevenueMetrics {
  totalCartTotal: number;
  totalSubsidy: number;
  totalSubsidyUsed: number;
}

interface StoreProfitMetrics {
  total: number;
}

interface RawRecentOrderDoc {
  _id: mongoose.Types.ObjectId;
  customerName?: string;
  amount?: number;
  status: "pending" | "completed";
  paymentMode: "wallet" | "cash" | "card" | "pending";
  createdAt: Date;
}

interface RawRecentPayoutDoc {
  _id: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  storePayout?: number;
  status: "pending" | "paid";
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function growthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

function formatWeekLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const s = new Date(start).toLocaleDateString("en-CA", opts);
  const eDay = new Date(end).getDate();
  return `${s.replace(",", "")}–${eDay}`;
}

/**
 * Computes financial revenue based on raw database fields using the flow:
 * Paid After Subsidy = Total Customer Paid - (Subsidy - Subsidy Used)
 * Revenue = Paid After Subsidy + Subsidy
 */
function calculateRevenueFromMetrics(metrics: FlatRevenueMetrics | undefined): number {
  const customerPaid = metrics?.totalCartTotal ?? 0;
  const subsidy = metrics?.totalSubsidy ?? 0;
  const subsidyUsed = metrics?.totalSubsidyUsed ?? 0;

  const paidAfterSubsidy = customerPaid - (subsidy - subsidyUsed);
  return paidAfterSubsidy + subsidy;
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function getStoreDashboardData(): Promise<StoreDashboardData> {
  await dbConnect();

  // Resolve the store that belongs to the logged-in user securely
  const session = await getUserSession();
  const storeDoc = await Store.findOne({ userId: session.user.id })
    .select("_id")
    .lean();

  if (!storeDoc) throw new Error("Store not found for this user");

  const storeId = storeDoc._id as mongoose.Types.ObjectId;
  const storeIdStr = storeId.toString();

  const { utcStartOfThisMonth, utcStartOfLastMonth } = getAnalyticsBoundaries();
  const startOfThisMonth = utcStartOfThisMonth;
  const startOfLastMonth = utcStartOfLastMonth;

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
    storeProfitAllTimeAgg,
    storeProfitThisMonthAgg,
    storeProfitLastMonthAgg,
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

    // Flat raw sum metrics for All-Time Revenue
    OrderModel.aggregate<FlatRevenueMetrics>([
      { $match: { storeId, status: "completed" } },
      {
        $group: {
          _id: null,
          totalCartTotal: { $sum: "$cartTotal" },
          totalSubsidy: { $sum: { $ifNull: ["$subsidy", 0] } },
          totalSubsidyUsed: { $sum: { $ifNull: ["$subsidyUsed", 0] } },
        },
      },
    ]),

    // Flat raw sum metrics for This Month Revenue
    OrderModel.aggregate<FlatRevenueMetrics>([
      {
        $match: {
          storeId,
          status: "completed",
          createdAt: { $gte: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalCartTotal: { $sum: "$cartTotal" },
          totalSubsidy: { $sum: { $ifNull: ["$subsidy", 0] } },
          totalSubsidyUsed: { $sum: { $ifNull: ["$subsidyUsed", 0] } },
        },
      },
    ]),

    // Flat raw sum metrics for Last Month Revenue
    OrderModel.aggregate<FlatRevenueMetrics>([
      {
        $match: {
          storeId,
          status: "completed",
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalCartTotal: { $sum: "$cartTotal" },
          totalSubsidy: { $sum: { $ifNull: ["$subsidy", 0] } },
          totalSubsidyUsed: { $sum: { $ifNull: ["$subsidyUsed", 0] } },
        },
      },
    ]),

    // Store profit all-time
    OrderModel.aggregate<StoreProfitMetrics>([
      { $match: { storeId, status: "completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$storeProfit", 0] } },
        },
      },
    ]),

    // Store profit this month
    OrderModel.aggregate<StoreProfitMetrics>([
      {
        $match: {
          storeId,
          status: "completed",
          createdAt: { $gte: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$storeProfit", 0] } },
        },
      },
    ]),

    // Store profit last month
    OrderModel.aggregate<StoreProfitMetrics>([
      {
        $match: {
          storeId,
          status: "completed",
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$storeProfit", 0] } },
        },
      },
    ]),

    // Recent orders — join customer name
    OrderModel.aggregate<RawRecentOrderDoc>([
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
      .lean<RawRecentPayoutDoc[]>(),
  ]);

  // Execute explicit sequential calculations on raw totals
  const totalRevenue = calculateRevenueFromMetrics(revenueAllTimeAgg[0]);
  const revenueThisMonth = calculateRevenueFromMetrics(revenueThisMonthAgg[0]);
  const revenueLastMonth = calculateRevenueFromMetrics(revenueLastMonthAgg[0]);

  const stats: StoreDashboardStats = {
    totalProducts,
    productGrowthPercent: growthPercent(productsThisMonth, productsLastMonth),
    totalOrders,
    orderGrowthPercent: growthPercent(ordersThisMonth, ordersLastMonth),
    totalRevenue,
    revenueGrowthPercent: growthPercent(revenueThisMonth, revenueLastMonth),
    totalStoreProfit: storeProfitAllTimeAgg[0]?.total ?? 0,
    storeProfitGrowthPercent: growthPercent(
      storeProfitThisMonthAgg[0]?.total ?? 0,
      storeProfitLastMonthAgg[0]?.total ?? 0,
    ),
    storeUsers,
    newUsersRecently: newUsersThisMonth,
  };

  const recentOrders: StoreRecentOrder[] = recentOrdersDocs.map((o) => ({
    orderId: o._id.toString(),
    customerName: o.customerName ?? "Unknown Customer",
    amount: o.amount ?? 0,
    status: o.status,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt,
  }));

  const recentPayouts: StoreRecentPayout[] = recentPayoutDocs.map((p) => ({
    payoutId: p._id.toString(),
    weekLabel: formatWeekLabel(p.startDate, p.endDate),
    amount: p.storePayout ?? 0,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  return { storeId: storeIdStr, stats, recentOrders, recentPayouts };
}