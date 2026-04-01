"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import productsModel from "@/db/models/store/products.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";

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

function pct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function startOfMonth(offset = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - offset, 1);
}

// ─── Overview stats ─────────────────────────────────────────────────────────────

export interface OverviewStats {
  // All-time
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  totalStores: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  totalSubsidyGiven: number;
  platformProfit: number;
  completionRate: number; // % of orders completed

  // This month absolute values (for "this month: $X" sub-labels)
  revenueThisMonth: number;
  revenueLastMonth: number;
  ordersThisMonth: number;
  ordersLastMonth: number;
  customersThisMonth: number;
  customersLastMonth: number;
  profitThisMonth: number;
  profitLastMonth: number;

  // MoM % changes
  revenueMoM: number;
  ordersMoM: number;
  customersMoM: number;
  profitMoM: number;

  totalStorePayouts: number;
  totalStoreProfits: number;
  totalPlatformCommission: number;
}

interface PayoutAggResult {
  _id: null;
  platformProfit: number;
  storePayout: number;
  storeProfit: number;
  platformCommision: number;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  await dbConnect();

  const thisMonthStart = startOfMonth(0);
  const lastMonthStart = startOfMonth(1);
  const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);

  const [
    allOrderStats,
    pendingOrders,
    thisMonthRevAgg,
    lastMonthRevAgg,
    thisMonthOrders,
    lastMonthOrders,
    totalCustomers,
    newCustomersThisMonth,
    newCustomersLastMonth,
    totalStores,
    totalProducts,
    subsidyAgg,
    payoutAgg,
    thisMonthProfitAgg,
    lastMonthProfitAgg,
  ] = await Promise.all([
    OrderModel.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$cartTotal" },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
    OrderModel.countDocuments({ status: "pending" }),
    OrderModel.aggregate([
      { $match: { status: "completed", createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: "$cartTotal" } } },
    ]),
    OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$cartTotal" } } },
    ]),
    OrderModel.countDocuments({
      status: "completed",
      createdAt: { $gte: thisMonthStart },
    }),
    OrderModel.countDocuments({
      status: "completed",
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }),
    Customer.countDocuments(),
    Customer.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    Customer.countDocuments({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }),
    Store.countDocuments(),
    productsModel.countDocuments(),
    OrderModel.aggregate([
      { $group: { _id: null, total: { $sum: "$subsidyUsed" } } },
    ]),
    // 1. The new combined payout aggregation
    storePayoutsModel.aggregate<PayoutAggResult>([
      {
        $group: {
          _id: null,
          platformProfit: { $sum: "$platformProfit" },
          storePayout: { $sum: "$storePayout" },
          storeProfit: { $sum: "$storeProfit" },
          platformCommision: { $sum: "$platformCommision" },
        },
      },
    ]),
    // 2. MISSING: This month's profit aggregation
    storePayoutsModel.aggregate([
      { $match: { endDate: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: "$platformProfit" } } },
    ]),
    // 3. MISSING: Last month's profit aggregation
    storePayoutsModel.aggregate([
      { $match: { endDate: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: "$platformProfit" } } },
    ]),
  ]);

  const totalRevenue = allOrderStats[0]?.totalRevenue ?? 0;
  const completedOrders = allOrderStats[0]?.totalOrders ?? 0;
  const totalOrders = completedOrders + pendingOrders;

  const revenueThisMonth = thisMonthRevAgg[0]?.total ?? 0;
  const revenueLastMonth = lastMonthRevAgg[0]?.total ?? 0;
  const profitThisMonth = thisMonthProfitAgg[0]?.total ?? 0;
  const profitLastMonth = lastMonthProfitAgg[0]?.total ?? 0;

  return {
    platformProfit: payoutAgg[0]?.platformProfit ?? 0,
    totalRevenue,
    totalOrders,
    avgOrderValue:
      completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0,
    totalCustomers,
    totalStores,
    totalProducts,
    pendingOrders,
    completedOrders,
    totalSubsidyGiven: subsidyAgg[0]?.total ?? 0,
    completionRate:
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,

    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth: thisMonthOrders,
    ordersLastMonth: lastMonthOrders,
    customersThisMonth: newCustomersThisMonth,
    customersLastMonth: newCustomersLastMonth,
    profitThisMonth,
    profitLastMonth,

    revenueMoM: pct(revenueThisMonth, revenueLastMonth),
    ordersMoM: pct(thisMonthOrders, lastMonthOrders),
    customersMoM: pct(newCustomersThisMonth, newCustomersLastMonth),
    profitMoM: pct(profitThisMonth, profitLastMonth),

    totalStorePayouts: payoutAgg[0]?.storePayout ?? 0,
    totalStoreProfits: payoutAgg[0]?.storeProfit ?? 0,
    totalPlatformCommission: payoutAgg[0]?.platformCommision ?? 0,
  };
}

// ─── Pie chart ──────────────────────────────────────────────────────────────────

export async function getPieChartData() {
  await dbConnect();
  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$storeId",
        orders: { $sum: 1 },
        revenue: { $sum: "$cartTotal" },
      },
    },
    {
      $lookup: {
        from: "stores",
        localField: "_id",
        foreignField: "_id",
        as: "store",
      },
    },
    { $unwind: "$store" },
    { $project: { store: "$store.name", orders: 1, revenue: 1, _id: 0 } },
    { $sort: { orders: -1 } },
    { $limit: 5 },
  ]);
  return data.map((d) => ({
    store: d.store,
    orders: d.orders,
    revenue: d.revenue,
  }));
}

// ─── Area chart ─────────────────────────────────────────────────────────────────

export async function getAreaChartData() {
  await dbConnect();
  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, storeId: "$storeId" },
        revenue: { $sum: "$cartTotal" },
      },
    },
    {
      $lookup: {
        from: "stores",
        localField: "_id.storeId",
        foreignField: "_id",
        as: "store",
      },
    },
    { $unwind: "$store" },
    {
      $group: {
        _id: "$_id.month",
        stores: {
          $push: { k: "$store.name", v: { $divide: ["$revenue", 100] } },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 6 },
  ]);
  const formattedData = data.map((d) => {
    const obj: Record<string, any> = {
      month: MONTHS[(d._id - 1) % 12] || `M${d._id}`,
    };
    d.stores.forEach((s: any) => {
      obj[s.k] = s.v;
    });
    return obj;
  });
  const keys = Array.from(
    new Set(data.flatMap((d) => d.stores.map((s: any) => s.k))),
  ) as string[];
  return { data: formattedData, keys };
}

// ─── Top products ────────────────────────────────────────────────────────────────

export async function getTopProductsData() {
  await dbConnect();
  const topProducts = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $project: { name: "$product.name", _id: 1 } },
  ]);
  if (!topProducts.length) return { data: [], keys: [] };

  const topProductIds = topProducts.map((p) => p._id);
  const productNames = topProducts.reduce(
    (acc, p) => ({ ...acc, [p._id.toString()]: p.name }),
    {} as Record<string, string>,
  );

  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$products" },
    { $match: { "products.productId": { $in: topProductIds } } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          productId: "$products.productId",
        },
        sold: { $sum: "$products.quantity" },
      },
    },
    {
      $group: {
        _id: "$_id.month",
        products: { $push: { k: { $toString: "$_id.productId" }, v: "$sold" } },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 6 },
  ]);
  const formattedData = data.map((d) => {
    const obj: Record<string, any> = {
      month: MONTHS[(d._id - 1) % 12] || `M${d._id}`,
    };
    d.products.forEach((p: any) => {
      const name = productNames[p.k];
      if (name) obj[name] = p.v;
    });
    return obj;
  });
  return { data: formattedData, keys: Object.values(productNames) };
}

// ─── Top spenders ────────────────────────────────────────────────────────────────

export async function getTopSpendersData() {
  await dbConnect();
  // Order.userId = Customer._id directly — group by userId, join on Customer._id
  const topUsers = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$userId", totalSpent: { $sum: "$cartTotal" } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: false } },
    { $project: { name: "$customer.name", _id: 1 } },
  ]);
  if (!topUsers.length) return { data: [], keys: [] };

  const topUserIds = topUsers.map((u) => u._id);
  const userNames = topUsers.reduce(
    (acc, u) => ({ ...acc, [u._id.toString()]: u.name }),
    {} as Record<string, string>,
  );

  const data = await OrderModel.aggregate([
    { $match: { status: "completed", userId: { $in: topUserIds } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, userId: "$userId" },
        spent: { $sum: "$cartTotal" },
      },
    },
    {
      $group: {
        _id: "$_id.month",
        users: {
          $push: {
            k: { $toString: "$_id.userId" },
            v: { $divide: ["$spent", 100] },
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 6 },
  ]);
  const formattedData = data.map((d) => {
    const obj: Record<string, any> = {
      month: MONTHS[(d._id - 1) % 12] || `M${d._id}`,
    };
    d.users.forEach((u: any) => {
      const name = userNames[u.k];
      if (name) obj[name] = u.v;
    });
    return obj;
  });
  return { data: formattedData, keys: Object.values(userNames) };
}

// ─── Payment breakdown ───────────────────────────────────────────────────────────

export interface PaymentBreakdown {
  method: string;
  count: number;
  revenue: number;
  pct: number;
}

export async function getPaymentBreakdown(): Promise<PaymentBreakdown[]> {
  await dbConnect();
  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$paymentMode",
        count: { $sum: 1 },
        revenue: { $sum: "$cartTotal" },
      },
    },
    { $sort: { count: -1 } },
  ]);
  const total = data.reduce((s: number, d: any) => s + d.count, 0) || 1;
  return data.map((d: any) => ({
    method: d._id ?? "unknown",
    count: d.count,
    revenue: d.revenue,
    pct: Math.round((d.count / total) * 100),
  }));
}

// ─── Revenue trend ───────────────────────────────────────────────────────────────

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  orders: number;
}

export async function getRevenueTrend(): Promise<RevenueTrendPoint[]> {
  await dbConnect();
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const data = await OrderModel.aggregate([
    { $match: { status: "completed", createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$cartTotal" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const map = new Map<string, { revenue: number; orders: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map.set(`${d.getFullYear()}-${d.getMonth() + 1}`, {
      revenue: 0,
      orders: 0,
    });
  }
  for (const d of data) {
    map.set(`${d._id.year}-${d._id.month}`, {
      revenue: d.revenue,
      orders: d.orders,
    });
  }

  return Array.from(map.entries()).map(([key, val]) => {
    const [, month] = key.split("-").map(Number);
    return {
      month: MONTHS[month - 1],
      revenue: Math.round(val.revenue / 100),
      orders: val.orders,
    };
  });
}
