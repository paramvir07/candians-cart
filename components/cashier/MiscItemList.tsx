"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  PackageIcon,
  PlusCircleIcon,
  SparklesIcon,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────

interface MiscItem {
  _id: string;
  storeId: string;
  productName: string;
  price: number;
  primaryUPC?: string;
  createdAt: string;
}



// ── helpers ───────────────────────────────────────────────────────────────────

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ── main list ─────────────────────────────────────────────────────────────────

export default function MiscItemsList({ items }: { items: MiscItem[] }) {
  const router = useRouter();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <PackageIcon className="mb-4 h-12 w-12 opacity-20" />
        <p className="text-sm">No miscellaneous items pending</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Scanned items ready to be added will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          {/* subtle gradient overlay on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* top row */}
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary ring-1 ring-border transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/20">
              <PackageIcon className="h-5 w-5 text-secondary-foreground transition-colors group-hover:text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {truncate(item.productName, 45)}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                <CalendarIcon className="h-3 w-3" />
                {new Date(item.createdAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            {/* sparkle on hover */}
            <SparklesIcon className="h-4 w-4 shrink-0 text-muted-foreground/20 transition-colors group-hover:text-primary/50" />
          </div>

          {/* bottom row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                <span className="text-[10px]">$</span>
                {(item.price / 100).toFixed(2)}
              </span>
              {item.primaryUPC?.trim() && (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs tracking-tight text-muted-foreground">
                  {item.primaryUPC}
                </span>
              )}
            </div>
            <button
              onClick={() => router.push(`/cashier/new-product/${item._id}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-primary bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-[0.98]"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Add product
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}