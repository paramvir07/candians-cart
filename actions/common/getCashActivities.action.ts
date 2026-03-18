"use server";

import { dbConnect } from "@/db/dbConnect";
import { Cashier } from "@/db/models/cashier/cashier.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";

// ─── Schema reference (CONFIRMED) ─────────────────────────────────────────────
//
// Order:       userId (ObjectId → Customer._id), storeId, cartTotal, cashierId (ObjectId → Cashier._id)
// WalletTopUp: customerId (ObjectId → Customer._id), userId (String = Cashier._id), value, paymentMode
// Cashier:     _id, userId (ObjectId → Auth/User), name, storeId
//
// Cash collection only ever involves cashiers (paymentMode: "cash").
// Admin top-ups are always paymentMode: "gift" — never appear in cash queries.
//
// Correct join patterns:
//   Order → Customer:    Order.userId          → Customer._id        (foreignField: "_id")
//   Order → Cashier:     Order.cashierId       → Cashier._id         (foreignField: "_id")
//   Order → Store:       Order.storeId         → Store._id           (foreignField: "_id")
//   TopUp → Customer:    WalletTopUp.customerId → Customer._id       (foreignField: "_id")
//   TopUp → Cashier:     $toObjectId(WalletTopUp.userId) → Cashier._id  (foreignField: "_id")
//   TopUp → Store:       Cashier.storeId       → Store._id           (via cashier)
// ──────────────────────────────────────────────────────────────────────────────

export type CashActivityType = "order" | "wallet_topup";

export interface CashActivity {
  id: string;
  type: CashActivityType;
  label: string;
  customerName: string;
  cashierName: string;
  storeName: string;
  storeId: string;
  amount: number; // cents
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

// ─── Scope topups to a store ───────────────────────────────────────────────────
// WalletTopUp.userId stores Cashier._id as a String.
// Find Cashier._ids for the store, cast to string, match against WalletTopUp.userId.

async function getCashierIdsForStore(
  storeId: mongoose.Types.ObjectId,
): Promise<string[]> {
  const cashiers = await Cashier.find({ storeId }).select("_id").lean();
  return (cashiers as any[]).map((c) => c._id.toString());
}

// ─── Lookup stages: cash orders ───────────────────────────────────────────────

const orderLookups = [
  // Order.userId → Customer._id  (userId on Order IS Customer._id)
  {
    $lookup: {
      from: "customers",
      localField: "userId",
      foreignField: "_id",
      as: "customer",
    },
  },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  // Order.storeId → Store._id
  {
    $lookup: {
      from: "stores",
      localField: "storeId",
      foreignField: "_id",
      as: "store",
    },
  },
  { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
  // Order.cashierId → Cashier._id
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
      customerName: "$customer.name",
      cashierName: "$cashier.name",
      storeName: "$store.name",
      storeId: "$storeId",
      createdAt: 1,
    },
  },
];

// ─── Lookup stages: cash wallet top-ups ──────────────────────────────────────

const topupLookups = [
  // WalletTopUp.customerId → Customer._id
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer",
    },
  },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  // WalletTopUp.userId is a String storing Cashier._id → convert then join Cashier._id
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
  // Cashier.storeId → Store._id
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
      createdAt: 1,
    },
  },
];

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapOrder(o: any): CashActivity {
  return {
    id: o._id.toString(),
    type: "order",
    label: "Cash Order",
    customerName: o.customerName ?? "Unknown",
    cashierName: o.cashierName ?? "—",
    storeName: o.storeName ?? "Unknown Store",
    storeId: o.storeId?.toString() ?? "",
    amount: o.amount,
    createdAt: o.createdAt,
  };
}

function mapTopUp(t: any): CashActivity {
  return {
    id: t._id.toString(),
    type: "wallet_topup",
    label: "Cash Top-Up",
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

// ─── Summary ──────────────────────────────────────────────────────────────────

export async function getCashSummary(
  storeId?: string | null,
): Promise<CashSummary> {
  await dbConnect();
  const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;

  const orderMatch: Record<string, any> = {
    paymentMode: "cash",
    status: "completed",
  };
  if (sid) orderMatch.storeId = sid;

  const topupMatch: Record<string, any> = { paymentMode: "cash" };
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

  const cashOrderAmount = orderAgg[0]?.total ?? 0;
  const cashOrderCount = orderAgg[0]?.count ?? 0;
  const cashTopUpAmount = topupAgg[0]?.total ?? 0;
  const cashTopUpCount = topupAgg[0]?.count ?? 0;

  return {
    totalCashOrders: cashOrderCount,
    totalCashOrderAmount: cashOrderAmount,
    totalCashTopUps: cashTopUpCount,
    totalCashTopUpAmount: cashTopUpAmount,
    totalCashCollected: cashOrderAmount + cashTopUpAmount,
  };
}

// ─── Recent activities (widget) ───────────────────────────────────────────────

export async function getRecentCashActivities(
  storeId?: string | null,
  limit = 6,
): Promise<CashActivity[]> {
  await dbConnect();
  const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;

  const orderMatch: Record<string, any> = {
    paymentMode: "cash",
    status: "completed",
  };
  if (sid) orderMatch.storeId = sid;

  const topupMatch: Record<string, any> = { paymentMode: "cash" };
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
    (orderDocs as any[]).map(mapOrder),
    (topupDocs as any[]).map(mapTopUp),
    limit,
  );
}

// ─── Paginated full list ───────────────────────────────────────────────────────

export async function getCashActivitiesPaginated(
  storeId: string | null | undefined,
  page = 1,
  limit = 15,
  typeFilter?: "all" | "order" | "wallet_topup",
  searchQuery?: string,
): Promise<CashActivityResult> {
  try {
    await dbConnect();
    const sid = storeId ? new mongoose.Types.ObjectId(storeId) : null;

    const fetchOrders =
      !typeFilter || typeFilter === "all" || typeFilter === "order";
    const fetchTopups =
      !typeFilter || typeFilter === "all" || typeFilter === "wallet_topup";

    const orderMatch: Record<string, any> = {
      paymentMode: "cash",
      status: "completed",
    };
    if (sid) orderMatch.storeId = sid;

    const topupMatch: Record<string, any> = { paymentMode: "cash" };
    if (sid) {
      const cashierIds = await getCashierIdsForStore(sid);
      topupMatch.userId = { $in: cashierIds };
    }

    const [orderDocs, topupDocs] = await Promise.all([
      fetchOrders
        ? OrderModel.aggregate([
            { $match: orderMatch },
            { $sort: { createdAt: -1 } },
            ...orderLookups,
          ])
        : Promise.resolve([]),
      fetchTopups
        ? WalletTopUp.aggregate([
            { $match: topupMatch },
            { $sort: { createdAt: -1 } },
            ...topupLookups,
          ])
        : Promise.resolve([]),
    ]);

    let all = mergeAndSort(
      (orderDocs as any[]).map(mapOrder),
      (topupDocs as any[]).map(mapTopUp),
    );

    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toLowerCase();
      all = all.filter(
        (a) =>
          a.customerName.toLowerCase().includes(q) ||
          a.cashierName.toLowerCase().includes(q) ||
          a.storeName.toLowerCase().includes(q) ||
          a.label.toLowerCase().includes(q),
      );
    }

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
