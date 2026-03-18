"use client";

import { useMemo } from "react";
import { TrendingUp, Wifi, Store, Gift } from "lucide-react";
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
  const points = months.map((m, i) => ({
    x: (i / (months.length - 1)) * 260,
    y: 55 - (m.amount / max) * 45,
    ...m,
  }));
  const pathD = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${d} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, "");
  const fillD = `${pathD} L ${points[points.length - 1].x} 65 L 0 65 Z`;
  const allZero = months.every((m) => m.amount === 0);

  return (
    <div className="w-full overflow-hidden rounded-xl bg-gradient-to-b from-primary/5 to-transparent p-3">
      {allZero ? (
        <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
          No activity yet
        </div>
      ) : (
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
      )}
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
      {/* Online vs In-Store split — gifts excluded */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Payment Split
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
                <Store size={13} className="text-violet-600" />
              </div>
              <span className="text-sm font-medium">In-Store</span>
            </div>
            <span className="text-sm font-bold text-violet-600">
              {analytics.inStorePct}%
            </span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
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
        {analytics.giftCount > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Gifts excluded from split
          </p>
        )}
      </div>

      {/* Gift row — only when gifts exist */}
      {analytics.giftCount > 0 && (
        <div className="flex items-center justify-between bg-amber-100/10 border border-amber-200/40 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center">
              <Gift size={16} className="text-amber-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Gifts Received
              </p>

              <p className="text-xs text-muted-foreground">
                {analytics.giftCount} gift{analytics.giftCount !== 1 ? "s" : ""}{" "}
                received
              </p>
            </div>
          </div>

          <span className="text-lg font-bold text-amber-600/90">
            {formatCurrency(analytics.gifts, "cad")}
          </span>
        </div>
      )}

      {/* Monthly chart — gifts excluded */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Activity
          </p>
          <TrendingUp size={12} className="text-muted-foreground" />
        </div>
        <MiniChart months={analytics.months} />
        {analytics.giftCount > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            Paid top-ups only · gifts not shown
          </p>
        )}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Added to Wallet</p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {formatCurrency(analytics.total, "cad")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
            {analytics.giftCount > 0 &&
              ` · ${analytics.giftCount} gift${analytics.giftCount !== 1 ? "s" : ""}`}
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
