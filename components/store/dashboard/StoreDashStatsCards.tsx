import { StoreDashboardStats } from "@/actions/store/getStoreDashboard.actions";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
} from "lucide-react";
import Link from "next/link";

interface StoreDashStatCardsProps {
  stats: StoreDashboardStats;
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

export default function StoreDashStatCards({
  stats,
  storeId,
}: StoreDashStatCardsProps) {
  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      sub:
        stats.productGrowthPercent !== 0
          ? `${stats.productGrowthPercent > 0 ? "+" : ""}${stats.productGrowthPercent}% from last month`
          : "0%",
      growth: stats.productGrowthPercent,
      icon: Package,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      cardBg: "bg-emerald-50/60",
      href: `/store/products`,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub:
        stats.orderGrowthPercent !== 0
          ? `${stats.orderGrowthPercent > 0 ? "+" : ""}${stats.orderGrowthPercent}% from last month`
          : "0%",
      growth: stats.orderGrowthPercent,
      icon: ShoppingCart,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      cardBg: "bg-amber-50/60",
      href: `/store/orders`,
    },
    {
      title: "Total Revenue",
      value: formatCents(stats.totalRevenue),
      sub:
        stats.revenueGrowthPercent !== 0
          ? `${stats.revenueGrowthPercent > 0 ? "+" : ""}${stats.revenueGrowthPercent}% from last month`
          : "0%",
      growth: stats.revenueGrowthPercent,
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      cardBg: "bg-blue-50/60",
      href: undefined,
    },
    {
      title: "Store Users",
      value: stats.storeUsers.toLocaleString(),
      sub: `+${stats.newUsersRecently} recently`,
      growth: stats.newUsersRecently,
      icon: Users,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      cardBg: "bg-violet-50/60",
      href: `/store/customers`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;

        const inner = (
          <>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">
                {card.title}
              </p>
              <div
                className={`${card.iconBg} p-1.5 sm:p-2 rounded-xl shrink-0`}
              >
                <Icon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.iconColor}`}
                />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
              {card.value}
            </p>

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
          </>
        );

        if (card.href) {
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`group ${card.cardBg} border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer`}
            >
              {inner}
            </Link>
          );
        }

        return (
          <div
            key={card.title}
            className={`${card.cardBg} border border-gray-100 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col`}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
