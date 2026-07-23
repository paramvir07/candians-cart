"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { PromoStats } from "@/types/promotions/promo.types";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// Promotion config — single source of truth
const PROMO_CONFIG = {
  // Reset: timer now counts 15 days forward from today, not from the original launch date.
  startDate: new Date("2026-07-22T00:00:00.000Z"),
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
    myStatus: null,
  };
}

export async function getPromoStats(): Promise<PromoStats> {
  try {
    await dbConnect();

    const targetCount = PROMO_CONFIG.minCustomers;

    // Eligibility = customer has placed their first order and unlocked their
    // subsidy on it. This is tracked directly on the Customer model.
    const eligibleCount = await Customer.countDocuments({
      placedFirstOrder: true,
    });

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

    // Current customer's own eligibility status — best-effort, no redirect on failure
    let myStatus: PromoStats["myStatus"] = null;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        const customer = await Customer.findOne(
          { userId: session.user.id },
          { placedFirstOrder: 1 },
        ).lean();

        if (!customer) {
          myStatus = null;
        } else {
          const c = customer as { placedFirstOrder?: boolean };
          myStatus = c.placedFirstOrder ? "eligible" : "not_eligible";
        }
      }
    } catch {
      myStatus = null;
    }

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
      myStatus,
    };
  } catch (error) {
    console.error("Failed to fetch promotion stats:", error);
    return getFallbackPromoStats();
  }
}
