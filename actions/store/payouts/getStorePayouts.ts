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
  storeId: string;
  orderIds: string[];
  startDate: string;
  endDate: string;
  totalCustomerPaid: number;
  totalBasePrice: number;
  totalGST: number;
  totalPST: number;
  totalTax: number;
  baseTax: number;
  markupTax: number;
  storebasetaxGST: number;
  storebasetaxPST: number;
  storeMarkupTax: number;
  totalSubsidy: number;
  totalDisposableFee: number;
  storeFixedValue: number;
  storeProfit: number;
  storePayout: number;
  totalWalletTopUpCashCollected: number;
  totalCashCollected?: number;
  platformMarkupGSTTax: number;
  platformMarkupPSTTax: number;
  platformProfit: number;
  platformCommision: number;
  status: PayoutStatus;
  createdAt: string;
  updatedAt: string;
  additionalNote: string;
  totalNumberofOrders: number;
  paymentReciept: { url: string; fileId: string } | null;
  additionalCost?: number;
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
      storeId: p.storeId.toString(),
      orderIds: p.orderIds?.map((id: any) => id.toString()) || [],
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : p.createdAt.toISOString(),
      totalNumberofOrders: p.totalNumberofOrders || 0,
      totalCustomerPaid: p.totalCustomerPaid || 0,
      totalBasePrice: p.totalBasePrice || 0,
      totalGST: p.totalGST || 0,
      totalPST: p.totalPST || 0,
      totalTax: p.totalTax || 0,
      baseTax: p.baseTax || 0,
      markupTax: p.markupTax || 0,
      storebasetaxGST: p.storebasetaxGST || 0,
      storebasetaxPST: p.storebasetaxPST || 0,
      storeMarkupTax: p.storeMarkupTax || 0,
      platformMarkupGSTTax: p.platformMarkupGSTTax || 0,
      platformMarkupPSTTax: p.platformMarkupPSTTax || 0,
      totalSubsidy: p.totalSubsidy || 0,
      totalDisposableFee: p.totalDisposableFee || 0,
      additionalCost: p.additionalCost || 0,
      storeFixedValue: p.storeFixedValue || 0,
      storeProfit: p.storeProfit || 0,
      storePayout: p.storePayout || 0,
      totalWalletTopUpCashCollected: p.totalWalletTopUpCashCollected || 0,
      totalCashCollected: p.totalCashCollected || 0,
      platformProfit: p.platformProfit || 0,
      platformCommision: p.platformCommision || 0,
      status: p.status,
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

export async function getSingleVendorPayoutAction(
  payoutId: string,
  storeId: string,
) {
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
      storeId: payout.storeId.toString(),
      orderIds: payout.orderIds?.map((id: any) => id.toString()) || [],
      startDate: payout.startDate.toISOString(),
      endDate: payout.endDate.toISOString(),
      createdAt: payout.createdAt.toISOString(),
      updatedAt: payout.updatedAt ? payout.updatedAt.toISOString() : payout.createdAt.toISOString(),
      totalNumberofOrders: payout.totalNumberofOrders || 0,
      totalCustomerPaid: payout.totalCustomerPaid || 0,
      totalBasePrice: payout.totalBasePrice || 0,
      totalGST: payout.totalGST || 0,
      totalPST: payout.totalPST || 0,
      totalTax: payout.totalTax || 0,
      baseTax: payout.baseTax || 0,
      markupTax: payout.markupTax || 0,
      storebasetaxGST: payout.storebasetaxGST || 0,
      storebasetaxPST: payout.storebasetaxPST || 0,
      storeMarkupTax: payout.storeMarkupTax || 0,
      platformMarkupGSTTax: payout.platformMarkupGSTTax || 0,
      platformMarkupPSTTax: payout.platformMarkupPSTTax || 0,
      totalSubsidy: payout.totalSubsidy || 0,
      totalDisposableFee: payout.totalDisposableFee || 0,
      additionalCost: payout.additionalCost || 0,
      storeFixedValue: payout.storeFixedValue || 0,
      storeProfit: payout.storeProfit || 0,
      storePayout: payout.storePayout || 0,
      totalWalletTopUpCashCollected: payout.totalWalletTopUpCashCollected || 0,
      totalCashCollected: payout.totalCashCollected || 0,
      platformProfit: payout.platformProfit || 0,
      platformCommision: payout.platformCommision || 0,
      status: payout.status,
      additionalNote: payout.additionalNote || "",
      paymentReciept: payout.paymentReciept
        ? {
            url: payout.paymentReciept.url,
            fileId: payout.paymentReciept.fileId,
          }
        : null,
    };

    return { success: true, data: serializedData };
  } catch (error) {
    console.error(`[getSingleVendorPayoutAction] Error:`, error);
    return {
      success: false,
      message: "Failed to fetch payout details",
      data: null,
    };
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
      status: "paid",
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
      monthlyEarningsIncrease = Math.round(
        ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100,
      );
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
    return {
      success: false,
      message: "Failed to fetch payout analytics",
      data: null,
    };
  }
}
