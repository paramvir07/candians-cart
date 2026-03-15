"use client";

import { StoreDetailStats } from "@/actions/admin/analytics/store/getStoreDetail.action";
import {
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface StoreStatCardsProps {
  stats: StoreDetailStats;
  storeId: string;
}

function formatCents(cents: number) {
  if (cents >= 100_000_00) return "$" + (cents / 100 / 1000).toFixed(0) + "k";
  if (cents >= 10_000_00) return "$" + (cents / 100 / 1000).toFixed(1) + "k";
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export default function StoreStatCards({
  stats,
  storeId,
}: StoreStatCardsProps) {
  const base = `/admin/store/${storeId}`;

  const cards = [
    {
      title: "Total orders",
      value: stats.totalOrders.toLocaleString(),
      sub:
        stats.orderGrowthPercent !== 0
          ? `${stats.orderGrowthPercent > 0 ? "+" : ""}${stats.orderGrowthPercent}% vs last month`
          : "0%",
      growth: stats.orderGrowthPercent,
      neutral: false,
      icon: ShoppingCart,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      href: `${base}/orders`,
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      sub:
        stats.productGrowthPercent !== 0
          ? `${stats.productGrowthPercent > 0 ? "+" : ""}${stats.productGrowthPercent}%`
          : "0%",
      growth: stats.productGrowthPercent,
      neutral: false,
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      href: `${base}/products`,
    },
    {
      title: "Total Customers",
      value: stats.totalUsers.toLocaleString(),
      sub: "All members",
      growth: 0,
      neutral: true,
      icon: Users,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      href: `${base}/customers`,
    },
    {
      title: "Total spending's",
      value: formatCents(stats.totalSpending),
      sub:
        stats.spendingGrowthPercent !== 0
          ? `${stats.spendingGrowthPercent > 0 ? "+" : ""}${stats.spendingGrowthPercent}% vs last month`
          : "0%",
      growth: stats.spendingGrowthPercent,
      neutral: false,
      icon: Wallet,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      href: `${base}/orders`
    },
    {
      title: "Pending payments",
      value: formatCents(stats.pendingPayments),
      sub: stats.pendingPayments === 0 ? "All clear" : "Awaiting payout",
      growth: 0,
      neutral: true,
      icon: Clock,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
      href: `${base}/payout-reciepts`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        const isClickable = !!card.href;

        const inner = (
          <>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">
                {card.title}
              </p>
              <div className={`${card.iconBg} p-1.5 rounded-xl shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
              {card.value}
            </p>

            <div className="flex items-center justify-between">
              {card.neutral ? (
                <p className="text-xs text-gray-400 font-medium">{card.sub}</p>
              ) : (
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                  )}
                  <p
                    className={`text-xs font-medium leading-tight ${
                      isPositive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {card.sub}
                  </p>
                </div>
              )}
              {isClickable && (
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-150" />
              )}
            </div>
          </>
        );

        if (card.href) {
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
            >
              {inner}
            </Link>
          );
        }

        return (
          <div
            key={card.title}
            className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-all duration-200 flex flex-col"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
