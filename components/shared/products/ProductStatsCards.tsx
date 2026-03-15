import { ProductStats } from "@/actions/admin/products/getProductStats.action";
import {
  Package,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

interface ProductStatCardsProps {
  stats: ProductStats;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  bg,
  border,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  bg: string;
  border: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">
          {label}
        </p>
        <div className={`${bg.replace("60", "100")} p-1.5 rounded-xl shrink-0`}>
          <Icon className={`w-3.5 h-3.5 `} />
        </div>
      </div>
      <p
        className={`text-2xl sm:text-3xl font-bold tracking-tight`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

export default function ProductStatCards({ stats }: ProductStatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Total Products"
        value={stats.totalProducts.toLocaleString()}
        sub="All available items"
        icon={Package}
        bg="bg-blue-50/60"
        border="border-blue-100"
      />
      <StatCard
        label="Sold Today"
        value={stats.soldToday.toLocaleString()}
        sub="Items sold today"
        icon={TrendingUp}
        bg="bg-emerald-50/60"
        border="border-emerald-100"
      />
      <StatCard
        label="Sold Weekly"
        value={stats.soldWeekly.toLocaleString()}
        sub="Past 7 days"
        icon={ShoppingCart}
        bg="bg-amber-50/60"
        border="border-amber-100"
      />
      <StatCard
        label="Total Sold"
        value={stats.totalSold.toLocaleString()}
        sub="All-time sales"
        icon={ShoppingCart}
        bg="bg-violet-50/60"
        border="border-violet-100"
      />
    </div>
  );
}
