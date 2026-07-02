import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns";

export const STORE_TIMEZONE = "America/Vancouver";

/**
 * Given a Date whose Y/M/D fields represent a calendar day you care about
 * (e.g. a date picker selection, where the fields are already "what the
 * user clicked"), returns the UTC instants for 00:00:00.000 and
 * 23:59:59.999 of that day in Vancouver local time.
 *
 * Do NOT pass a raw `new Date()` (current server time) directly into this —
 * use getTodayVancouverBoundsUTC() instead, since the server's Y/M/D fields
 * are in the server's own timezone (UTC in prod), not Vancouver's.
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

/** Day bounds (UTC) for "today," correctly resolved in Vancouver time
 *  regardless of what timezone the server process itself runs in. */
export function getTodayVancouverBoundsUTC() {
  const nowInVancouver = toZonedTime(new Date(), STORE_TIMEZONE);
  return getVancouverDayBoundsUTC(nowInVancouver);
}

/**
 * Returns UTC Date objects aligned to the start of the day, week, 
 * and month for the store's specific timezone.
 * Mongoose requires UTC Dates for $match / $gte operations.
 */
export function getAnalyticsBoundaries(baseDate = new Date()) {
  // 1. Shift current UTC time to Vancouver time
  const zonedNow = toZonedTime(baseDate, STORE_TIMEZONE);

  // 2. Calculate boundaries in Vancouver time, then shift them back to standard UTC Dates
  return {
    utcStartOfDay: fromZonedTime(startOfDay(zonedNow), STORE_TIMEZONE),
    utcStartOfMonth: fromZonedTime(startOfMonth(zonedNow), STORE_TIMEZONE),
    // Standard calendar week (e.g., Sunday 12:00 AM)
    utcStartOfWeek: fromZonedTime(startOfWeek(zonedNow), STORE_TIMEZONE),
    // Rolling 7-day window (exactly 7 days ago from today at midnight)
    utcRolling7Days: fromZonedTime(subDays(startOfDay(zonedNow), 7), STORE_TIMEZONE),
  };
}