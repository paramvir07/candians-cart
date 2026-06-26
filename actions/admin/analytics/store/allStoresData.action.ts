"use server";

import { dbConnect } from "@/db/dbConnect";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import productsModel from "@/db/models/store/products.model";
import Store from "@/db/models/store/store.model";

export interface DashboardStats {
  totalStores: number;
  newStoresThisMonth: number;
  platformProfit: number; // in cents
  platformFee: number;
  profitGrowthPercent: number;
  totalOrders: number;
  orderGrowthPercent: number;
  totalRevenue: number; // sum of (cartTotal + subsidy) from completed Orders
  revenueGrowthPercent: number;
}

export interface RecentOrder {
  orderId: string;
  storeId: string;
  storeName: string;
  amount: number; // cartTotal in cents
  status: "pending" | "completed";
  paymentMode: "wallet" | "cash" | "card" | "pending";
  createdAt: Date;
}

export interface RecentPayoutReceipt {
  receiptNo: string;
  payoutId: string;
  storeId: string;
  storeName: string;
  amount: number; // storePayout in cents
  status: "pending" | "paid";
  startDate: Date;
  endDate: Date;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  recentPayoutReceipts: RecentPayoutReceipt[];
}

export async function allStoreDataAction(): Promise<DashboardData> {
  await dbConnect();

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalStores,
    newStoresThisMonth,
    profitThisMonthAgg,
    profitLastMonthAgg,
    totalOrders,
    ordersLastMonth,
    revenueAgg, // totalCustomerPaid this month
    revenueLastMonthAgg,
    recentOrdersDocs,
    recentPayoutDocs,
  ] = await Promise.all([
    Store.countDocuments(),

    Store.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

    OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$platformProfit" } } },
    ]),

    // Profit last month (Sum of platformProfit)
    OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$platformProfit" } } },
    ]),

    OrderModel.countDocuments(),
    OrderModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),

    // Revenue this month = cartTotal + subsidy, completed orders only
    OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $add: ["$cartTotal", { $ifNull: ["$subsidy", 0] }] },
          },
        },
      },
    ]),

    // Revenue last month = cartTotal + subsidy, completed orders only
    OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $add: ["$cartTotal", { $ifNull: ["$subsidy", 0] }] },
          },
        },
      },
    ]),

    // Recent Orders — join store for name + storeId
    OrderModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          storeId: 1,
          storeName: "$store.name",
          amount: "$cartTotal",
          status: 1,
          paymentMode: 1,
          createdAt: 1,
        },
      },
    ]),

    // Recent Payout Receipts — join store for name + storeId
    storePayoutsModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          storeId: 1,
          storeName: "$store.name",
          amount: "$storePayout",
          status: 1,
          startDate: 1,
          endDate: 1,
        },
      },
    ]),
  ]);

  const growthPercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  const profitThisMonth: number = profitThisMonthAgg[0]?.total ?? 0;
  const profitLastMonth: number = profitLastMonthAgg[0]?.total ?? 0;

  // All-time platform profit across all completed orders
  const totalProfitAgg = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$platformProfit" } } },
  ]);
  const platformProfit: number = totalProfitAgg[0]?.total ?? 0;

  const ordersThisMonth = await OrderModel.countDocuments({
    createdAt: { $gte: startOfThisMonth },
  });

  const platformFee = totalOrders * 50;

  // All-time total revenue = sum of totalCustomerPaid across all payouts
  const totalRevenueAgg = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: null,
        total: { $sum: { $add: ["$cartTotal", { $ifNull: ["$subsidy", 0] }] } },
      },
    },
  ]);
  const totalRevenue: number = totalRevenueAgg[0]?.total ?? 0;

  // const allTimeCartTotal: number = totalRevenueAgg[0]?.totalCartOnly ?? 0;
  // const allTimeSubsidy: number = totalRevenueAgg[0]?.totalSubsidyOnly ?? 0;

  const revenueThisMonth: number = revenueAgg[0]?.total ?? 0;
  const revenueLastMonth: number = revenueLastMonthAgg[0]?.total ?? 0;

  // console.log("\n=== DASHBOARD DATE BOUNDARIES ===");
  // console.log("Start of Last Month:", startOfLastMonth.toISOString());
  // console.log("Start of This Month:", startOfThisMonth.toISOString());
  // console.log("Current Date (Now): ", now.toISOString());

  // console.log("\n=== REVENUE SPLIT DEBUG ===");
  // console.log("All-Time Cart Total:  ", allTimeCartTotal);
  // console.log("All-Time Subsidy:     ", allTimeSubsidy);
  // console.log("Combined Total:       ", totalRevenue);
  // console.log("===========================\n");

  const stats: DashboardStats = {
    totalStores,
    newStoresThisMonth,
    platformProfit,
    platformFee,
    profitGrowthPercent: growthPercent(profitThisMonth, profitLastMonth),
    totalOrders,
    orderGrowthPercent: growthPercent(ordersThisMonth, ordersLastMonth),
    totalRevenue,
    revenueGrowthPercent: growthPercent(revenueThisMonth, revenueLastMonth),
  };

  const recentOrders: RecentOrder[] = recentOrdersDocs.map((o: any) => ({
    orderId: o._id.toString(),
    storeId: o.storeId?.toString() ?? "",
    storeName: o.storeName ?? "Unknown Store",
    amount: o.amount,
    status: o.status,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt,
  }));

  const recentPayoutReceipts: RecentPayoutReceipt[] = recentPayoutDocs.map(
    (p: any, i: number) => ({
      payoutId: p._id.toString(),
      receiptNo: `#RCP-${String(i + 1).padStart(3, "0")}`,
      storeId: p.storeId?.toString() ?? "",
      storeName: p.storeName ?? "Unknown Store",
      amount: p.amount,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
    }),
  );

  return { stats, recentOrders, recentPayoutReceipts };
}
