"use server";

import { dbConnect } from "@/db/dbConnect";
import { Cashier } from "@/db/models/cashier/cashier.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import mongoose from "mongoose";

export interface CashActivity {
  id: string;
  label: string;
  customerName: string;
  cashierName: string;
  storeName: string;
  storeId: string;
  amount: number;
  cashPaid: number;
  cashDue: number;
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
  totalCashTopUps: number;
  totalCashTopUpAmount: number;
  totalCashCollected: number;
}

interface DBQueryResult {
  _id: mongoose.Types.ObjectId;
  amount: number;
  customerName?: string;
  cashierName?: string;
  storeName?: string;
  storeId?: mongoose.Types.ObjectId;
  cashPaid?: number;
  cashDue?: number;
  createdAt: Date;
}

interface CashFilterQuery {
  paymentMode: "cash";
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

// Builds the base cash-only match clause, optionally scoped to a store.
async function buildTopupMatch(
  sid: mongoose.Types.ObjectId | null,
  dateClause: { createdAt?: { $gte?: Date; $lte?: Date } },
): Promise<CashFilterQuery> {
  const match: CashFilterQuery = { paymentMode: "cash", ...dateClause };
  if (sid) {
    const cashierIds = await getCashierIdsForStore(sid);
    match.userId = { $in: cashierIds };
  }
  return match;
}

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
      customerName: "$customer.name",
      cashierName: "$cashier.name",
      storeName: "$store.name",
      storeId: "$cashier.storeId",
      cashPaid: 1,
      cashDue: 1,
      createdAt: 1,
    },
  },
];

function mapTopUp(t: DBQueryResult): CashActivity {
  return {
    id: t._id.toString(),
    label: "Cash Top-Up",
    customerName: t.customerName ?? "Unknown",
    cashierName: t.cashierName ?? "—",
    storeName: t.storeName ?? "Unknown Store",
    storeId: t.storeId?.toString() ?? "",
    amount: t.amount,
    cashPaid: t.cashPaid ?? 0,
    cashDue: t.cashDue ?? 0,
    createdAt: t.createdAt,
  };
}

export async function getCashSummary(
  storeId?: string | null,
  startDate?: Date,
  endDate?: Date,
): Promise<CashSummary> {
  await dbConnect();
  const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;
  const dateClause = buildDateClause(startDate, endDate);
  const topupMatch = await buildTopupMatch(sid, dateClause);

  const [topupAgg] = await Promise.all([
    WalletTopUp.aggregate([
      { $match: topupMatch },
      { $group: { _id: null, total: { $sum: "$value" }, count: { $sum: 1 } } },
    ]),
  ]);

  const topUpAmount = topupAgg[0]?.total ?? 0;
  const topUpCount = topupAgg[0]?.count ?? 0;

  return {
    totalCashTopUps: topUpCount,
    totalCashTopUpAmount: topUpAmount,
    totalCashCollected: topUpAmount,
  };
}

/**
 * Fetches the most recent cash top-ups across all or specific stores.
 * Required for the dashboard widget. Unfiltered by design — always cash, no date bounds.
 */
export async function getRecentCashActivities(
  storeId?: string | null,
  limit = 6,
): Promise<CashActivity[]> {
  await dbConnect();
  const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;
  const topupMatch = await buildTopupMatch(sid, {});

  const topupDocs = await WalletTopUp.aggregate([
    { $match: topupMatch },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    ...topupLookups,
  ]);

  return (topupDocs as DBQueryResult[]).map(mapTopUp);
}

export async function getCashActivitiesPaginated(
  storeId: string | null | undefined,
  page = 1,
  limit = 8,
  startDate?: Date,
  endDate?: Date,
): Promise<CashActivityResult> {
  try {
    await dbConnect();
    const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;
    const dateClause = buildDateClause(startDate, endDate);
    const topupMatch = await buildTopupMatch(sid, dateClause);

    const topupDocs = await WalletTopUp.aggregate([
      { $match: topupMatch },
      { $sort: { createdAt: -1 } },
      ...topupLookups,
    ]);

    const all = (topupDocs as DBQueryResult[]).map(mapTopUp);

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