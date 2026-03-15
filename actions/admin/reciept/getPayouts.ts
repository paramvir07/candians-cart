"use server";

import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import StorePayoutModel from "@/db/models/admin/storePayouts.model";
import Store from "@/db/models/store/store.model";

export type PayoutStatus = "pending" | "paid";

export interface SerializedPayout {
  _id: string;
  startDate: string;
  endDate: string;
  totalCustomerPaid: number;
  storePayout: number;
  platformProfit: number;
  status: PayoutStatus;
  createdAt: string;
  hasReceipt: boolean;
}

export interface SerializedGlobalPayout extends SerializedPayout {
  store: {
    _id: string;
    name: string;
  } | null;
}

export async function getStorePayoutsAction(
  storeId: string,
  filters?: { status?: PayoutStatus | "all"; from?: Date; to?: Date },
) {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }

    await dbConnect();

    const query: any = { storeId: new mongoose.Types.ObjectId(storeId) };
    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.from || filters?.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = filters.from;
      if (filters.to) query.createdAt.$lte = filters.to;
    }

    const payouts = await StorePayoutModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    const serializedData: SerializedPayout[] = payouts.map((p: any) => ({
      _id: p._id.toString(),
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      totalCustomerPaid: p.totalCustomerPaid,
      storePayout: p.storePayout,
      platformProfit: p.platformProfit,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      hasReceipt: !!p.paymentReciept?.url,
    }));

    return {
      success: true,
      data: serializedData,
    };
  } catch (error) {
    console.error(`[getStorePayoutsAction] Error:`, error);
    return { success: false, message: "Failed to fetch payouts", data: null };
  }
}

export async function getAllStorePayoutsAction(filters?: {
  status?: PayoutStatus | "all";
  from?: Date;
  to?: Date;
}) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }

    await dbConnect();

    const query: any = {};

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.from || filters?.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = filters.from;
      if (filters.to) query.createdAt.$lte = filters.to;
    }

    const payouts = await StorePayoutModel.find(query)
      .populate({
        path: "storeId",
        select: "name _id",
        model: Store,
      })
      .sort({ createdAt: -1 })
      .lean();

    const serializedData: SerializedGlobalPayout[] = payouts.map((p: any) => ({
      _id: p._id.toString(),
      // Attach the populated store name safely
      store: p.storeId
        ? {
            _id: p.storeId._id.toString(),
            name: p.storeId.name,
          }
        : null,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      totalCustomerPaid: p.totalCustomerPaid,
      storePayout: p.storePayout,
      platformProfit: p.platformProfit,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      hasReceipt: !!p.paymentReciept?.url,
    }));

    return { success: true, data: serializedData };
  } catch (error) {
    console.error(`[getAllStorePayoutsAction] Error:`, error);
    return {
      success: false,
      message: "Failed to fetch all payouts",
      data: null,
    };
  }
}
