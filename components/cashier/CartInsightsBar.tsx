"use client";

import { ShoppingCart, Gift, CircleDollarSign, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CartInsightBarProps {
  numItems: number;
  subsidyOnOrder: number; // cents
  total: number;          // cents
  customerId?: string;
  className?: string;
}

const fmt = (cents: number) => (cents / 100).toFixed(2);

export default function CartInsightBar({
  numItems,
  subsidyOnOrder,
  total,
  customerId,
  className,
}: CartInsightBarProps) {
  if (numItems === 0) return null;

  const href = customerId ? `/cashier/customer/${customerId}/cart` : "/customer/cart";

  return (
    <Link
      href={href}
      className={cn("block w-full group", className)}
    >
      <div className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-2xl border border-border bg-card shadow-sm transition-all duration-150 group-hover:shadow-md group-hover:border-primary/40">

        {/* Left: items count */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 shrink-0">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-sm font-bold tabular-nums text-foreground">{numItems}</span>
            <span className="text-xs text-muted-foreground">
              {numItems === 1 ? "item" : "items"} in cart
            </span>
          </div>
        </div>

        {/* Right: subsidy + total + arrow */}
        <div className="flex items-center gap-1 shrink-0">
          {subsidyOnOrder > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
              <Gift className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold tabular-nums text-emerald-600">
                −${fmt(subsidyOnOrder)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60">
            <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold tabular-nums text-foreground">
              ${fmt(total)}
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground ml-1 group-hover:translate-x-0.5 transition-transform" />
        </div>

      </div>
    </Link>
  );
}