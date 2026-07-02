import { fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

export const STORE_TIMEZONE = "America/Vancouver";

/**
 * Returns the UTC start and end instants for a specific calendar day
 * in the store's timezone (America/Vancouver).
 *
 * ## Parameters
 * - `localDate`
 *   A `Date` whose **year, month, and day fields already represent the
 *   Vancouver calendar date you want**.
 *
 *   The actual timestamp stored inside the `Date` is ignored. Only the
 *   Y/M/D components are used.
 *
 * ## Returns
 * ```ts
 * {
 *   start: Date, // UTC instant representing 00:00:00.000 Vancouver time
 *   end: Date    // UTC instant representing 23:59:59.999 Vancouver time
 * }
 * ```
 *
 * Both returned `Date` objects are UTC timestamps suitable for MongoDB
 * queries such as `$gte` / `$lte`.
 *
 * ## Usage
 *
 * ### Date picker selection (recommended)
 * ```ts
 * const { start, end } = getVancouverDayBoundsUTC(selectedDate);
 *
 * await Order.find({
 *   createdAt: {
 *     $gte: start,
 *     $lte: end,
 *   },
 * });
 * ```
 *
 * ### Do NOT use
 * ```ts
 * getVancouverDayBoundsUTC(new Date());
 * ```
 *
 * A raw `new Date()` represents the server's current timezone/date, which
 * may not match Vancouver's current calendar day.
 *
 * Instead use:
 *
 * ```ts
 * const { start, end } = getTodayVancouverBoundsUTC();
 * ```
 */
export function getVancouverDayBoundsUTC(localDate: Date) {
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const start = fromZonedTime(`${dateStr}T00:00:00.000`, STORE_TIMEZONE);
  const end = fromZonedTime(`${dateStr}T23:59:59.999`, STORE_TIMEZONE);

  return { start, end };
}

/**
 * Returns the UTC start and end instants for the current Vancouver
 * calendar day.
 *
 * Unlike `getVancouverDayBoundsUTC(new Date())`, this function first
 * determines today's date **in Vancouver**, making it safe to call from
 * servers running in any timezone (UTC, EST, etc.).
 *
 * ## Parameters
 * None.
 *
 * ## Returns
 * ```ts
 * {
 *   start: Date, // UTC instant for today's 00:00:00 Vancouver time
 *   end: Date    // UTC instant for today's 23:59:59.999 Vancouver time
 * }
 * ```
 *
 * ## Usage
 *
 * ```ts
 * const { start, end } = getTodayVancouverBoundsUTC();
 *
 * await Order.find({
 *   createdAt: {
 *     $gte: start,
 *     $lte: end,
 *   },
 * });
 * ```
 */
export function getTodayVancouverBoundsUTC() {
  const nowInVancouver = toZonedTime(new Date(), STORE_TIMEZONE);
  return getVancouverDayBoundsUTC(nowInVancouver);
}

/**
 * Returns commonly used analytics boundary timestamps for the store's
 * timezone (America/Vancouver).
 *
 * The supplied date is treated as the current moment. Calendar boundaries
 * (day, week, month, etc.) are calculated in Vancouver local time and then
 * converted back into UTC.
 *
 * ## Parameters
 * - `baseDate` *(optional)*
 *   A JavaScript `Date` representing the current instant.
 *
 *   - Expected timezone: **UTC or any valid JS Date**
 *   - Default: `new Date()`
 *
 * ## Returns
 * All returned values are **UTC `Date` objects**, ready to use directly in
 * MongoDB aggregation pipelines or `$match` queries.
 *
 * ```ts
 * {
 *   utcStartOfDay,
 *   utcStartOfWeek,
 *   utcRolling7Days,
 *   utcStartOfMonth,
 *   utcStartOfThisMonth,
 *   utcStartOfLastMonth
 * }
 * ```
 *
 * These represent:
 *
 * - `utcStartOfDay`
 *   → Vancouver 00:00 of the current day.
 *
 * - `utcStartOfWeek`
 *   → Vancouver start of the current week.
 *
 * - `utcRolling7Days`
 *   → Vancouver midnight seven days ago.
 *
 * - `utcStartOfMonth`
 *   → Vancouver midnight on the first day of this month.
 *
 * - `utcStartOfThisMonth`
 *   → Alias of `utcStartOfMonth`.
 *
 * - `utcStartOfLastMonth`
 *   → Vancouver midnight on the first day of the previous month.
 *
 * ## Usage
 *
 * ```ts
 * const boundaries = getAnalyticsBoundaries();
 *
 * await Order.aggregate([
 *   {
 *     $match: {
 *       createdAt: {
 *         $gte: boundaries.utcStartOfMonth,
 *       },
 *     },
 *   },
 * ]);
 * ```
 *
 * All returned values are UTC timestamps and should be used directly in
 * MongoDB queries. No additional timezone conversion is required.
 */
export function getAnalyticsBoundaries(baseDate = new Date()) {
  const zonedNow = toZonedTime(baseDate, STORE_TIMEZONE);
  const zonedStartOfThisMonth = startOfMonth(zonedNow);
  const zonedStartOfLastMonth = startOfMonth(subMonths(zonedNow, 1));

  return {
    utcStartOfDay: fromZonedTime(startOfDay(zonedNow), STORE_TIMEZONE),
    utcStartOfMonth: fromZonedTime(startOfMonth(zonedNow), STORE_TIMEZONE),
    utcStartOfWeek: fromZonedTime(startOfWeek(zonedNow), STORE_TIMEZONE),
    utcRolling7Days: fromZonedTime(
      subDays(startOfDay(zonedNow), 7),
      STORE_TIMEZONE,
    ),
    utcStartOfThisMonth: fromZonedTime(zonedStartOfThisMonth, STORE_TIMEZONE),
    utcStartOfLastMonth: fromZonedTime(zonedStartOfLastMonth, STORE_TIMEZONE),
  };
}
