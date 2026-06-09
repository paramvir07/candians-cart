"use server";

import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import { PromoStats } from "@/types/promotions/promo.types";

// Promotion config — single source of truth
const PROMO_CONFIG = {
  startDate: new Date("2026-06-09T07:00:00.000Z"),
  minDays: 15,
  minCustomers: 200,
  minOrders: 1,
  prizeAmount: 500,
  currency: "CAD",
} as const;

function getFallbackPromoStats(): PromoStats {
  const targetCount = PROMO_CONFIG.minCustomers;

  const minDeadline = new Date(PROMO_CONFIG.startDate);
  minDeadline.setDate(minDeadline.getDate() + PROMO_CONFIG.minDays);

  const now = new Date();
  const diffMs = Math.max(0, minDeadline.getTime() - now.getTime());

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return {
    eligibleCount: 0,
    targetCount,
    progressPct: 0,
    timerDeadline: minDeadline.toISOString(),
    daysRemaining: days,
    hoursRemaining: hours,
    minutesRemaining: minutes,
    secondsRemaining: seconds,
    isReadyToDraw: false,
    startDate: PROMO_CONFIG.startDate.toISOString(),
  };
}

export async function getPromoStats(): Promise<PromoStats> {
  try {
    await dbConnect();

    const targetCount = PROMO_CONFIG.minCustomers;

    const eligibleAgg = await OrderModel.aggregate(
      [
        { $match: { status: "completed" } },
        { $group: { _id: "$userId" } },
        { $count: "total" },
      ],
      { maxTimeMS: 5000 },
    );

    const eligibleCount = eligibleAgg[0]?.total ?? 0;

    const minDeadline = new Date(PROMO_CONFIG.startDate);
    minDeadline.setDate(minDeadline.getDate() + PROMO_CONFIG.minDays);

    const now = new Date();

    let deadline = minDeadline;
    const bothConditionsMet =
      eligibleCount >= targetCount && now >= minDeadline;

    if (now > minDeadline && eligibleCount < targetCount) {
      deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    }

    const diffMs = Math.max(0, deadline.getTime() - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return {
      eligibleCount,
      targetCount,
      progressPct: Math.min(
        100,
        Math.round((eligibleCount / targetCount) * 100),
      ),
      timerDeadline: deadline.toISOString(),
      daysRemaining: days,
      hoursRemaining: hours,
      minutesRemaining: minutes,
      secondsRemaining: seconds,
      isReadyToDraw: bothConditionsMet,
      startDate: PROMO_CONFIG.startDate.toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch promotion stats:", error);
    return getFallbackPromoStats();
  }
}
