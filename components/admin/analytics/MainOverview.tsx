import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Store,
  Package,
  Clock,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { fmt } from "@/lib/fomatPrice";
import type { OverviewStats } from "@/actions/admin/analytics/analytics.action";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtShort(cents: number) {
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${(d / 1_000).toFixed(1)}k`;
  return fmt(cents);
}

// ─── MoM pill — compact, never overflows ───────────────────────────────────────

function MoMPill({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
        up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
      }`}
    >
      {up ? (
        <ArrowUp className="w-2.5 h-2.5" />
      ) : (
        <ArrowDown className="w-2.5 h-2.5" />
      )}
      {pct > 0 ? "+" : ""}
      {pct}%
    </span>
  );
}

// ─── This/last month row ───────────────────────────────────────────────────────

function MonthRow({
  thisMonth,
  lastMonth,
}: {
  thisMonth: string;
  lastMonth: string;
}) {
  return (
    <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-x-3 text-xs">
      <div>
        <p className="text-muted-foreground leading-tight">This month</p>
        <p className="font-semibold text-foreground mt-0.5 truncate">
          {thisMonth}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground leading-tight">Last month</p>
        <p className="font-semibold text-foreground mt-0.5 truncate">
          {lastMonth}
        </p>
      </div>
    </div>
  );
}

// ─── Standard KPI card ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  momPct,
  thisMonth,
  lastMonth,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  label: string;
  value: string;
  sub?: string;
  momPct?: number;
  thisMonth?: string;
  lastMonth?: string;
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4">
        {/* Icon + pill on same row — pill never wraps */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className={`p-2 rounded-xl ${bgClass} shrink-0`}>
            <Icon className={`h-4 w-4 ${iconClass}`} />
          </div>
          {momPct !== undefined && <MoMPill pct={momPct} />}
        </div>

        {/* Value — responsive size */}
        <p className="text-xl sm:text-2xl font-bold tracking-tight leading-none break-all">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-snug">
          {label}
        </p>

        {/* This/last month */}
        {thisMonth && lastMonth && (
          <MonthRow thisMonth={thisMonth} lastMonth={lastMonth} />
        )}

        {/* Sub label (for cards without month data) */}
        {sub && !thisMonth && (
          <p className="text-xs text-muted-foreground mt-2 leading-snug">
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Completion rate card ──────────────────────────────────────────────────────

function CompletionCard({
  completed,
  pending,
  rate,
}: {
  completed: number;
  pending: number;
  rate: number;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="p-2 rounded-xl bg-green-100 shrink-0">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
              rate >= 80
                ? "bg-emerald-100 text-emerald-700"
                : rate >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {rate}%
          </span>
        </div>

        <p className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
          {rate}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">Completion rate</p>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{ width: `${rate}%` }}
          />
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-x-3 text-xs">
          <div>
            <p className="text-muted-foreground leading-tight">Completed</p>
            <p className="font-semibold text-green-600 mt-0.5">
              {completed.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground leading-tight">Pending</p>
            <p className="font-semibold text-rose-500 mt-0.5">
              {pending.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function MainOverview({ data }: { data: OverviewStats }) {
  return (
    /*
      Responsive grid:
      - 1 col on xs (< 480px) — cards are full width, no overflow
      - 2 cols on sm (≥ 480px)
      - 3 cols on md (≥ 768px)
      - 4 cols on lg (≥ 1024px)
      - 5 cols on xl (≥ 1280px)
    */
    <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <KpiCard
        label="Gross Revenue"
        value={fmt(data.totalRevenue)}
        momPct={data.revenueMoM}
        thisMonth={fmtShort(data.revenueThisMonth)}
        lastMonth={fmtShort(data.revenueLastMonth)}
        icon={DollarSign}
        iconClass="text-emerald-600"
        bgClass="bg-emerald-100"
      />

      <KpiCard
        label="Platform Profit"
        value={fmtShort(data.platformProfit)}
        momPct={data.profitMoM}
        thisMonth={fmtShort(data.profitThisMonth)}
        lastMonth={fmtShort(data.profitLastMonth)}
        icon={BarChart3}
        iconClass="text-blue-600"
        bgClass="bg-blue-100"
      />

      <KpiCard
        label="Avg Order Value"
        value={fmt(data.avgOrderValue)}
        sub={`Across ${data.completedOrders.toLocaleString()} orders`}
        icon={ShoppingCart}
        iconClass="text-amber-600"
        bgClass="bg-amber-100"
      />

      <KpiCard
        label="Total Orders"
        value={data.totalOrders.toLocaleString()}
        momPct={data.ordersMoM}
        thisMonth={`${data.ordersThisMonth} orders`}
        lastMonth={`${data.ordersLastMonth} orders`}
        icon={ShoppingCart}
        iconClass="text-violet-600"
        bgClass="bg-violet-100"
      />

      <CompletionCard
        completed={data.completedOrders}
        pending={data.pendingOrders}
        rate={data.completionRate}
      />

      <KpiCard
        label="Total Customers"
        value={data.totalCustomers.toLocaleString()}
        momPct={data.customersMoM}
        thisMonth={`+${data.customersThisMonth} new`}
        lastMonth={`+${data.customersLastMonth} new`}
        icon={Users}
        iconClass="text-pink-600"
        bgClass="bg-pink-100"
      />

      <KpiCard
        label="Active Stores"
        value={data.totalStores.toLocaleString()}
        sub="Stores on the platform"
        icon={Store}
        iconClass="text-teal-600"
        bgClass="bg-teal-100"
      />

      <KpiCard
        label="Total Products"
        value={data.totalProducts.toLocaleString()}
        sub="Listed across all stores"
        icon={Package}
        iconClass="text-sky-600"
        bgClass="bg-sky-100"
      />

      <KpiCard
        label="Subsidy Given"
        value={fmtShort(data.totalSubsidyGiven)}
        sub="Applied to orders"
        icon={Sparkles}
        iconClass="text-purple-600"
        bgClass="bg-purple-100"
      />
    </div>
  );
}
