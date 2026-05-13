"use client";

import { ShoppingCart, Gift, CircleDollarSign } from "lucide-react";
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
      className={cn("fixed top-40 right-4 z-50 group", className)}
    >
      <div className="flex items-stretch divide-x divide-border border border-border bg-card rounded-xl shadow-md overflow-hidden transition-all duration-150 group-hover:shadow-lg group-hover:border-primary/40">

        {/* Items */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/50">
          <ShoppingCart className="h-3.5 w-3.5 text-primary shrink-0" />
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-sm font-bold tabular-nums text-foreground">{numItems}</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {numItems === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Subsidy */}
        {subsidyOnOrder > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5">
            <Gift className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className="text-[10px] font-semibold text-emerald-600">−$</span>
              <span className="text-sm font-bold tabular-nums text-emerald-600">{fmt(subsidyOnOrder)}</span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-[10px] font-semibold text-muted-foreground">$</span>
            <span className="text-sm font-bold tabular-nums text-foreground">{fmt(total)}</span>
          </div>
        </div>

      </div>
    </Link>
  );
}