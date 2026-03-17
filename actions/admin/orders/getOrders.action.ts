"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import mongoose from "mongoose";

export interface AdminOrder {
  orderId: string;
  orderRef: string;
  storeId: string;
  storeName: string;
  customerId: string;   // Customer._id — used for the /admin/customers/[customerId] link
  customerName: string; // Customer.name
  amount: number;
  status: "pending" | "completed";
  paymentMode: "wallet" | "cash" | "card" | "pending";
  createdAt: Date;
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
    // Join Store
    {
      $lookup: {
        from: "stores",
        localField: "storeId",
        foreignField: "_id",
        as: "store",
      },
    },
    { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },

    // Join Customer — Order.userId matches Customer._id (both ref the Auth user)
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
        // Customer._id is what we use for the detail page link
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
    // customerId = Customer._id, fallback to userId so link still points somewhere
    customerId: o.customerId?.toString() ?? o.userId?.toString() ?? "",
    customerName: o.customerName ?? "—",
    amount: o.amount ?? 0,
    status: o.status,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt,
  };
}

export async function getOrdersPaginated(
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 12,
  statusFilter?: "pending" | "completed" | "all",
  dateFilter?: "today" | "week" | "month" | "all",
): Promise<GetOrdersResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {};
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);
    if (statusFilter && statusFilter !== "all") match.status = statusFilter;

    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      if (dateFilter === "today") {
        match.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
      } else if (dateFilter === "week") {
        match.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      } else if (dateFilter === "month") {
        match.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      }
    }

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
    return { success: false, data: [], totalPages: 0, totalCount: 0, error: error.message };
  }
}

export async function searchOrders(
  query: string,
  storeId?: string,
  statusFilter?: "pending" | "completed" | "all",
): Promise<GetOrdersResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {};
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);
    if (statusFilter && statusFilter !== "all") match.status = statusFilter;

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
          o.customerName.toLowerCase().includes(q) ||
          o.status.includes(q),
      );

    return { success: true, data: filtered, totalPages: 1, totalCount: filtered.length };
  } catch (error: any) {
    return { success: false, data: [], totalPages: 0, totalCount: 0, error: error.message };
  }
}