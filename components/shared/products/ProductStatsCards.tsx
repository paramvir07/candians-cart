import { ProductStats } from "@/actions/admin/products/getProductStats.action";
import { Package, TrendingUp, ShoppingCart, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  tooltipText,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  bg: string;
  border: string;
  tooltipText?: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-start justify-between mb-2">
        {/* Label and Tooltip wrapper */}
        <div className="flex items-center gap-1">
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">
            {label}
          </p>
          {tooltipText && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-gray-400 cursor-help"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3 text-xs bg-white text-gray-700 border border-gray-200 shadow-md rounded-xl leading-normal">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className={`${bg.replace("60", "100")} p-1.5 rounded-xl shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
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
        sub="Unique products sold today"
        icon={TrendingUp}
        bg="bg-emerald-50/60"
        border="border-emerald-100"
        tooltipText="Counts each distinct product sold today, regardless of quantity (e.g., 2 bananas + 3 apples = 2 products, not 5)."
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
