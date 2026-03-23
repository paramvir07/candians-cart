"use server";

import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import StorePayoutModel, {
  IStorePayout,
} from "@/db/models/admin/storePayouts.model";

export type PayoutStatus = "pending" | "paid";

export interface SerializedStorePayout {
  _id: string;
  startDate: string;
  endDate: string;
  totalCustomerPaid: number;
  storePayout: number;
  platformProfit: number;
  status: PayoutStatus;
  createdAt: string;
  additionalNote: string;
  paymentReciept: { url: string; fileId: string } | null;
  totalGST?: number;
  totalPST?: number;
    totalWalletTopUpCashCollected?: number;
  totalOrderCashCollected?: number;
  totalCashCollected?: number;
  storeProfit?: number;
}

type LeanPayout = IStorePayout & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export interface PayoutAnalyticsStats {
  totalPayouts: number;
  totalEarnings: number;
  currentMonthEarnings: number;
  monthlyEarningsIncrease: number; 
  newPayoutsThisMonth: number;
}

export async function getVendorPayoutsAction(
  storeId: string,
  filters?: { status?: PayoutStatus | "all"; from?: Date; to?: Date },
) {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role === "Customer") {
      return { success: false, message: "Unauthorized", data: null };
    }
    await dbConnect();

    const query: Record<string, unknown> = {
      storeId: new mongoose.Types.ObjectId(storeId),
    };

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.from || filters?.to) {
      query.createdAt = {};
      if (filters.from) (query.createdAt as any).$gte = filters.from;
      if (filters.to) (query.createdAt as any).$lte = filters.to;
    }

    const payouts = await StorePayoutModel.find(query)
      .sort({ createdAt: -1 })
      .lean<LeanPayout[]>();

    // Best Practice: Minimize Serialization Payload
    const serializedData: SerializedStorePayout[] = payouts.map((p) => ({
      _id: p._id.toString(),
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      totalCustomerPaid: p.totalCustomerPaid,
      storePayout: p.storePayout,
      platformProfit: p.platformProfit,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      additionalNote: p.additionalNote || "",
      paymentReciept: p.paymentReciept
        ? {
            url: p.paymentReciept.url,
            fileId: p.paymentReciept.fileId,
          }
        : null,
    }));

    return { success: true, data: serializedData };
  } catch (error) {
    console.error(`[getVendorPayoutsAction] Error:`, error);
    return { success: false, message: "Failed to fetch payouts", data: null };
  }
}

export async function getSingleVendorPayoutAction(payoutId: string, storeId: string) {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role === "Customer") {
      return { success: false, message: "Unauthorized", data: null };
    }

    await dbConnect();

    // Secure query: Must match both payoutId AND the authenticated user's storeId
    const payout = await StorePayoutModel.findOne({
      _id: new mongoose.Types.ObjectId(payoutId),
      storeId: new mongoose.Types.ObjectId(storeId),
    }).lean<LeanPayout>();

    if (!payout) {
      return { success: false, message: "Payout not found", data: null };
    }

    const serializedData: SerializedStorePayout = {
      _id: payout._id.toString(),
      startDate: payout.startDate.toISOString(),
      endDate: payout.endDate.toISOString(),
      totalCustomerPaid: payout.totalCustomerPaid,
      storePayout: payout.storePayout,
      platformProfit: payout.platformProfit,
      status: payout.status,
      createdAt: payout.createdAt.toISOString(),
      additionalNote: payout.additionalNote || "",
      paymentReciept: payout.paymentReciept ? {
        url: payout.paymentReciept.url,
        fileId: payout.paymentReciept.fileId,
      } : null,
    };

    return { success: true, data: serializedData };
  } catch (error) {
    console.error(`[getSingleVendorPayoutAction] Error:`, error);
    return { success: false, message: "Failed to fetch payout details", data: null };
  }
}

export async function getPayoutAnalyticsAction(storeId: string) {
  try {
    const session = await getUserSession();
    if (!session?.user?.id || session.user.role === "Customer") {
      return { success: false, message: "Unauthorized", data: null };
    }
    
    await dbConnect();

    // Calculate dates for current vs previous month comparisons
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Only count 'paid' status for revenue numbers
    const payouts = await StorePayoutModel.find({
      storeId: new mongoose.Types.ObjectId(storeId),
      status: "paid"
    }).lean<LeanPayout[]>();

    const totalPayouts = payouts.length;
    let totalEarnings = 0;
    let currentMonthEarnings = 0;
    let lastMonthEarnings = 0;
    let newPayoutsThisMonth = 0;

    for (const p of payouts) {
      const payoutAmount = p.storePayout || 0;
      totalEarnings += payoutAmount;
      
      const pDate = new Date(p.createdAt);
      if (pDate >= startOfCurrentMonth && pDate < startOfNextMonth) {
        currentMonthEarnings += payoutAmount;
        newPayoutsThisMonth++;
      } else if (pDate >= startOfLastMonth && pDate < startOfCurrentMonth) {
        lastMonthEarnings += payoutAmount;
      }
    }

    let monthlyEarningsIncrease = 0;
    if (lastMonthEarnings > 0) {
      monthlyEarningsIncrease = Math.round(((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100);
    } else if (currentMonthEarnings > 0) {
      monthlyEarningsIncrease = 100;
    }

    const data: PayoutAnalyticsStats = {
      totalPayouts,
      totalEarnings,
      currentMonthEarnings,
      monthlyEarningsIncrease,
      newPayoutsThisMonth,
    };

    return { success: true, data };
  } catch (error) {
    console.error(`[getPayoutAnalyticsAction] Error:`, error);
    return { success: false, message: "Failed to fetch payout analytics", data: null };
  }
}