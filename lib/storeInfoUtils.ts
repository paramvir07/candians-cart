import { IStoreHours, ITimeRange } from "@/db/models/store/store.model";


export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DAY_SHORT_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const DAY_ORDER: DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

/**
 * Convert minutes from midnight to a formatted time string.
 * @example minutesToTime(540) => "9:00 AM"
 * @example minutesToTime(780) => "1:00 PM"
 * @example minutesToTime(1440) => "12:00 AM (midnight)"
 */
export function minutesToTime(minutes: number, use24Hour = false): string {
  const safeMinutes = minutes % 1440;
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  const mm = m.toString().padStart(2, "0");

  if (use24Hour) {
    return `${h.toString().padStart(2, "0")}:${mm}`;
  }

  if (h === 0) return `12:${mm} AM`;
  if (h === 12) return `12:${mm} PM`;
  if (h < 12) return `${h}:${mm} AM`;
  return `${h - 12}:${mm} PM`;
}

/**
 * Format a single time range to a human-readable string.
 * @example formatTimeRange({ open: 540, close: 1020 }) => "9:00 AM – 5:00 PM"
 */
export function formatTimeRange(range: ITimeRange, use24Hour = false): string {
  return `${minutesToTime(range.open, use24Hour)} – ${minutesToTime(range.close, use24Hour)}`;
}

export type FormattedDay = {
  key: DayKey;
  label: string;
  shortLabel: string;
  ranges: ITimeRange[];
  formattedRanges: string[];
  isClosed: boolean;
  isOpen24h: boolean;
};

/**
 * Get a fully formatted representation of a single day's hours.
 */
export function formatDay(
  key: DayKey,
  ranges: ITimeRange[],
  use24Hour = false,
): FormattedDay {
  const isClosed = ranges.length === 0;
  const isOpen24h =
    ranges.length === 1 && ranges[0].open === 0 && ranges[0].close === 1440;

  return {
    key,
    label: DAY_LABELS[key],
    shortLabel: DAY_SHORT_LABELS[key],
    ranges,
    formattedRanges: isOpen24h
      ? ["Open 24 hours"]
      : ranges.map((r) => formatTimeRange(r, use24Hour)),
    isClosed,
    isOpen24h,
  };
}

/**
 * Format all store hours into an ordered array of FormattedDay objects.
 * Useful for rendering a full week schedule.
 */
export function formatStoreHours(
  hours: IStoreHours,
  use24Hour = false,
): FormattedDay[] {
  return DAY_ORDER.map((day) => formatDay(day, hours[day] ?? [], use24Hour));
}

/**
 * Check if the store is currently open based on its hours and timezone.
 * Returns { isOpen, closesAt, opensAt }
 */
export function getStoreOpenStatus(
  hours: IStoreHours,
  timezone = "America/Vancouver",
): { isOpen: boolean; closesAt: string | null; opensAt: string | null } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const weekday = parts
      .find((p) => p.type === "weekday")
      ?.value?.toLowerCase()
      .slice(0, 3) as DayKey;
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0",
    );
    const currentMinutes = hour * 60 + minute;

    const todayRanges = hours[weekday] ?? [];

    for (const range of todayRanges) {
      if (currentMinutes >= range.open && currentMinutes < range.close) {
        return {
          isOpen: true,
          closesAt: minutesToTime(range.close),
          opensAt: null,
        };
      }
    }

    // Find next opening time today
    const nextToday = todayRanges.find((r) => r.open > currentMinutes);
    if (nextToday) {
      return {
        isOpen: false,
        closesAt: null,
        opensAt: minutesToTime(nextToday.open),
      };
    }

    // Find next day with hours
    const dayIndex = DAY_ORDER.indexOf(weekday);
    for (let i = 1; i <= 7; i++) {
      const nextDay = DAY_ORDER[(dayIndex + i) % 7];
      const nextRanges = hours[nextDay] ?? [];
      if (nextRanges.length > 0) {
        const label = i === 1 ? "tomorrow" : DAY_LABELS[nextDay];
        return {
          isOpen: false,
          closesAt: null,
          opensAt: `${minutesToTime(nextRanges[0].open)} ${label}`,
        };
      }
    }

    return { isOpen: false, closesAt: null, opensAt: null };
  } catch {
    return { isOpen: false, closesAt: null, opensAt: null };
  }
}

/**
 * Group consecutive days with identical hours for compact display.
 * e.g. Mon-Fri: 9:00 AM – 5:00 PM, Sat-Sun: Closed
 */
export type HoursGroup = {
  days: string; // e.g. "Mon – Fri" or "Sat"
  formattedRanges: string[];
  isClosed: boolean;
};

export function groupStoreHours(
  hours: IStoreHours,
  use24Hour = false,
): HoursGroup[] {
  const formatted = formatStoreHours(hours, use24Hour);
  const groups: HoursGroup[] = [];

  let i = 0;
  while (i < formatted.length) {
    const current = formatted[i];
    let j = i + 1;

    while (j < formatted.length) {
      const next = formatted[j];
      const sameHours =
        current.isClosed === next.isClosed &&
        current.formattedRanges.join(",") === next.formattedRanges.join(",");
      if (!sameHours) break;
      j++;
    }

    const dayRange =
      j - i === 1
        ? current.shortLabel
        : `${current.shortLabel} – ${formatted[j - 1].shortLabel}`;

    groups.push({
      days: dayRange,
      formattedRanges: current.isClosed ? ["Closed"] : current.formattedRanges,
      isClosed: current.isClosed,
    });

    i = j;
  }

  return groups;
}
