"use client";

import { useRouter } from "next/navigation";
import {
  PackageIcon,
  PlusCircleIcon,
  ReceiptIcon,
  BarcodeIcon,
  ArrowRightIcon,
} from "lucide-react";

interface MiscItem {
  _id: string;
  storeId: string;
  productName: string;
  price: number;
  tax: number;
  primaryUPC?: string;
  createdAt: string;
}

const TAX_META: Record<string, { label: string; short: string }> = {
  "0":    { label: "No tax",    short: "0%"  },
  "0.05": { label: "GST",       short: "5%"  },
  "0.07": { label: "PST",       short: "7%"  },
  "0.12": { label: "GST + PST", short: "12%" },
};

function fmt(cents: number) {
  return (cents / 100).toFixed(2);
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function MiscItemsList({ items }: { items: MiscItem[] }) {
  const router = useRouter();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20">
            <PackageIcon className="h-9 w-9 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-muted">
            <span className="text-[9px] font-bold text-muted-foreground">0</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">Nothing pending</p>
        <p className="mt-1.5 max-w-[220px] text-center text-xs leading-relaxed text-muted-foreground/60">
          Scanned items awaiting catalogue entry will show up here
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .misc-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.25rem;
          overflow: hidden;
          transform: translateY(0);
          box-shadow: 0 1px 2px oklch(0 0 0 / 0.04);
          transition:
            transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 180ms ease;
        }
        .misc-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 4px 12px oklch(0.6271 0.1699 149.2138 / 0.10),
            0 1px 3px oklch(0 0 0 / 0.06);
          border-color: oklch(0.6271 0.1699 149.2138 / 0.35);
        }
        .misc-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: oklch(0.6271 0.1699 149.2138 / 0);
          transition: background 180ms ease;
          pointer-events: none;
        }
        .misc-card:hover::before {
          background: oklch(0.6271 0.1699 149.2138 / 0.025);
        }

        .misc-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          flex-shrink: 0;
          border-radius: 0.75rem;
          background: oklch(0.6271 0.1699 149.2138 / 0.10);
          box-shadow: inset 0 0 0 1px oklch(0.6271 0.1699 149.2138 / 0.15);
          transition:
            background 180ms ease,
            box-shadow 180ms ease;
        }
        .misc-card:hover .misc-card-icon {
          background: oklch(0.6271 0.1699 149.2138 / 0.18);
          box-shadow: inset 0 0 0 1px oklch(0.6271 0.1699 149.2138 / 0.28);
        }

        .misc-card-icon svg {
          color: oklch(0.6271 0.1699 149.2138);
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .misc-card:hover .misc-card-icon svg {
          transform: scale(1.12);
        }

        .misc-card-cta {
          margin-top: auto;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          border-radius: 0.75rem;
          background: oklch(0.6271 0.1699 149.2138);
          padding: 0.625rem 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: white;
          border: none;
          cursor: pointer;
          transition:
            opacity 120ms ease,
            transform 120ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 120ms ease;
          box-shadow: 0 1px 2px oklch(0.6271 0.1699 149.2138 / 0.25);
        }
        .misc-card-cta:hover {
          opacity: 0.92;
          box-shadow: 0 3px 8px oklch(0.6271 0.1699 149.2138 / 0.35);
        }
        .misc-card-cta:active {
          transform: scale(0.97);
          opacity: 1;
          box-shadow: 0 1px 2px oklch(0.6271 0.1699 149.2138 / 0.2);
        }
        .misc-card-cta svg {
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .misc-card-cta:hover svg {
          transform: rotate(90deg) scale(1.1);
        }

        .misc-tax-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 9999px;
          padding: 0.2rem 0.5rem;
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          flex-shrink: 0;
          transition: box-shadow 180ms ease;
        }
        .misc-tax-pill.has-tax {
          background: oklch(0.6271 0.1699 149.2138 / 0.08);
          box-shadow: inset 0 0 0 1px oklch(0.6271 0.1699 149.2138 / 0.2);
          color: oklch(0.6271 0.1699 149.2138);
        }
        .misc-tax-pill.no-tax {
          background: var(--muted);
          box-shadow: inset 0 0 0 1px var(--border);
          color: var(--muted-foreground);
        }
        .misc-card:hover .misc-tax-pill.has-tax {
          box-shadow: inset 0 0 0 1px oklch(0.6271 0.1699 149.2138 / 0.35);
        }

        .misc-price-arrow {
          opacity: 0.3;
          transition: opacity 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .misc-card:hover .misc-price-arrow {
          opacity: 0.55;
          transform: translateX(2px);
        }

        .misc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 480px) {
          .misc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 900px) {
          .misc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>

      <div className="misc-grid">
        {items.map((item) => {
          const taxKey = String(item.tax ?? 0);
          const tax = TAX_META[taxKey] ?? TAX_META["0"];
          const hasTax = item.tax > 0;
          const afterTax = item.price + Math.round(item.price * (item.tax ?? 0));

          return (
            <div key={item._id} className="misc-card">
              {/* header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="misc-card-icon">
                    <PackageIcon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                      {truncate(item.productName, 28)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/55 mt-0.5 tabular-nums">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className={`misc-tax-pill ${hasTax ? "has-tax" : "no-tax"}`}>
                  <ReceiptIcon className="h-2.5 w-2.5" />
                  <span>{tax.label}</span>
                  <span style={{ opacity: 0.6 }}>{tax.short}</span>
                </div>
              </div>

              {/* divider */}
              <div className="h-px bg-border/60 mb-4" />

              {/* price */}
              <div className="flex items-end gap-2 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                    Pre-tax
                  </p>
                  <p className="text-lg font-bold tabular-nums text-foreground leading-none">
                    <span className="text-[11px] font-medium text-muted-foreground mr-0.5">CA$</span>
                    {fmt(item.price)}
                  </p>
                </div>

                {hasTax && (
                  <>
                    <ArrowRightIcon
                      className="misc-price-arrow mb-1 shrink-0"
                      style={{ width: 13, height: 13 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "oklch(0.6271 0.1699 149.2138 / 0.55)" }}
                      >
                        Incl. tax
                      </p>
                      <p
                        className="text-lg font-bold tabular-nums leading-none"
                        style={{ color: "oklch(0.6271 0.1699 149.2138)" }}
                      >
                        <span
                          className="text-[11px] font-medium mr-0.5"
                          style={{ color: "oklch(0.6271 0.1699 149.2138 / 0.6)" }}
                        >
                          CA$
                        </span>
                        {fmt(afterTax)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* UPC */}
              {item.primaryUPC?.trim() && (
                <div className="flex items-center gap-1.5 mb-4 -mt-1">
                  <BarcodeIcon className="h-3 w-3 text-muted-foreground/35 shrink-0" />
                  <span className="font-mono text-[11px] text-muted-foreground/45 tracking-tight truncate">
                    {item.primaryUPC}
                  </span>
                </div>
              )}

              {/* cta */}
              <button
                className="misc-card-cta"
                onClick={() => router.push(`/cashier/new-product/${item._id}`)}
              >
                <PlusCircleIcon style={{ width: 14, height: 14 }} strokeWidth={2.5} />
                Create product
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}