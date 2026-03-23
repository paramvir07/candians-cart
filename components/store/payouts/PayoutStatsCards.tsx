import { Banknote, TrendingUp, TrendingDown, Wallet, CalendarCheck } from "lucide-react";
import { getPayoutAnalyticsAction } from "@/actions/store/payouts/getStorePayouts";
import { fmt } from "@/lib/fomatPrice";
import { Skeleton } from "@/components/ui/skeleton";

export default async function PayoutStatsCards({ storeId }: { storeId: string }) {
  const result = await getPayoutAnalyticsAction(storeId);
  
  if (!result.success || !result.data) {
    return <div className="text-red-500 text-sm">Failed to load analytics.</div>;
  }
  
  const stats = result.data;
  
  const cards = [
    {
      title: "Total Money Made",
      value: fmt(stats.totalEarnings),
      sub: `${stats.monthlyEarningsIncrease >= 0 ? "+" : ""}${stats.monthlyEarningsIncrease}% from last month`,
      growth: stats.monthlyEarningsIncrease,
      icon: Wallet,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      gradientFrom: "from-emerald-50",
      border: "border-emerald-100",
      dot: "bg-emerald-300",
    },
    {
      title: "Current Month Earnings",
      value: fmt(stats.currentMonthEarnings),
      sub: `Revenue from payouts this month`,
      growth: stats.currentMonthEarnings,
      icon: CalendarCheck,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      gradientFrom: "from-amber-50",
      border: "border-amber-100",
      dot: "bg-amber-300",
    },
    {
      title: "Paid Payouts",
      value: stats.totalPayouts.toLocaleString(),
      sub: `+${stats.newPayoutsThisMonth} this month`,
      growth: stats.newPayoutsThisMonth,
      icon: Banknote,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      gradientFrom: "from-blue-50",
      border: "border-blue-100",
      dot: "bg-blue-300",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={card.title}
            className={`relative bg-linear-to-br ${card.gradientFrom} to-white border ${card.border} rounded-2xl p-4 sm:p-5 overflow-hidden transition-all duration-200 shadow-sm`}
          >
            <div className={`absolute -top-5 -right-5 w-24 h-24 rounded-full ${card.dot} opacity-20 blur-sm`} />
            <div className="flex items-start justify-between gap-2 mb-3 relative pr-8">
              <p className="text-xs sm:text-sm font-medium text-gray-500 leading-snug">
                {card.title}
              </p>
              <div className={`${card.iconBg} p-1.5 sm:p-2 rounded-xl shrink-0`}>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.iconColor}`} />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2 relative">
              {card.value}
            </p>

            <div className="flex items-center gap-1 relative">
              {card.growth !== undefined && (
                <TrendIcon className={`w-3 h-3 shrink-0 ${isPositive ? "text-emerald-500" : "text-red-400"}`} />
              )}
              <p className={`text-xs font-medium leading-tight ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PayoutStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}