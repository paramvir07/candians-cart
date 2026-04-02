"use client";

import { Button } from "@/components/ui/button";
import { getMemberSince, getMemberYear } from "@/lib/memberSince";
import { Customer } from "@/types/customer/customer";
import { DollarSign, ShoppingBag, CalendarDays, TrendingUp, ChartSpline } from "lucide-react";
import Link from "next/link";

type Props = {
  customer: Pick<Customer, "monthlyBudget" | "createdAt">;
  OrderCount: number
};

function fmtBudget(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
  return `$${Math.round(dollars)}`;
}

const GRID_DARK = `
  linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
`;
const GRID_LIGHT = `
  linear-gradient(var(--border) 1px, transparent 1px),
  linear-gradient(90deg, var(--border) 1px, transparent 1px)
`;

export default function ProfileStats({ customer,OrderCount }: Props) {

  return (
    <div className="grid grid-cols-2 gap-2.5">

      {/* ── Budget — wide dark card, spans 2 cols ── */}
      <div
        className="relative col-span-2 rounded-3xl overflow-hidden flex flex-col justify-between p-5 sm:p-6 min-h-[160px] cursor-default"
        style={{ background: "var(--primary)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: GRID_DARK, backgroundSize: "26px 26px" }} />

        <div className="relative z-10 flex items-center justify-between">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
            <DollarSign className="h-4 w-4" style={{ color: "rgba(255,255,255,0.7)" }} strokeWidth={1.5} />
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
            <TrendingUp className="h-3 w-3" />
            Monthly
          </span>
        </div>

        <div className="relative z-10">
          <p className="font-black tracking-tighter leading-none" style={{ fontSize: "clamp(2.2rem, 7vw, 3.5rem)", color: "rgba(255,255,255,0.95)" }}>
            {fmtBudget(customer.monthlyBudget)}
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
            Budget allocated per month
          </p>
        </div>
      </div>

      {/* ── Orders ── */}
      <div
        className="relative col-span-1 rounded-3xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 min-h-[160px] cursor-default border border-border/60 bg-secondary/40"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: GRID_LIGHT, backgroundSize: "26px 26px", opacity: 0.45 }} />
        <div className="relative z-10 w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <Link href="/customer/orders" className="relative z-10">
          <p className="font-black tracking-tighter leading-none text-foreground" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>
            {OrderCount}
          </p>
          <p className="text-[11px] mt-2 font-medium text-muted-foreground leading-snug">
            Orders placed
          </p>
        </Link>
      </div>

      {/* ── Member since ── */}
      <div
        className="relative col-span-1 rounded-3xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 min-h-[160px] cursor-default border border-border/60 bg-secondary/40"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: GRID_LIGHT, backgroundSize: "26px 26px", opacity: 0.45 }} />
        <div className="relative z-10 w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <div className="relative z-10">
          <p className="font-black tracking-tighter leading-none text-foreground" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>
            {getMemberYear(customer.createdAt)}
          </p>
          <p className="text-[11px] mt-2 font-medium text-muted-foreground leading-snug">
            Since {getMemberSince(customer.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}