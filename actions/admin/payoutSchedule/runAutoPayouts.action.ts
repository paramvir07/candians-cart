"use server";

import { dbConnect } from "@/db/dbConnect";
import Store from "@/db/models/store/store.model";
import { getRecieptDataByDateRange } from "@/actions/admin/reciept/generateReciept";
import { saveStorePayoutAction } from "@/actions/admin/reciept/saveStorePayout";
import {
  isPayoutDue,
  computePayoutDateRange,
  computeNextPayoutDate,
} from "@/lib/PayoutSchedule";

export interface AutoPayoutResult {
  storeId: string;
  storeName: string;
  status: "success" | "skipped" | "error" | "no_orders";
  message: string;
  payoutId?: string;
}

export interface RunAutoPayoutsResult {
  processedAt: string;
  totalStores: number; // stores with auto-payout enabled
  successful: number;
  skipped: number;
  errors: number;
  results: AutoPayoutResult[];
}

/**
 * Main cron job logic.
 *
 * Called by the Vercel cron API route once per day.
 * - Finds all stores with payoutSchedule.enabled = true
 * - Checks if each store is due for a payout today
 * - Generates and saves the payout using existing logic
 * - Updates lastPayoutDate and nextPayoutDate on the store
 * - Returns a full audit log of what happened
 */
export async function runAutoPayouts(): Promise<RunAutoPayoutsResult> {
  const now = new Date();
  const processedAt = now.toISOString();

  await dbConnect();

  // Fetch all stores that have auto-payout enabled
  const stores = await Store.find({
    "payoutSchedule.enabled": true,
  })
    .select("_id name payoutSchedule")
    .lean();

  const results: AutoPayoutResult[] = [];

  for (const store of stores) {
    const storeId = (store._id as any).toString();
    const storeName = (store as any).name as string;
    const schedule = (store as any).payoutSchedule;

    try {
      const due = isPayoutDue({
        frequency: schedule.frequency,
        dayOfMonth: schedule.dayOfMonth,
        dayOfWeek: schedule.dayOfWeek,
        lastPayoutDate: schedule.lastPayoutDate
          ? new Date(schedule.lastPayoutDate)
          : null,
        now,
      });

      if (!due) {
        results.push({
          storeId,
          storeName,
          status: "skipped",
          message: "Not due yet based on schedule",
        });
        continue;
      }

      // Compute the date range for this payout period
      const { startDate, endDate } = computePayoutDateRange({
        frequency: schedule.frequency,
        lastPayoutDate: schedule.lastPayoutDate
          ? new Date(schedule.lastPayoutDate)
          : null,
        now,
      });

      // Use the existing receipt generation logic
      let receiptData;
      try {
        const receipts = await getRecieptDataByDateRange({
          startDate,
          endDate,
          storeId,
          status: "completed",
        });
        receiptData = receipts[0]; // scoped to one store so always index 0
      } catch (err: any) {
        // getRecieptDataByDateRange throws if no orders found
        if (err?.message?.includes("No completed orders")) {
          // Update nextPayoutDate even if there were no orders — keeps the schedule moving
          const nextPayoutDate = computeNextPayoutDate({
            frequency: schedule.frequency,
            dayOfMonth: schedule.dayOfMonth,
            dayOfWeek: schedule.dayOfWeek,
            fromDate: now,
          });

          await Store.findByIdAndUpdate(storeId, {
            $set: {
              "payoutSchedule.lastPayoutDate": now,
              "payoutSchedule.nextPayoutDate": nextPayoutDate,
            },
          });

          results.push({
            storeId,
            storeName,
            status: "no_orders",
            message: `No completed orders between ${startDate.toLocaleDateString("en-CA")} and ${endDate.toLocaleDateString("en-CA")}. Schedule advanced.`,
          });
          continue;
        }
        throw err; // Rethrow unexpected errors
      }

      if (!receiptData) {
        results.push({
          storeId,
          storeName,
          status: "no_orders",
          message: "No receipt data returned",
        });
        continue;
      }

      // Save the payout using the existing action
      // Note: saveStorePayoutAction requires an admin session which we don't have in a cron.
      // So we call the DB logic directly here (the action is just a thin wrapper anyway).
      const saveResult = await savePayoutDirectly(
        receiptData,
        startDate,
        endDate,
        storeId,
      );

      if (!saveResult.success) {
        results.push({
          storeId,
          storeName,
          status: "error",
          message: saveResult.error ?? "Failed to save payout",
        });
        continue;
      }

      // Update the store's schedule timestamps
      const nextPayoutDate = computeNextPayoutDate({
        frequency: schedule.frequency,
        dayOfMonth: schedule.dayOfMonth,
        dayOfWeek: schedule.dayOfWeek,
        fromDate: now,
      });

      await Store.findByIdAndUpdate(storeId, {
        $set: {
          "payoutSchedule.lastPayoutDate": now,
          "payoutSchedule.nextPayoutDate": nextPayoutDate,
        },
      });

      results.push({
        storeId,
        storeName,
        status: "success",
        message: `Payout generated for ${startDate.toLocaleDateString("en-CA")} – ${endDate.toLocaleDateString("en-CA")}`,
        payoutId: saveResult.payoutId,
      });
    } catch (error: any) {
      console.error(`[AutoPayout] Failed for store ${storeId}:`, error);
      results.push({
        storeId,
        storeName,
        status: "error",
        message: error?.message ?? "Unexpected error",
      });
    }
  }

  return {
    processedAt,
    totalStores: stores.length,
    successful: results.filter((r) => r.status === "success").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  };
}

/**
 * Direct DB save — bypasses the admin session check in saveStorePayoutAction
 * since cron jobs run without a user session.
 *
 * This mirrors saveStorePayoutAction but skips the auth check.
 */
async function savePayoutDirectly(
  receipt: any,
  startDate: Date,
  endDate: Date,
  storeId: string,
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  try {
    const mongoose = (await import("mongoose")).default;
    const StorePayoutModel = (
      await import("@/db/models/admin/storePayouts.model")
    ).default;

    // Idempotency check — don't create if one already exists for this range
    const existing = await StorePayoutModel.findOne({
      storeId: new mongoose.Types.ObjectId(storeId),
      startDate,
      endDate,
    });

    if (existing) {
      return {
        success: false,
        error:
          "Payout for this date range already exists (duplicate prevented)",
      };
    }

    const newPayout = await StorePayoutModel.create({
      startDate,
      endDate,
      storeId: new mongoose.Types.ObjectId(storeId),
      totalCustomerPaid: receipt.totalCustomerPaid,
      totalGST: receipt.totalGST,
      totalPST: receipt.totalPST,
      totalTax: receipt.totalTax,
      totalDisposableFee: receipt.totalDisposableFee,
      storeFixedValue: receipt.storeFixedValue,
      storeProfit: receipt.storeProfit,
      storePayout: receipt.storePayout,
      totalWalletTopUpCashCollected: receipt.totalWalletTopUpCashCollected || 0,
      totalOrderCashCollected: receipt.totalOrderCashCollected || 0,
      totalCashCollected: receipt.totalCashCollected || 0,
      platformProfit: receipt.platformProfit,
      platformCommision: receipt.platformCommision,
      // Auto-generated payouts start as pending — admin still marks as paid
      status: "pending",
    });

    return { success: true, payoutId: newPayout._id.toString() };
  } catch (error: any) {
    console.error("[savePayoutDirectly] Error:", error);
    return { success: false, error: error?.message ?? "DB error" };
  }
}
