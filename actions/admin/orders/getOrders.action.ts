"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";

export interface AdminOrder {
  orderId: string;
  orderRef: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: "pending" | "completed";
  paymentMode: "wallet" | "cash" | "card" | "pending";
  createdAt: Date;
}

export interface DateRange {
  from: string; // "YYYY-MM-DD"
  to: string;   // "YYYY-MM-DD"
}

export interface GetOrdersResult {
  success: boolean;
  data: AdminOrder[];
  totalPages: number;
  totalCount: number;
  error?: string;
}

function buildLookupStages() {
  return [
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
        storeId: 1,
        storeName: "$store.name",
        userId: 1,
        customerId: "$customer._id",
        customerName: "$customer.name",
        amount: "$cartTotal",
        status: 1,
        paymentMode: 1,
        createdAt: 1,
      },
    },
  ];
}

function mapDoc(o: any): AdminOrder {
  return {
    orderId: o._id.toString(),
    orderRef: `LPO/${o._id.toString().slice(-6).toUpperCase()}`,
    storeId: o.storeId?.toString() ?? "",
    storeName: o.storeName ?? "Unknown Store",
    customerId: o.customerId?.toString() ?? o.userId?.toString() ?? "",
    customerName: o.customerName ?? "—",
    amount: o.amount ?? 0,
    status: o.status,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt,
  };
}

function buildDateMatch(dateRange: DateRange): Record<string, any> {
  // Treat the YYYY-MM-DD strings as Vancouver-local midnight boundaries.
  // Constructing with explicit time avoids UTC-shift surprises at the edges.
  const fromDate = new Date(`${dateRange.from}T00:00:00-08:00`);
  const toDate   = new Date(`${dateRange.to}T23:59:59.999-08:00`);
  return { createdAt: { $gte: fromDate, $lte: toDate } };
}

export async function getOrdersPaginated(
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 5,
  dateRange: DateRange | null = null,
): Promise<GetOrdersResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {};
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);
    if (dateRange) Object.assign(match, buildDateMatch(dateRange));

    const skip = (page - 1) * limit;

    const [docs, totalCount] = await Promise.all([
      OrderModel.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        ...buildLookupStages(),
      ]),
      OrderModel.countDocuments(match),
    ]);

    return {
      success: true,
      data: docs.map(mapDoc),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
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

export async function searchOrders(
  query: string,
  storeId?: string,
): Promise<GetOrdersResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {};
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

    const docs = await OrderModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
      ...buildLookupStages(),
    ]);

    const q = query.trim().toLowerCase();
    const filtered = docs
      .map(mapDoc)
      .filter(
        (o) =>
          o.orderRef.toLowerCase().includes(q) ||
          o.storeName.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q),
      );

    return {
      success: true,
      data: filtered,
      totalPages: 1,
      totalCount: filtered.length,
    };
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

export async function getFullOrderDetails(orderId: string) {
  try {
    await dbConnect();
    const order = await OrderModel.findById(orderId)
      .populate([
        { path: "products.productId", model: "Product" },
        { path: "subsidyItems.productId", model: "Product" },
      ])
      .lean();

    if (!order) return { success: false, error: "Order not found" };

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}