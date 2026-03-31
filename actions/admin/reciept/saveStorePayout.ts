"use server";
import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import StorePayoutModel from "@/db/models/admin/storePayouts.model";
import { AggregatedReciept } from "./generateReciept";

export async function saveStorePayoutAction(
  receipt: AggregatedReciept,
  startDate: Date,
  endDate: Date,
) {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    if (!receipt._id) {
      throw new Error("Cannot save platform-wide reciept");
    }
    await dbConnect();

    const existingPayout = await StorePayoutModel.findOne({
      storeId: receipt._id,
      startDate: startDate,
      endDate: endDate,
    });

    if (existingPayout) {
      throw new Error(
        "A payout for this store and the exact date range already exists",
      );
    }

    console.log(
      receipt.orderCount,
      receipt.orderIds.map((id) => new mongoose.Types.ObjectId(id)),
    );

    const newPayout = await StorePayoutModel.create({
      startDate,
      endDate,
      totalNumberofOrders: receipt.orderCount,
      orderIds: receipt.orderIds.map((id) => new mongoose.Types.ObjectId(id)),
      storeId: new mongoose.Types.ObjectId(receipt._id),
      totalCustomerPaid: receipt.totalCustomerPaid,
      totalGST: receipt.totalGST,
      totalPST: receipt.totalPST,
      totalTax: receipt.totalTax,
      baseTax: receipt.baseTax,
      markupTax: receipt.markupTax,
      storebasetaxGST: receipt.storebasetaxGST,
      storebasetaxPST: receipt.storebasetaxPST,
      platformMarkuptax: receipt.platformMarkuptax,
      totalDisposableFee: receipt.totalDisposableFee,
      storeFixedValue: receipt.storeFixedValue,
      storeProfit: receipt.storeProfit,
      storePayout: receipt.storePayout,
      totalWalletTopUpCashCollected: receipt.totalWalletTopUpCashCollected || 0,
      totalOrderCashCollected: receipt.totalOrderCashCollected || 0,
      totalCashCollected: receipt.totalCashCollected || 0,
      platformProfit: receipt.platformProfit,
      platformCommision: receipt.platformCommision,
      status: "pending",
    });

    console.log("saved")

    return {
      success: true,
      message: "Payout record saved successfully",
      payoutId: newPayout._id.toString(),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[saveStorePayoutAction] Database error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
