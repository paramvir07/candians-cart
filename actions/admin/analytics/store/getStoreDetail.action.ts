"use server";

import { dbConnect } from "@/db/dbConnect";
import storePayoutsModel from "@/db/models/admin/storePayouts.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import Customer from "@/db/models/customer/customer.model";
import productsModel from "@/db/models/store/products.model";
import Store from "@/db/models/store/store.model";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface StoreDetailStats {
  totalOrders: number;
  orderGrowthPercent: number;
  totalProducts: number;
  productGrowthPercent: number;
  totalUsers: number; // customers with associatedStoreId = storeId
  totalSpending: number; // sum of totalCustomerPaid from StorePayout (cents)
  spendingGrowthPercent: number;
  pendingPayments: number; // sum of storePayout where status = "pending" (cents)
}

export interface StoreProfile {
  storeId: string;
  name: string;
  email: string;
  address: string;
  mobile: string;
  description: string;
  bankDetails: string;
  timezone: string;
}

export interface StoreOrder {
  orderId: string;
  orderRef: string; // formatted as LPO/XXXXXX
  amount: number; // cartTotal in cents
  status: "pending" | "completed";
  paymentMode: "wallet" | "cash" | "card" | "pending";
  createdAt: Date;
}

export interface StorePayoutReceipt {
  payoutId: string;
  receiptNo: string;
  amount: number; // storePayout in cents
  status: "pending" | "paid";
  startDate: Date;
  endDate: Date;
}

export interface StoreDetailData {
  profile: StoreProfile;
  stats: StoreDetailStats;
  recentOrders: StoreOrder[];
  recentPayoutReceipts: StorePayoutReceipt[];
}

// ─────────────────────────────────────────────
// Action
// ─────────────────────────────────────────────

export async function getStoreDetailAction(
  storeId: string,
): Promise<StoreDetailData> {
  await dbConnect();

  const oid = new mongoose.Types.ObjectId(storeId);

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    storeDoc,
    totalOrders,
    ordersLastMonth,
    ordersThisMonth,
    totalProducts,
    productsLastMonth,
    productsThisMonth,
    totalUsers,
    spendingAgg,
    spendingLastMonthAgg,
    pendingPaymentsAgg,
    recentOrdersDocs,
    recentPayoutDocs,
  ] = await Promise.all([
    // Store profile
    Store.findById(oid).lean(),

    // Orders
    OrderModel.countDocuments({ storeId: oid }),
    OrderModel.countDocuments({
      storeId: oid,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    OrderModel.countDocuments({
      storeId: oid,
      createdAt: { $gte: startOfThisMonth },
    }),

    // Products
    productsModel.countDocuments({ storeId: oid }),
    productsModel.countDocuments({
      storeId: oid,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    }),
    productsModel.countDocuments({
      storeId: oid,
      createdAt: { $gte: startOfThisMonth },
    }),

    // Users (customers) associated with this store
    Customer.countDocuments({ associatedStoreId: oid }),

    // Total spending this month = totalCustomerPaid from payouts
    storePayoutsModel.aggregate([
      { $match: { storeId: oid, endDate: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalCustomerPaid" } } },
    ]),

    // Spending last month
    storePayoutsModel.aggregate([
      {
        $match: {
          storeId: oid,
          endDate: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalCustomerPaid" } } },
    ]),

    // Pending payments = sum of storePayout where status = "pending"
    storePayoutsModel.aggregate([
      { $match: { storeId: oid, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$storePayout" } } },
    ]),

    // Recent orders for this store
    OrderModel.find({ storeId: oid }).sort({ createdAt: -1 }).limit(10).lean(),

    // Recent payout receipts for this store
    storePayoutsModel
      .find({ storeId: oid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  if (!storeDoc) {
    throw new Error(`Store not found: ${storeId}`);
  }

  const growthPercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  // All-time totalCustomerPaid for this store
  const totalSpendingAgg = await storePayoutsModel.aggregate([
    { $match: { storeId: oid } },
    { $group: { _id: null, total: { $sum: "$totalCustomerPaid" } } },
  ]);

  const stats: StoreDetailStats = {
    totalOrders,
    orderGrowthPercent: growthPercent(ordersThisMonth, ordersLastMonth),
    totalProducts,
    productGrowthPercent: growthPercent(productsThisMonth, productsLastMonth),
    totalUsers,
    totalSpending: totalSpendingAgg[0]?.total ?? 0,
    spendingGrowthPercent: growthPercent(
      spendingAgg[0]?.total ?? 0,
      spendingLastMonthAgg[0]?.total ?? 0,
    ),
    pendingPayments: pendingPaymentsAgg[0]?.total ?? 0,
  };

  const profile: StoreProfile = {
    storeId,
    name: (storeDoc as any).name,
    email: (storeDoc as any).email,
    address: (storeDoc as any).address,
    mobile: (storeDoc as any).mobile,
    description: (storeDoc as any).description ?? "",
    bankDetails: (storeDoc as any).bankDetails ?? "",
    timezone: (storeDoc as any).timezone ?? "America/Vancouver",
  };

  const recentOrders: StoreOrder[] = recentOrdersDocs.map((o: any) => ({
    orderId: o._id.toString(),
    orderRef: `LPO/${o._id.toString().slice(-6).toUpperCase()}`,
    amount: o.cartTotal,
    status: o.status,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt,
  }));

  const recentPayoutReceipts: StorePayoutReceipt[] = recentPayoutDocs.map(
    (p: any, i: number) => ({
      payoutId: p._id.toString(),
      receiptNo: `#${p._id.toString().slice(-6).toUpperCase()}`,
      amount: p.storePayout,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
    }),
  );

  return { profile, stats, recentOrders, recentPayoutReceipts };
}
