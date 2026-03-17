"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";
import productsModel from "@/db/models/store/products.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import mongoose from "mongoose";
import { getUserSession } from "../auth/getUserSession.actions";

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

  pendingOrders: number;
  completedOrders: number;
  completionRate: number; // %

  totalCustomers: number;
  newCustomersThisMonth: number;

  totalProducts: number;
  inStockProducts: number;
  subsidisedProducts: number;

  avgOrderValue: number; // cents

  // Charts
  monthlyRevenue: RevenueDataPoint[]; // last 6 months
  dailyOrders: DailyOrderPoint[]; // last 7 days
  categoryBreakdown: CategoryBreakdown[];
  paymentMethods: PaymentMethodBreakdown[];
  topProducts: TopProduct[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// ─── Action ────────────────────────────────────────────────────────────────────

export async function getStoreAnalytics(): Promise<StoreAnalyticsData> {
  await dbConnect();

  const session = await getUserSession();
  const storeDoc = await Store.findOne({ userId: session.user.id })
    .select("_id")
    .lean();
  if (!storeDoc) throw new Error("Store not found");

  const storeId = (storeDoc as any)._id as mongoose.Types.ObjectId;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Last 6 months range
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    pendingOrders,
    completedOrders,
    totalCustomers,
    newCustomersThisMonth,
    totalProducts,
    inStockProducts,
    subsidisedProducts,
    avgOrderAgg,

    // Revenue from payouts
    totalRevenueAgg,
    revenueThisMonthAgg,
    revenueLastMonthAgg,

    // Monthly revenue for chart
    monthlyRevenueAgg,

    // Daily orders for chart (last 7 days)
    dailyOrdersAgg,

    // Category breakdown
    categoryAgg,

    // Payment method breakdown
    paymentMethodAgg,

    // Top products by quantity sold
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
    OrderModel.countDocuments({ storeId, status: "pending" }),
    OrderModel.countDocuments({ storeId, status: "completed" }),
    Customer.countDocuments({ associatedStoreId: storeId }),
    Customer.countDocuments({
      associatedStoreId: storeId,
      createdAt: { $gte: startOfThisMonth },
    }),
    productsModel.countDocuments({ storeId }),
    productsModel.countDocuments({ storeId, stock: true }),
    productsModel.countDocuments({ storeId, subsidised: true }),

    // Avg order value
    OrderModel.aggregate([
      { $match: { storeId } },
      { $group: { _id: null, avg: { $avg: "$cartTotal" } } },
    ]),

    // Total all-time revenue
    storePayoutsModel.aggregate([
      { $match: { storeId } },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),
    storePayoutsModel.aggregate([
      { $match: { storeId, endDate: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),
    storePayoutsModel.aggregate([
      {
        $match: {
          storeId,
          endDate: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),

    // Monthly revenue — group by year+month
    storePayoutsModel.aggregate([
      { $match: { storeId, endDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$endDate" }, month: { $month: "$endDate" } },
          revenue: { $sum: "$storePayout" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Daily orders last 7 days
    OrderModel.aggregate([
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

    // Category breakdown from products
    productsModel.aggregate([
      { $match: { storeId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),

    // Payment method breakdown
    OrderModel.aggregate([
      { $match: { storeId } },
      { $group: { _id: "$paymentMode", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Top 5 products by quantity sold
    OrderModel.aggregate([
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
          name: "$product.name",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]),
  ]);

  // ── Build monthly revenue chart (last 6 months, fill gaps) ────────────────
  const monthlyRevenueMap = new Map<
    string,
    { revenue: number; orders: number }
  >();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyRevenueMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const pt of monthlyRevenueAgg) {
    const key = `${pt._id.year}-${pt._id.month}`;
    if (monthlyRevenueMap.has(key)) {
      monthlyRevenueMap.set(key, { revenue: pt.revenue, orders: pt.orders });
    }
  }
  const monthlyRevenue: RevenueDataPoint[] = Array.from(
    monthlyRevenueMap.entries(),
  ).map(([key, val]) => {
    const [year, month] = key.split("-").map(Number);
    return {
      month: MONTHS[month - 1],
      revenue: val.revenue,
      orders: val.orders,
    };
  });

  // ── Build daily orders chart (last 7 days, fill gaps) ─────────────────────
  const dailyMap = new Map<number, { orders: number; revenue: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.getDay(), { orders: 0, revenue: 0 });
  }
  for (const pt of dailyOrdersAgg) {
    // MongoDB $dayOfWeek: 1=Sun … 7=Sat
    const jsDay = (pt._id - 1) % 7;
    dailyMap.set(jsDay, { orders: pt.orders, revenue: pt.revenue });
  }
  const dailyOrders: DailyOrderPoint[] = Array.from(dailyMap.entries()).map(
    ([day, val]) => ({
      day: DAYS[day],
      orders: val.orders,
      revenue: val.revenue,
    }),
  );

  // ── Category breakdown ─────────────────────────────────────────────────────
  const totalProductsForPct =
    categoryAgg.reduce((s: number, c: any) => s + c.count, 0) || 1;
  const categoryBreakdown: CategoryBreakdown[] = categoryAgg.map((c: any) => ({
    category: c._id ?? "Other",
    count: c.count,
    percentage: Math.round((c.count / totalProductsForPct) * 100),
  }));

  // ── Payment methods ────────────────────────────────────────────────────────
  const totalForPct =
    paymentMethodAgg.reduce((s: number, p: any) => s + p.count, 0) || 1;
  const paymentMethods: PaymentMethodBreakdown[] = paymentMethodAgg.map(
    (p: any) => ({
      method: p._id ?? "unknown",
      count: p.count,
      percentage: Math.round((p.count / totalForPct) * 100),
    }),
  );

  // ── Top products ───────────────────────────────────────────────────────────
  const topProducts: TopProduct[] = topProductsAgg.map((p: any) => ({
    name: p.name ?? "Unknown Product",
    totalQuantity: p.totalQuantity,
    totalRevenue: p.totalRevenue ?? 0,
  }));

  return {
    totalRevenue: totalRevenueAgg[0]?.total ?? 0,
    revenueThisMonth: revenueThisMonthAgg[0]?.total ?? 0,
    revenueLastMonth: revenueLastMonthAgg[0]?.total ?? 0,
    revenueGrowth: growthPct(
      revenueThisMonthAgg[0]?.total ?? 0,
      revenueLastMonthAgg[0]?.total ?? 0,
    ),

    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    ordersGrowth: growthPct(ordersThisMonth, ordersLastMonth),

    pendingOrders,
    completedOrders,
    completionRate:
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,

    totalCustomers,
    newCustomersThisMonth,

    totalProducts,
    inStockProducts,
    subsidisedProducts,

    avgOrderValue: avgOrderAgg[0]?.avg ?? 0,

    monthlyRevenue,
    dailyOrders,
    categoryBreakdown,
    paymentMethods,
    topProducts,
  };
}
