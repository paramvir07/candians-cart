"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import productsModel from "@/db/models/store/products.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import mongoose from "mongoose";
import { getUserSession } from "../auth/getUserSession.actions";
import { getAnalyticsBoundaries } from "@/lib/timezone";
import { toZonedTime } from "date-fns-tz";

const STORE_TIMEZONE = "America/Vancouver";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  month: string; // "Jan", "Feb" …
  revenue: number; // storePayout in cents
  orders: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  name: string;
  totalQuantity: number;
  totalRevenue: number; // cents
}

export interface DailyOrderPoint {
  day: string; // "Mon", "Tue" …
  orders: number;
  revenue: number;
}

export interface StoreAnalyticsData {
  // KPI summary
  totalRevenue: number; // all-time storePayout cents
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number; // %

  totalOrders: number;
  ordersThisMonth: number;
  ordersLastMonth: number;
  ordersGrowth: number;

  totalCustomers: number;
  newCustomersThisMonth: number;

  totalProducts: number;
  inStockProducts: number;
  subsidisedProducts: number;

  totalSubsidyGiven: number;

  avgOrderValue: number; // cents

  // Charts
  monthlyRevenue: RevenueDataPoint[]; // last 6 months
  dailyOrders: DailyOrderPoint[]; // last 7 days
  categoryBreakdown: CategoryBreakdown[];
  topProducts: TopProduct[];
}

// ─── Database Pipeline Output Typings ──────────────────────────────────────────

interface FlatRevenueSumMetrics {
  totalCartTotal: number;
  totalSubsidy: number;
  totalSubsidyUsed: number;
}

interface AvgOrderMetrics {
  avgCartTotal: number;
  avgSubsidy: number;
  avgSubsidyUsed: number;
}

interface MonthlyRevenueAggRow {
  _id: {
    year: number;
    month: number;
  };
  totalCartTotal: number;
  totalSubsidy: number;
  totalSubsidyUsed: number;
  orders: number;
}

interface DailyOrdersAggRow {
  _id: number;
  orders: number;
  revenue: number;
}

interface SubsidyGivenRow {
  total: number;
}

interface CategoryAggRow {
  _id: string | null;
  count: number;
}

interface PaymentMethodAggRow {
  _id: string;
  count: number;
}

interface TopProductsAggRow {
  name?: string;
  totalQuantity: number;
  totalRevenue: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * Reuses the identical standard mathematical logic flow for computing revenue metrics
 * from isolated, raw aggregated parameters outside of MongoDB.
 */
function calculateRevenueFromMetrics(metrics: FlatRevenueSumMetrics | undefined): number {
  const customerPaid = metrics?.totalCartTotal ?? 0;
  const subsidy = metrics?.totalSubsidy ?? 0;
  const subsidyUsed = metrics?.totalSubsidyUsed ?? 0;

  const paidAfterSubsidy = customerPaid - (subsidy - subsidyUsed);
  return paidAfterSubsidy + subsidy;
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function getStoreAnalytics(): Promise<StoreAnalyticsData> {
  await dbConnect();

  const session = await getUserSession();
  const storeDoc = await Store.findOne({ userId: session.user.id })
    .select("_id")
    .lean();
  if (!storeDoc) throw new Error("Store not found");

  const storeId = storeDoc._id as mongoose.Types.ObjectId;

  const { utcStartOfThisMonth, utcStartOfLastMonth } = getAnalyticsBoundaries();
  const startOfThisMonth = utcStartOfThisMonth;
  const startOfLastMonth = utcStartOfLastMonth;

  const zonedNow = toZonedTime(new Date(), STORE_TIMEZONE);
  const sixMonthsAgo = getAnalyticsBoundaries(
    new Date(zonedNow.getFullYear(), zonedNow.getMonth() - 5, 1),
  ).utcStartOfThisMonth;
  const sevenDaysAgo = getAnalyticsBoundaries().utcRolling7Days;

  const [
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    totalCustomers,
    newCustomersThisMonth,
    totalProducts,
    inStockProducts,
    subsidisedProducts,
    avgOrderAgg,
    totalRevenueAgg,
    revenueThisMonthAgg,
    revenueLastMonthAgg,
    monthlyRevenueAgg,
    dailyOrdersAgg,
    subsidyAgg,
    categoryAgg,
    paymentMethodAgg,
    topProductsAgg,
  ] = await Promise.all([
    OrderModel.countDocuments({ storeId }),
    OrderModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfThisMonth },
    }),
    OrderModel.countDocuments({
      storeId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),

    Customer.countDocuments({ associatedStoreId: storeId }),
    Customer.countDocuments({
      associatedStoreId: storeId,
      createdAt: { $gte: startOfThisMonth },
    }),
    productsModel.countDocuments({ storeId }),
    productsModel.countDocuments({ storeId, stock: true }),
    productsModel.countDocuments({ storeId, subsidised: true }),

    // Average Order Raw Accumulators
    OrderModel.aggregate<AvgOrderMetrics>([
      { $match: { storeId, status: "completed" } },
      {
        $group: {
          _id: null,
          avgCartTotal: { $avg: "$cartTotal" },
          avgSubsidy: { $avg: { $ifNull: ["$subsidy", 0] } },
          avgSubsidyUsed: { $avg: { $ifNull: ["$subsidyUsed", 0] } },
        },
      },
    ]),

    // All-time Revenue Raw Metrics
    OrderModel.aggregate<FlatRevenueSumMetrics>([
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

    // This Month Revenue Raw Metrics
    OrderModel.aggregate<FlatRevenueSumMetrics>([
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

    // Last Month Revenue Raw Metrics
    OrderModel.aggregate<FlatRevenueSumMetrics>([
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

    // Last 6 months trend historical raw mapping rows
    OrderModel.aggregate<MonthlyRevenueAggRow>([
      {
        $match: {
          storeId,
          status: "completed",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { date: "$createdAt", timezone: STORE_TIMEZONE } },
            month: { $month: { date: "$createdAt", timezone: STORE_TIMEZONE } },
          },
          totalCartTotal: { $sum: "$cartTotal" },
          totalSubsidy: { $sum: { $ifNull: ["$subsidy", 0] } },
          totalSubsidyUsed: { $sum: { $ifNull: ["$subsidyUsed", 0] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Daily orders last 7 days
    OrderModel.aggregate<DailyOrdersAggRow>([
      { $match: { storeId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dayOfWeek: { date: "$createdAt", timezone: "America/Vancouver" },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$cartTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Subsidy Given
    OrderModel.aggregate<SubsidyGivenRow>([
      { $match: { storeId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$subsidy", 0] } },
        },
      },
    ]),

    // Category breakdown from products
    productsModel.aggregate<CategoryAggRow>([
      { $match: { storeId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),

    // Payment method breakdown
    OrderModel.aggregate<PaymentMethodAggRow>([
      { $match: { storeId } },
      { $group: { _id: "$paymentMode", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Top 5 products by quantity sold
    OrderModel.aggregate<TopProductsAggRow>([
      { $match: { storeId } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: "$products.total" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: "$product.name",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]),
  ]);

  // ── Compute Application Layer KPIs ───────────────────────────────────────────
  const totalRevenue = calculateRevenueFromMetrics(totalRevenueAgg[0]);
  const revenueThisMonth = calculateRevenueFromMetrics(revenueThisMonthAgg[0]);
  const revenueLastMonth = calculateRevenueFromMetrics(revenueLastMonthAgg[0]);

  // Process Average Order Value Outside DB Context
  const rawAvgMetrics = avgOrderAgg[0];
  const avgCartTotal = rawAvgMetrics?.avgCartTotal ?? 0;
  const avgSubsidy = rawAvgMetrics?.avgSubsidy ?? 0;
  const avgSubsidyUsed = rawAvgMetrics?.avgSubsidyUsed ?? 0;
  const avgOrderValue = Math.round(avgCartTotal - (avgSubsidy - avgSubsidyUsed) + avgSubsidy);

  // ── Build monthly revenue chart (last 6 months, fill gaps) ───────────────────
  const monthlyRevenueMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(zonedNow.getFullYear(), zonedNow.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyRevenueMap.set(key, { revenue: 0, orders: 0 });
  }

  for (const pt of monthlyRevenueAgg) {
    const key = `${pt._id.year}-${pt._id.month}`;
    if (monthlyRevenueMap.has(key)) {
      const calculatedMonthlyRevenue = calculateRevenueFromMetrics({
        totalCartTotal: pt.totalCartTotal,
        totalSubsidy: pt.totalSubsidy,
        totalSubsidyUsed: pt.totalSubsidyUsed,
      });
      monthlyRevenueMap.set(key, { revenue: calculatedMonthlyRevenue, orders: pt.orders });
    }
  }

  const monthlyRevenue: RevenueDataPoint[] = Array.from(monthlyRevenueMap.entries()).map(([key, val]) => {
    const [, month] = key.split("-").map(Number);
    return {
      month: MONTHS[month - 1],
      revenue: val.revenue,
      orders: val.orders,
    };
  });

  // ── Build daily orders chart (last 7 days, fill gaps) ───────────────────────
  const dailyMap = new Map<number, { orders: number; revenue: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(zonedNow.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.getDay(), { orders: 0, revenue: 0 });
  }

  for (const pt of dailyOrdersAgg) {
    const jsDay = (pt._id - 1) % 7;
    dailyMap.set(jsDay, { orders: pt.orders, revenue: pt.revenue });
  }

  const dailyOrders: DailyOrderPoint[] = Array.from(dailyMap.entries()).map(([day, val]) => ({
    day: DAYS[day],
    orders: val.orders,
    revenue: val.revenue,
  }));

  // ── Category breakdown ───────────────────────────────────────────────────────
  const totalProductsForPct = categoryAgg.reduce((s, c) => s + c.count, 0) || 1;
  const categoryBreakdown: CategoryBreakdown[] = categoryAgg.map((c) => ({
    category: c._id ?? "Other",
    count: c.count,
    percentage: Math.round((c.count / totalProductsForPct) * 100),
  }));

  // ── Top products ─────────────────────────────────────────────────────────────
  const topProducts: TopProduct[] = topProductsAgg.map((p) => ({
    name: p.name ?? "Unknown Product",
    totalQuantity: p.totalQuantity,
    totalRevenue: p.totalRevenue ?? 0,
  }));

  return {
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    revenueGrowth: growthPct(revenueThisMonth, revenueLastMonth),
    totalSubsidyGiven: subsidyAgg[0]?.total ?? 0,
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    ordersGrowth: growthPct(ordersThisMonth, ordersLastMonth),
    totalCustomers,
    newCustomersThisMonth,
    totalProducts,
    inStockProducts,
    subsidisedProducts,
    avgOrderValue,
    monthlyRevenue,
    dailyOrders,
    categoryBreakdown,
    topProducts,
  };
}