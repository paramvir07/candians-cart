import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Store,
  Package,
  Sparkles,
  BarChart3,
  ArrowUp,
  HelpCircle,
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
  if (pct <= 0) return null;

  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 bg-emerald-100 text-emerald-700">
      <ArrowUp className="w-2.5 h-2.5" />+{pct}%
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

// ─── Note tooltip — small "?" icon, breakdown shown on hover ──────────────────

function NoteTooltip({ note }: { note: string }) {
  return (
    <span className="relative group/tip inline-flex shrink-0">
      <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
      <span
        role="tooltip"
        className="pointer-events-none absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] rounded-lg bg-gray-900 text-white text-[10px] leading-snug px-2.5 py-1.5 opacity-0 scale-95 origin-bottom transition-all duration-150 group-hover/tip:opacity-100 group-hover/tip:scale-100"
      >
        {note}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}

// ─── Standard KPI card ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  note,
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
  note?: string;
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

        <div className="flex items-center gap-1 mt-1">
          <p className="text-xs text-muted-foreground leading-snug">{label}</p>
          {note && <NoteTooltip note={note} />}
        </div>

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

// ─── Page component ────────────────────────────────────────────────────────────

export default function MainOverview({ data }: { data: OverviewStats }) {
  return (
    <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
        value={fmt(data.platformProfit + data.platformFee)}
        momPct={data.profitMoM}
        thisMonth={fmtShort(data.profitThisMonth)}
        lastMonth={fmtShort(data.profitLastMonth)}
        note={`Platform Profit (${fmt(data.platformProfit)}) + Platform Fee (${fmt(data.platformFee)})`}
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
        sub="Applied to completed orders"
        icon={Sparkles}
        iconClass="text-purple-600"
        bgClass="bg-purple-100"
      />
    </div>
  );
}
