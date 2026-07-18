  /** Cents → full CAD currency string: 47348000 → CA$473,480.00 */
export function fmt(cents?: number) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  });
}

/** Cents → compact badge string: 47348000 → $473k */
export function fmtShort(cents?: number): string {
  if (typeof cents !== "number") return "—";
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${(d / 1_000).toFixed(1)}k`;
  return `$${d.toFixed(0)}`;
}
