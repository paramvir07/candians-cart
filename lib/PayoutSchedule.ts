import { PayoutFrequency } from "@/db/models/store/store.model";

interface ComputeNextPayoutDateParams {
  frequency: PayoutFrequency;
  dayOfMonth: number; // 1–28, used for "monthly"
  dayOfWeek: number; // 0–6, used for "biweekly"
  fromDate: Date; // Compute next date after this point
}

/**
 * Computes the next scheduled payout date after `fromDate`.
 *
 * Monthly: returns the next occurrence of `dayOfMonth` after `fromDate`.
 *   e.g. dayOfMonth=15, fromDate=Jan 20 → Feb 15
 *        dayOfMonth=15, fromDate=Jan 10 → Jan 15
 *
 * Biweekly: returns the next occurrence of `dayOfWeek` after `fromDate`,
 *   then the one 14 days after that is handled by the cron running every day
 *   and checking against lastPayoutDate (>= 14 days ago).
 *   So here we just return "the next occurrence of that weekday".
 */
export function computeNextPayoutDate({
  frequency,
  dayOfMonth,
  dayOfWeek,
  fromDate,
}: ComputeNextPayoutDateParams): Date {
  const base = new Date(fromDate);

  if (frequency === "monthly") {
    const candidate = new Date(
      base.getFullYear(),
      base.getMonth(),
      dayOfMonth,
      0,
      0,
      0,
      0,
    );
    if (candidate > base) {
      return candidate;
    }
    return new Date(
      base.getFullYear(),
      base.getMonth() + 1,
      dayOfMonth,
      0,
      0,
      0,
      0,
    );
  }
  // Biweekly — find next occurrence of dayOfWeek
  const result = new Date(base);
  result.setHours(0, 0, 0, 0);
  const currentDay = result.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) {
    // Already past that day this week — go to next week
    daysUntil += 7;
  }
  result.setDate(result.getDate() + daysUntil);
  return result;
}

/**
 * Determines whether a store is due for an auto-payout right now.
 *
 * Logic:
 * - If never run before (lastPayoutDate = null): due if today matches the scheduled day.
 * - Monthly: due if today's date-of-month matches dayOfMonth AND lastPayoutDate
 *   is from a previous month (or null).
 * - Biweekly: due if today's day-of-week matches dayOfWeek AND lastPayoutDate
 *   was at least 13 days ago (allowing a 1-day window for cron timing jitter).
 */
export function isPayoutDue({
  frequency,
  dayOfMonth,
  dayOfWeek,
  lastPayoutDate,
  now = new Date(),
}: {
  frequency: PayoutFrequency;
  dayOfMonth: number;
  dayOfWeek: number;
  lastPayoutDate: Date | null;
  now?: Date;
}): boolean {
  if (frequency === "monthly") {
    const todayDOM = now.getDate();
    if (todayDOM !== dayOfMonth) return false;

    if (!lastPayoutDate) return true;

    // Check if last payout was in a previous month
    const lastMonth = new Date(lastPayoutDate).getMonth();
    const lastYear = new Date(lastPayoutDate).getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return (
      currentYear > lastYear ||
      (currentYear === lastYear && currentMonth > lastMonth)
    );
  }

  // Biweekly
  const todayDOW = now.getDay();
  if (todayDOW !== dayOfWeek) return false;

  if (!lastPayoutDate) return true;

  // At least 13 days since last payout (14-day cycle, 1 day grace)
  const daysSinceLast = Math.floor(
    (now.getTime() - new Date(lastPayoutDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return daysSinceLast >= 13;
}

/**
 * Computes the date range for a payout period.
 *
 * The start is the day AFTER the lastPayoutDate (or 30/14 days ago if never run).
 * The end is yesterday at 23:59:59 UTC (we never include today — orders might still come in).
 */
export function computePayoutDateRange({
  frequency,
  lastPayoutDate,
  now = new Date(),
}: {
  frequency: PayoutFrequency;
  lastPayoutDate: Date | null;
  now?: Date;
}): { startDate: Date; endDate: Date } {
  // End = yesterday at end of day UTC
  const endDate = new Date(now);
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  endDate.setUTCHours(23, 59, 59, 999);

  let startDate: Date;

  if (lastPayoutDate) {
    // Start = day after last payout at midnight UTC
    startDate = new Date(lastPayoutDate);
    startDate.setUTCDate(startDate.getUTCDate() + 1);
    startDate.setUTCHours(0, 0, 0, 0);
  } else {
    // First ever payout — go back 14 or 30 days
    const daysBack = frequency === "monthly" ? 30 : 14;
    startDate = new Date(now);
    startDate.setUTCDate(startDate.getUTCDate() - daysBack);
    startDate.setUTCHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}
