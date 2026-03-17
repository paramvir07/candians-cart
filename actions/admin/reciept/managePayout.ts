"use server";

import mongoose from "mongoose";
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
      
      // Financial breakdown fields
      totalCustomerPaid: payout.totalCustomerPaid,
      totalGST: payout.totalGST,
      totalPST: payout.totalPST,
      totalTax: payout.totalTax,
      totalSubsidy: payout.totalSubsidy || 0,
      totalDisposableFee: payout.totalDisposableFee,
      storeFixedValue: payout.storeFixedValue,
      storeProfit: payout.storeProfit,
      storePayout: payout.storePayout,
      totalCashCollected: payout.totalCashCollected || 0,
      platformProfit: payout.platformProfit,
      platformCommision: payout.platformCommision,
      
      // Status and metadata
      status: payout.status,
      additionalNote: payout.additionalNote || "",
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
    paymentReciept?: { url: string; fileId: string } | null;
  },
) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }

    const updated = await StorePayoutModel.findByIdAndUpdate(
      payoutId,
      { $set: data },
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
