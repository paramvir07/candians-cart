"use client";

import { useMemo } from "react";
import { TrendingUp, Wifi, Store } from "lucide-react";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";
import { formatCurrency, getAnalytics } from "@/lib/walletHistory";

interface AnalyticsPanelProps {
  transactions: UnifiedTransaction[];
}

function MiniChart({
  months,
}: {
  months: { label: string; amount: number }[];
}) {
  const max = Math.max(...months.map((m) => m.amount), 1);

  const points = months.map((m, i) => {
    const x = (i / (months.length - 1)) * 260;
    const y = 55 - (m.amount / max) * 45;
    return { x, y, ...m };
  });

  const pathD = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${d} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const fillD = `${pathD} L ${points[points.length - 1].x} 65 L 0 65 Z`;

  return (
    <div className="w-full overflow-hidden rounded-xl bg-gradient-to-b from-primary/5 to-transparent p-3">
      <svg
        viewBox="0 0 280 70"
        className="w-full"
        style={{ height: 80 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#cg)" />
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="white"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-0.5">
        {months.map((m, i) => (
          <span key={i} className="text-[9px] text-muted-foreground">
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPanel({ transactions }: AnalyticsPanelProps) {
  const analytics = useMemo(() => getAnalytics(transactions), [transactions]);

  return (
    <div className="space-y-4">
      {/* Summary stats — 2-col grid on wider screens */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Summation Result
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wifi size={13} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium">Online</span>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {analytics.onlinePct}%
            </span>
          </div>
          <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Store
                  size={13}
                  className="text-violet-600"
                />
              </div>
              <span className="text-sm font-medium">In-Store</span>
            </div>
            <span className="text-sm font-bold text-violet-600">
              {analytics.inStorePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full flex rounded-full overflow-hidden">
          <div
            className="bg-blue-500 transition-all duration-700"
            style={{ width: `${analytics.onlinePct}%` }}
          />
          <div
            className="bg-violet-500 transition-all duration-700"
            style={{ width: `${analytics.inStorePct}%` }}
          />
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Activity
          </p>
          <TrendingUp size={12} className="text-muted-foreground" />
        </div>
        <MiniChart months={analytics.months} />
      </div>

      {/* Total — 2-col on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Top Ups</p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {formatCurrency(analytics.total, "cad")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-3">
            <p className="text-[10px] text-muted-foreground">Online</p>
            <p className="text-sm font-bold text-blue-600 mt-0.5">
              {formatCurrency(analytics.online, "cad")}
            </p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl px-3 py-3">
            <p className="text-[10px] text-muted-foreground">In-Store</p>
            <p className="text-sm font-bold text-violet-600 mt-0.5">
              {formatCurrency(analytics.inStore, "cad")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
