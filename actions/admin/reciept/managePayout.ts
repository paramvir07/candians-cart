"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import StorePayoutModel from "@/db/models/admin/storePayouts.model";
import { revalidatePath } from "next/cache";

export async function getStorePayoutByIdAction(payoutId: string) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }
    await dbConnect();

    const payout = await StorePayoutModel.findById(payoutId).lean();
    if (!payout) {
      return { success: false, message: "Payout not found", data: null };
    }
    const serializedPayout = {
      _id: payout._id.toString(),
      storeId: payout.storeId.toString(),
      startDate: payout.startDate.toISOString(),
      endDate: payout.endDate.toISOString(),

      // Order Information
      totalNumberofOrders: payout.totalNumberofOrders || 0,
      orderIds: payout.orderIds
        ? payout.orderIds.map((id: any) => id.toString())
        : [],

      // Complete Financial breakdown fields
      totalCustomerPaid: payout.totalCustomerPaid || 0,
      totalBasePrice: payout.totalBasePrice || 0,

      // Tax Breakdown
      totalGST: payout.totalGST || 0,
      totalPST: payout.totalPST || 0,
      totalTax: payout.totalTax || 0,
      baseTax: payout.baseTax || 0,
      markupTax: payout.markupTax || 0,

      // Store Taxes & Fees
      storebasetaxGST: payout.storebasetaxGST || 0,
      storebasetaxPST: payout.storebasetaxPST || 0,
      storeMarkupTax: payout.storeMarkupTax || 0,
      storeFixedValue: payout.storeFixedValue || 0,
      totalDisposableFee: payout.totalDisposableFee || 0,
      totalRevenue: payout.totalRevenue || 0,
      profitMargin: payout.profitMargin || 0,

      // Platform Taxes & Fees
      platformMarkupGSTTax: payout.platformMarkupGSTTax || 0,
      platformMarkupPSTTax: payout.platformMarkupPSTTax || 0,
      totalSubsidy: payout.totalSubsidy || 0,
      platformCommision: payout.platformCommision || 0,
      platformProfit: payout.platformProfit || 0,

      // Cash Collection
      totalWalletTopUpCashCollected: payout.totalWalletTopUpCashCollected || 0,
      totalOrderCashCollected: payout.totalOrderCashCollected || 0,
      totalCashCollected: payout.totalCashCollected || 0,

      // Final Calculations
      storeProfit: payout.storeProfit || 0,
      storePayout: payout.storePayout || 0,

      // Status and metadata
      status: payout.status,
      additionalNote: payout.additionalNote || "",
      additionalCost: payout.additionalCost || 0,
      paymentReciept: payout.paymentReciept
        ? {
            url: payout.paymentReciept.url,
            fileId: payout.paymentReciept.fileId,
          }
        : null,
      createdAt: payout.createdAt?.toISOString(),
      updatedAt: payout.updatedAt?.toISOString(),
    };

    return { success: true, data: serializedPayout };
  } catch (error) {
    console.error("[getStorePayoutByIdAction] Error:", error);
    return {
      success: false,
      message: "Failed to fetch payout details",
      data: null,
    };
  }
}

export async function updateStorePayoutAction(
  payoutId: string,
  data: {
    status: "pending" | "paid";
    additionalNote?: string;
    additionalCost?: number;
    paymentReciept?: { url: string; fileId: string } | null;
  },
) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }
    const UpdatedadditionalCost = Math.round(Number(data.additionalCost) * 100);

    const updated = await StorePayoutModel.findByIdAndUpdate(
      payoutId,
      { $set: { ...data, additionalCost: UpdatedadditionalCost } },
      { returnDocument: "after" },
    );

    if (!updated) {
      return { success: false, message: "Payout not found" };
    }
    revalidatePath(`/admin/store/${updated.storeId}/payout-reciepts`);
    revalidatePath(
      `/admin/store/${updated.storeId}/payout-reciepts/${payoutId}`,
    );

    return { success: true, message: "Payout updated successfully" };
  } catch (error) {
    console.error("[updateStorePayoutAction] Error:", error);
    return { success: false, message: "Failed to update payout" };
  }
}
