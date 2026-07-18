"use client";

import Link from "next/link";
import {
  Store,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import type { DashboardStats } from "@/actions/admin/analytics/store/allStoresData.action";

interface StatCardsProps {
  stats: DashboardStats;
}

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: "Total Grocery Stores",
      value: stats.totalStores.toLocaleString(),
      sub: `+${stats.newStoresThisMonth} new stores this month`,
      growth: stats.newStoresThisMonth,
      href: "/admin/stores",
      icon: Store,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      gradientFrom: "from-blue-50",
      border: "border-blue-100",
      dot: "bg-blue-300",
    },
    {
      title: "Platform Profit",
      value: formatCents(stats.platformProfit + stats.platformFee),
      sub: `+${stats.profitGrowthPercent}% from last month`,
      growth: stats.profitGrowthPercent,
      note: `Platform Profit (${formatCents(stats.platformProfit)}) + Platform Fee (${formatCents(stats.platformFee)})`,
      href: "/admin/analytics",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientFrom: "from-emerald-50",
      border: "border-emerald-100",
      dot: "bg-emerald-300",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: `+${stats.orderGrowthPercent}% from last month`,
      growth: stats.orderGrowthPercent,
      href: "/admin/orders",
      icon: ShoppingCart,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      gradientFrom: "from-amber-50",
      border: "border-amber-100",
      dot: "bg-amber-300",
    },
    {
      title: "Total Revenue",
      value: formatCents(stats.totalRevenue),
      sub: `+${stats.revenueGrowthPercent}% from last month`,
      growth: stats.revenueGrowthPercent,
      href: "/admin/analytics",
      icon: DollarSign,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-100",
      gradientFrom: "from-rose-50",
      border: "border-rose-100",
      dot: "bg-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
      {cards.map((card) => {
        const Icon = card.icon;

        // Hide trends entirely if growth drops below zero
        const showTrend = card.growth >= 0;

        const CardContent = (
          <div
            className={`relative h-full flex flex-col bg-linear-to-br ${card.gradientFrom} to-white border ${card.border} rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] ${card.href ? "cursor-pointer" : ""}`}
          >
            {/* Decorative blob — clipped to the card's own rounded corners,
        isolated from the rest of the card so it doesn't clip the tooltip */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div
                className={`absolute -top-5 -right-5 w-24 h-24 rounded-full ${card.dot} opacity-20 blur-sm`}
              />
            </div>

            {/* Hover arrow (only if clickable) */}
            {card.href && (
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-3 relative pr-8">
              <div className="flex items-center gap-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-snug">
                  {card.title}
                </p>

                {card.note && (
                  <span className="relative group/tip shrink-0">
                    <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[180px] sm:max-w-[220px] rounded-lg bg-gray-900 text-white text-[10px] sm:text-[11px] leading-snug px-2.5 py-1.5 opacity-0 scale-95 origin-bottom transition-all duration-150 group-hover/tip:opacity-100 group-hover/tip:scale-100"
                    >
                      {card.note}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </span>
                  </span>
                )}
              </div>

              <div
                className={`${card.iconBg} p-1.5 sm:p-2 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.iconColor}`}
                />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2 relative">
              {card.value}
            </p>

            <div className="mt-auto relative">
              {showTrend ? (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 shrink-0 text-emerald-500" />
                  <p className="text-xs font-medium leading-tight text-emerald-600">
                    {card.sub}
                  </p>
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          </div>
        );

        return card.href ? (
          <Link
            key={card.title}
            href={card.href}
            className="group block h-full"
          >
            {CardContent}
          </Link>
        ) : (
          <div key={card.title} className="h-full">
            {CardContent}
          </div>
        );
      })}
    </div>
  );
}
