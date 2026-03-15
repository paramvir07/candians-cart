"use client";

import Link from "next/link";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import type { DashboardStats } from "@/actions/admin/analytics/store/allStoresData.action";

interface StatCardsProps {
  stats: DashboardStats;
}

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
      href: undefined,
      icon: Store,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      gradientFrom: "from-blue-50",
      border: "border-blue-100",
      dot: "bg-blue-300",
    },
    {
      title: "Total Products",
      value: `${stats.totalProducts.toLocaleString()}+`,
      sub: `${stats.productGrowthPercent >= 0 ? "+" : ""}${stats.productGrowthPercent}% from last month`,
      growth: stats.productGrowthPercent,
      href: "/admin/products",
      icon: Package,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientFrom: "from-emerald-50",
      border: "border-emerald-100",
      dot: "bg-emerald-300",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: `${stats.orderGrowthPercent >= 0 ? "+" : ""}${stats.orderGrowthPercent}% from last month`,
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
      sub: `${stats.revenueGrowthPercent >= 0 ? "+" : ""}${stats.revenueGrowthPercent}% from last month`,
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        const CardContent = (
          <div
            className={`relative bg-gradient-to-br ${card.gradientFrom} to-white border ${card.border} rounded-2xl p-4 sm:p-5 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] ${card.href ? "cursor-pointer" : ""}`}
          >
            {/* Decorative blob */}
            <div
              className={`absolute -top-5 -right-5 w-24 h-24 rounded-full ${card.dot} opacity-20 blur-sm`}
            />

            {/* Hover arrow (only if clickable) */}
            {card.href && (
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-3 relative pr-8">
              <p className="text-xs sm:text-sm font-medium text-gray-500 leading-snug">
                {card.title}
              </p>
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

            <div className="flex items-center gap-1 relative">
              <TrendIcon
                className={`w-3 h-3 shrink-0 ${isPositive ? "text-emerald-500" : "text-red-400"}`}
              />
              <p
                className={`text-xs font-medium leading-tight ${
                  isPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {card.sub}
              </p>
            </div>
          </div>
        );

        return card.href ? (
          <Link key={card.title} href={card.href} className="group block">
            {CardContent}
          </Link>
        ) : (
          <div key={card.title}>{CardContent}</div>
        );
      })}
    </div>
  );
}
