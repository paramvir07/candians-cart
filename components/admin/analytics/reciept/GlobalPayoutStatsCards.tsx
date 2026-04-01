import { Wallet, Banknote, Landmark, BarChart3 } from "lucide-react";
import { getOverviewStats } from "@/actions/admin/analytics/analytics.action";
import { fmt } from "@/lib/fomatPrice";
import { Skeleton } from "@/components/ui/skeleton";

export default async function GlobalPayoutStatsCards() {
  const stats = await getOverviewStats();

  const cards = [
    {
      title: "Total Store Payouts",
      value: fmt(stats.totalStorePayouts),
      sub: "All time completed payouts",
      icon: Wallet,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      gradientFrom: "from-indigo-50",
      border: "border-indigo-100",
      dot: "bg-indigo-300",
    },
    {
      title: "Total Store Profits",
      value: fmt(stats.totalStoreProfits),
      sub: "All time store net profits",
      icon: Banknote,
      iconColor: "text-lime-600",
      iconBg: "bg-lime-100",
      gradientFrom: "from-lime-50",
      border: "border-lime-100",
      dot: "bg-lime-300",
    },
    {
      title: "Platform Commission",
      value: fmt(stats.totalPlatformCommission),
      sub: "Total commission collected",
      icon: Landmark,
      iconColor: "text-fuchsia-600",
      iconBg: "bg-fuchsia-100",
      gradientFrom: "from-fuchsia-50",
      border: "border-fuchsia-100",
      dot: "bg-fuchsia-300",
    },
    {
      title: "Platform Profit",
      value: fmt(stats.platformProfit),
      sub: "All time platform net profit",
      icon: BarChart3,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      gradientFrom: "from-blue-50",
      border: "border-blue-100",
      dot: "bg-blue-300",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;

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
              <p className="text-xs font-medium leading-tight text-muted-foreground">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GlobalPayoutStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}