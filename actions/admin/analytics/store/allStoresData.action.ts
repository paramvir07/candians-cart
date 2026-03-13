"use server";

import { dbConnect } from "@/db/dbConnect";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import productsModel from "@/db/models/store/products.model";
import Store from "@/db/models/store/store.model";

export interface DashboardStats {
  totalStores: number;
  newStoresThisMonth: number;
  totalProducts: number;
  productGrowthPercent: number;
  totalOrders: number;
  orderGrowthPercent: number;
  totalRevenue: number; // sum of totalCustomerPaid from StorePayout
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
    totalProducts,
    productsLastMonth,
    totalOrders,
    ordersLastMonth,
    revenueAgg, // totalCustomerPaid this month
    revenueLastMonthAgg,
    recentOrdersDocs,
    recentPayoutDocs,
  ] = await Promise.all([
    Store.countDocuments(),
    Store.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

    productsModel.countDocuments(),
    productsModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),

    OrderModel.countDocuments(),
    OrderModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),

    // Revenue this month = totalCustomerPaid
    storePayoutsModel.aggregate([
      { $match: { endDate: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalCustomerPaid" } } },
    ]),

    // Revenue last month = totalCustomerPaid
    storePayoutsModel.aggregate([
      {
        $match: { endDate: { $gte: startOfLastMonth, $lt: startOfThisMonth } },
      },
      { $group: { _id: null, total: { $sum: "$totalCustomerPaid" } } },
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

  const newProductsThisMonth = await productsModel.countDocuments({
    createdAt: { $gte: startOfThisMonth },
  });

  const ordersThisMonth = await OrderModel.countDocuments({
    createdAt: { $gte: startOfThisMonth },
  });

  // All-time total revenue = sum of totalCustomerPaid across all payouts
  const totalRevenueAgg = await storePayoutsModel.aggregate([
    { $group: { _id: null, total: { $sum: "$totalCustomerPaid" } } },
  ]);
  const totalRevenue: number = totalRevenueAgg[0]?.total ?? 0;

  const revenueThisMonth: number = revenueAgg[0]?.total ?? 0;
  const revenueLastMonth: number = revenueLastMonthAgg[0]?.total ?? 0;

  const stats: DashboardStats = {
    totalStores,
    newStoresThisMonth,
    totalProducts,
    productGrowthPercent: growthPercent(
      newProductsThisMonth,
      productsLastMonth,
    ),
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
