"use server";

import { dbConnect } from "@/db/dbConnect";
import { Cashier } from "@/db/models/cashier/cashier.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";

export type CashActivityType = "order" | "wallet_topup";
export type PaymentModeFilter = "all" | "cash" | "card";

export interface CashActivity {
  id: string;
  type: CashActivityType;
  label: string;
  paymentMode: "cash" | "card";
  customerName: string;
  cashierName: string;
  storeName: string;
  storeId: string;
  amount: number;
  createdAt: Date;
}

export interface CashActivityResult {
  success: boolean;
  data: CashActivity[];
  totalPages: number;
  totalCount: number;
  error?: string;
}

export interface CashSummary {
  totalCashOrders: number;
  totalCashOrderAmount: number;
  totalCashTopUps: number;
  totalCashTopUpAmount: number;
  totalCashCollected: number;
}

interface DBQueryResult {
  _id: mongoose.Types.ObjectId;
  amount: number;
  paymentMode?: "cash" | "card";
  customerName?: string;
  cashierName?: string;
  storeName?: string;
  storeId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

interface CashFilterQuery {
  paymentMode?: string;
  status?: string;
  storeId?: mongoose.Types.ObjectId;
  userId?: { $in: string[] };
  createdAt?: { $gte?: Date; $lte?: Date };
}

async function getCashierIdsForStore(
  storeId: mongoose.Types.ObjectId,
): Promise<string[]> {
  const cashiers = await Cashier.find({ storeId }).select("_id").lean();
  return (cashiers as any[]).map((c) => c._id.toString());
}

// Builds the { $gte, $lte } clause, only if a bound was actually supplied.
function buildDateClause(
  startDate?: Date,
  endDate?: Date,
): { createdAt?: { $gte?: Date; $lte?: Date } } {
  if (!startDate && !endDate) return {};
  const createdAt: { $gte?: Date; $lte?: Date } = {};
  if (startDate) createdAt.$gte = startDate;
  if (endDate) createdAt.$lte = endDate;
  return { createdAt };
}

const orderLookups = [
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
    $lookup: {
      from: "stores",
      localField: "storeId",
      foreignField: "_id",
      as: "store",
    },
  },
  { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "cashiers",
      localField: "cashierId",
      foreignField: "_id",
      as: "cashier",
    },
  },
  { $unwind: { path: "$cashier", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 1,
      amount: "$cartTotal",
      paymentMode: 1,
      customerName: "$customer.name",
      cashierName: "$cashier.name",
      storeName: "$store.name",
      storeId: "$storeId",
      createdAt: 1,
    },
  },
];

const topupLookups = [
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer",
    },
  },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  { $addFields: { cashierObjId: { $toObjectId: "$userId" } } },
  {
    $lookup: {
      from: "cashiers",
      localField: "cashierObjId",
      foreignField: "_id",
      as: "cashier",
    },
  },
  { $unwind: { path: "$cashier", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "stores",
      localField: "cashier.storeId",
      foreignField: "_id",
      as: "store",
    },
  },
  { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 1,
      amount: "$value",
      paymentMode: 1,
      customerName: "$customer.name",
      cashierName: "$cashier.name",
      storeName: "$store.name",
      storeId: "$cashier.storeId",
      createdAt: 1,
    },
  },
];

function mapOrder(o: DBQueryResult): CashActivity {
  const paymentMode = o.paymentMode === "card" ? "card" : "cash";
  return {
    id: o._id.toString(),
    type: "order",
    label: paymentMode === "card" ? "Card Order" : "Cash Order",
    paymentMode,
    customerName: o.customerName ?? "Unknown",
    cashierName: o.cashierName ?? "—",
    storeName: o.storeName ?? "Unknown Store",
    storeId: o.storeId?.toString() ?? "",
    amount: o.amount,
    createdAt: o.createdAt,
  };
}

function mapTopUp(t: DBQueryResult): CashActivity {
  const paymentMode = t.paymentMode === "card" ? "card" : "cash";
  return {
    id: t._id.toString(),
    type: "wallet_topup",
    label: paymentMode === "card" ? "Card Top-Up" : "Cash Top-Up",
    paymentMode,
    customerName: t.customerName ?? "Unknown",
    cashierName: t.cashierName ?? "—",
    storeName: t.storeName ?? "Unknown Store",
    storeId: t.storeId?.toString() ?? "",
    amount: t.amount,
    createdAt: t.createdAt,
  };
}

function mergeAndSort(
  orders: CashActivity[],
  topups: CashActivity[],
  limit?: number,
) {
  const merged = [...orders, ...topups].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return limit ? merged.slice(0, limit) : merged;
}

export async function getCashSummary(
  storeId?: string | null,
  paymentMode: PaymentModeFilter = "all",
  startDate?: Date,
  endDate?: Date,
): Promise<CashSummary> {
  await dbConnect();
  const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;
  const dateClause = buildDateClause(startDate, endDate);

  const orderMatch: CashFilterQuery = { status: "completed", ...dateClause };
  if (sid) orderMatch.storeId = sid;
  if (paymentMode !== "all") orderMatch.paymentMode = paymentMode;

  const topupMatch: CashFilterQuery = { ...dateClause };
  if (paymentMode !== "all") topupMatch.paymentMode = paymentMode;
  if (sid) {
    const cashierIds = await getCashierIdsForStore(sid);
    topupMatch.userId = { $in: cashierIds };
  }

  const [orderAgg, topupAgg] = await Promise.all([
    OrderModel.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: null,
          total: { $sum: "$cartTotal" },
          count: { $sum: 1 },
        },
      },
    ]),
    WalletTopUp.aggregate([
      { $match: topupMatch },
      { $group: { _id: null, total: { $sum: "$value" }, count: { $sum: 1 } } },
    ]),
  ]);

  const orderAmount = orderAgg[0]?.total ?? 0;
  const orderCount = orderAgg[0]?.count ?? 0;
  const topUpAmount = topupAgg[0]?.total ?? 0;
  const topUpCount = topupAgg[0]?.count ?? 0;

  return {
    totalCashOrders: orderCount,
    totalCashOrderAmount: orderAmount,
    totalCashTopUps: topUpCount,
    totalCashTopUpAmount: topUpAmount,
    totalCashCollected: orderAmount + topUpAmount,
  };
}

/**
 * Fetches the most recent cash activities across all or specific stores.
 * Required for the dashboard widget. Unfiltered by design — always cash, no date bounds.
 */
export async function getRecentCashActivities(
  storeId?: string | null,
  limit = 6,
): Promise<CashActivity[]> {
  await dbConnect();
  const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;

  const orderMatch: CashFilterQuery = {
    paymentMode: "cash",
    status: "completed",
  };
  if (sid) orderMatch.storeId = sid;

  const topupMatch: CashFilterQuery = { paymentMode: "cash" };
  if (sid) {
    const cashierIds = await getCashierIdsForStore(sid);
    topupMatch.userId = { $in: cashierIds };
  }

  const [orderDocs, topupDocs] = await Promise.all([
    OrderModel.aggregate([
      { $match: orderMatch },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      ...orderLookups,
    ]),
    WalletTopUp.aggregate([
      { $match: topupMatch },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      ...topupLookups,
    ]),
  ]);

  return mergeAndSort(
    (orderDocs as DBQueryResult[]).map(mapOrder),
    (topupDocs as DBQueryResult[]).map(mapTopUp),
    limit,
  );
}

export async function getCashActivitiesPaginated(
  storeId: string | null | undefined,
  page = 1,
  limit = 8,
  paymentMode: PaymentModeFilter = "all",
  startDate?: Date,
  endDate?: Date,
): Promise<CashActivityResult> {
  try {
    await dbConnect();
    const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;
    const dateClause = buildDateClause(startDate, endDate);

    const orderMatch: CashFilterQuery = {
      status: "completed",
      ...dateClause,
    };
    if (sid) orderMatch.storeId = sid;
    if (paymentMode !== "all") orderMatch.paymentMode = paymentMode;

    const topupMatch: CashFilterQuery = { ...dateClause };
    if (paymentMode !== "all") topupMatch.paymentMode = paymentMode;
    if (sid) {
      const cashierIds = await getCashierIdsForStore(sid);
      topupMatch.userId = { $in: cashierIds };
    }

    const [orderDocs, topupDocs] = await Promise.all([
      OrderModel.aggregate([
        { $match: orderMatch },
        { $sort: { createdAt: -1 } },
        ...orderLookups,
      ]),
      WalletTopUp.aggregate([
        { $match: topupMatch },
        { $sort: { createdAt: -1 } },
        ...topupLookups,
      ]),
    ]);

    const all = mergeAndSort(
      (orderDocs as DBQueryResult[]).map(mapOrder),
      (topupDocs as DBQueryResult[]).map(mapTopUp),
    );

    const totalCount = all.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const data = all.slice((page - 1) * limit, page * limit);

    return { success: true, data, totalPages, totalCount };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error.message,
    };
  }
}
