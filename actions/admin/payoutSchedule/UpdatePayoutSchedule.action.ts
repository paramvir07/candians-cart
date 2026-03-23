"use server";

import { dbConnect } from "@/db/dbConnect";
import Store, { PayoutFrequency } from "@/db/models/store/store.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { revalidatePath } from "next/cache";
import { computeNextPayoutDate } from "@/lib/PayoutSchedule";

export interface UpdatePayoutScheduleInput {
  enabled: boolean;
  frequency: PayoutFrequency;
  dayOfMonth?: number; // 1–28, used when frequency = "monthly"
  dayOfWeek?: number;  // 0–6, used when frequency = "biweekly"
}

export interface UpdatePayoutScheduleResult {
  success: boolean;
  message: string;
}

/**
 * Admin-only action to update a store's auto-payout schedule.
 * Computes and stores the next scheduled payout date immediately.
 */
export async function updatePayoutScheduleAction(
  storeId: string,
  input: UpdatePayoutScheduleInput,
): Promise<UpdatePayoutScheduleResult> {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    // Basic input validation
    if (input.frequency === "monthly") {
      const day = input.dayOfMonth ?? 1;
      if (day < 1 || day > 28) {
        return {
          success: false,
          message: "Day of month must be between 1 and 28",
        };
      }
    }

    if (input.frequency === "biweekly") {
      const dow = input.dayOfWeek ?? 1;
      if (dow < 0 || dow > 6) {
        return {
          success: false,
          message: "Day of week must be between 0 (Sun) and 6 (Sat)",
        };
      }
    }

    await dbConnect();

    const store = await Store.findById(storeId).lean();
    if (!store) {
      return { success: false, message: "Store not found" };
    }

    // Compute the next payout date from right now
    const nextPayoutDate = input.enabled
      ? computeNextPayoutDate({
          frequency: input.frequency,
          dayOfMonth: input.dayOfMonth ?? 1,
          dayOfWeek: input.dayOfWeek ?? 1,
          fromDate: new Date(),
        })
      : null;

    await Store.findByIdAndUpdate(storeId, {
      $set: {
        "payoutSchedule.enabled": input.enabled,
        "payoutSchedule.frequency": input.frequency,
        "payoutSchedule.dayOfMonth": input.dayOfMonth ?? 1,
        "payoutSchedule.dayOfWeek": input.dayOfWeek ?? 1,
        "payoutSchedule.nextPayoutDate": nextPayoutDate,
        // Do NOT reset lastPayoutDate — keep the history
      },
    });

    revalidatePath(`/admin/store/${storeId}`);
    revalidatePath(`/admin/store/${storeId}/payout-reciepts`);

    return {
      success: true,
      message: input.enabled
        ? `Auto-payout enabled. Next payout scheduled for ${nextPayoutDate?.toLocaleDateString("en-CA")}.`
        : "Auto-payout disabled.",
    };
  } catch (error) {
    console.error("[updatePayoutScheduleAction] Error:", error);
    return { success: false, message: "Failed to update payout schedule" };
  }
}

/**
 * Get the current payout schedule for a store (admin only).
 */
export async function getPayoutScheduleAction(storeId: string) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, message: "Unauthorized", data: null };
    }

    await dbConnect();

    const store = await Store.findById(storeId)
      .select("payoutSchedule name")
      .lean();

    if (!store) {
      return { success: false, message: "Store not found", data: null };
    }

    const schedule = (store as any).payoutSchedule;

    return {
      success: true,
      data: {
        storeName: (store as any).name,
        enabled: schedule?.enabled ?? false,
        frequency: (schedule?.frequency ?? "monthly") as PayoutFrequency,
        dayOfMonth: schedule?.dayOfMonth ?? 1,
        dayOfWeek: schedule?.dayOfWeek ?? 1,
        lastPayoutDate: schedule?.lastPayoutDate
          ? new Date(schedule.lastPayoutDate).toISOString()
          : null,
        nextPayoutDate: schedule?.nextPayoutDate
          ? new Date(schedule.nextPayoutDate).toISOString()
          : null,
      },
    };
  } catch (error) {
    console.error("[getPayoutScheduleAction] Error:", error);
    return { success: false, message: "Failed to fetch payout schedule", data: null };
  }
}