"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ShoppingBag,
  Wallet,
  TrendingUp,
  Gift,
  CreditCard,
  Banknote,
  ChevronDown,
  Calculator,
  Clock,
  Package,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  SerializedOrder,
  SerializedWalletPayment,
  WalletTopUpEntry,
} from "@/app/customer/(customer)/analytics/page";

// ── shadcn/ui imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import CustomerAdvertisements from "../shared/CustomerAdvertisements";

type Period = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

interface Props {
  orders: SerializedOrder[];
  stripeTopUps: SerializedWalletPayment[];
  walletTopUps: WalletTopUpEntry[];
}

const fmt = (cents: number) => (cents / 100).toFixed(2);
const fmtShort = (cents: number) => {
  const d = cents / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(1)}k`;
  return `$${d.toFixed(0)}`;
};
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
const fmtMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    year: "2-digit",
  });
const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const PERIODS: { label: string; value: Period }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
  { label: "Last 6 months", value: "6m" },
  { label: "This year", value: "1y" },
  { label: "All time", value: "all" },
];

const MIN_SPEND = 21;

function cutoff(period: Period): Date | null {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (period === "3m") return new Date(now.getTime() - 90 * 86400000);
  if (period === "6m") return new Date(now.getTime() - 180 * 86400000);
  if (period === "1y") return new Date(new Date().getFullYear(), 0, 1);
  return null;
}

function filterByPeriod<T extends { createdAt: string }>(
  items: T[],
  period: Period,
): T[] {
  const co = cutoff(period);
  if (!co) return items;
  return items.filter((i) => new Date(i.createdAt) >= co);
}

const statusConfig = (status?: string, paymentMode?: string) => {
  if (status === "completed")
    return {
      label: "Completed",
      bg: "oklch(0.6271 0.1699 149.2138 / 0.1)",
      color: "var(--primary)",
      dot: "var(--primary)",
    };
  if (paymentMode === "pending")
    return {
      label: "Awaiting Payment",
      bg: "oklch(0.7858 0.1598 85.3091 / 0.12)",
      color: "oklch(0.45 0.13 85)",
      dot: "oklch(0.6 0.15 85)",
    };
  return {
    label: "Processing",
    bg: "oklch(0.5271 0.1699 149.2138 / 0.08)",
    color: "oklch(0.45 0.12 149)",
    dot: "oklch(0.55 0.15 149)",
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-[11px] shadow-lg bg-card border-border">
      <p className="font-semibold mb-1 text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-black text-primary">
          {p.name === "spent" ? `CA$${fmt(p.value)}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  isCount = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
  isCount?: boolean;
}) => (
  <Card>
    <CardContent className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? "bg-primary/10" : "bg-secondary"}`}
        >
          <Icon
            className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          {!isCount && (
            <span className="text-sm font-semibold text-muted-foreground">
              CA$
            </span>
          )}
          <span
            className={`text-2xl font-black tabular-nums tracking-tight ${accent ? "text-primary" : "text-foreground"}`}
          >
            {value}
          </span>
        </div>
        {sub && <p className="text-[11px] mt-1 text-muted-foreground">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

// ── Savings Calculator Component
function SavingsCalculator() {
  const [spend, setSpend] = useState(21);
  const [rawInput, setRawInput] = useState("21");

  const eligible = spend >= MIN_SPEND;
  const subsidised = eligible ? spend * 0.35 : 0;
  const savings = eligible ? subsidised * 0.6 : 0;
  const annual = savings * 12;

  const fmtDollar = (n: number) => "$" + n.toFixed(2);
  const fmtInt = (n: number) => "$" + Math.ceil(n).toLocaleString();

  const handleInputChange = (val: string) => {
    setRawInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setSpend(Math.min(5000, Math.max(0, parsed)));
    } else if (val === "" || val === "0") {
      setSpend(0);
    }
  };

  const handleSliderChange = (val: number[]) => {
    const v = val[0];
    setSpend(v);
    setRawInput(String(v));
  };

  const quickPicks = [21, 34, 55, 89, 144, 200, 300, 400, 500];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 border-b border-border bg-primary/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              Savings Calculator
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              See how much you could save with our subsidy program — minimum
              spend of ${MIN_SPEND} required.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="ml-auto shrink-0 hidden sm:flex gap-1 text-primary bg-primary/10 border-primary/20"
          >
            <Sparkles className="w-3 h-3" />
            Live estimate
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left: Controls */}
          <div className="flex-1 space-y-6">
            {/* Monthly spend input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Monthly grocery spend
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm pointer-events-none">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  max="5000"
                  step="1"
                  value={rawInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={() => setRawInput(spend === 0 ? "" : String(spend))}
                  className={`pl-7 font-semibold tabular-nums transition-colors ${
                    spend > 0 && !eligible
                      ? "border-destructive/50 focus-visible:ring-destructive/30 bg-destructive/5"
                      : ""
                  }`}
                />
              </div>
              {spend > 0 && !eligible && (
                <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <span>⚠️</span>
                  Minimum spend of ${MIN_SPEND} required to qualify.
                </p>
              )}
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>$0</span>
                <span>$2,000</span>
              </div>
              <Slider
                min={0}
                max={2000}
                step={1}
                value={[Math.min(2000, Math.max(0, spend))]}
                onValueChange={handleSliderChange}
                className="w-full"
              />
            </div>

            {/* Quick picks */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick select
              </p>
              <div className="flex gap-2 flex-wrap">
                {quickPicks.map((v) => (
                  <Button
                    key={v}
                    variant={spend === v ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSpend(v);
                      setRawInput(String(v));
                    }}
                    className={`rounded-lg h-8 px-3 text-xs font-bold transition-all ${
                      spend === v
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    ${v}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="hidden lg:block self-stretch"
          />

          {/* ── Right: Results */}
          <div className="flex-1 space-y-3 flex flex-col justify-center">
            {/* Breakdown rows */}
            <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Your total spend
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {fmtDollar(spend)}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Discount applied (upto 30%)
                  </p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${eligible ? "text-primary" : "text-muted-foreground"}`}
                >
                  {fmtDollar(savings)}
                </span>
              </div>
            </div>

            {/* Result banner */}
            <div
              className="rounded-xl p-5 flex items-center justify-between gap-4 relative overflow-hidden transition-all duration-500"
              style={{
                background: eligible
                  ? "linear-gradient(135deg, #166534 0%, #16a34a 100%)"
                  : "linear-gradient(135deg, #57534e 0%, #78716c 100%)",
              }}
            >
              {/* decorative rings */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full border border-white/10 pointer-events-none" />

              <div className="relative z-10">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {eligible ? "You save up to" : "Minimum not met"}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    key={savings.toFixed(2)}
                    className="text-4xl font-black tabular-nums leading-none"
                    style={{ color: "#fff", animation: "countUp 0.2s ease" }}
                  >
                    {fmtInt(Math.ceil(savings))}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    / mo
                  </span>
                </div>
              </div>

              <div className="text-right relative z-10">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Annually
                </p>
                <span
                  key={annual.toFixed(2)}
                  className="text-2xl font-black tabular-nums"
                  style={{ color: "#fff", animation: "countUp 0.2s ease" }}
                >
                  {fmtInt(Math.ceil(annual))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <style>{`
        @keyframes countUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Card>
  );
}

// ── Main Dashboard
export default function AnalyticsDashboard({
  orders,
  stripeTopUps,
  walletTopUps,
}: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [dropOpen, setDropOpen] = useState(false);

  const filteredOrders = useMemo(
    () => filterByPeriod(orders, period),
    [orders, period],
  );
  const filteredStripe = useMemo(
    () => filterByPeriod(stripeTopUps, period),
    [stripeTopUps, period],
  );
  const filteredWallet = useMemo(
    () => filterByPeriod(walletTopUps, period),
    [walletTopUps, period],
  );

  const totalSpent = filteredOrders.reduce((s, o) => s + o.cartTotal, 0);
  const totalSubsidy = filteredOrders.reduce(
    (s, o) => s + (o.subsidyUsed ?? 0),
    0,
  );
  const completedOrders = filteredOrders.filter(
    (o) => o.status === "completed",
  ).length;
  const totalStripeLoad = filteredStripe
    .filter((t) => t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);
  const totalStoreLoad = filteredWallet.reduce((s, t) => s + t.value, 0);

  const spendingChart = useMemo(() => {
    const useMonth = ["3m", "6m", "1y", "all"].includes(period);
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      const key = useMonth ? fmtMonth(o.createdAt) : fmtDate(o.createdAt);
      map.set(key, (map.get(key) ?? 0) + o.cartTotal);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, spent]) => ({ date, spent }));
  }, [filteredOrders, period]);

  const ordersChart = useMemo(() => {
    const useMonth = ["3m", "6m", "1y", "all"].includes(period);
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      const key = useMonth ? fmtMonth(o.createdAt) : fmtDate(o.createdAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
  }, [filteredOrders, period]);

  const paymentBreakdown = useMemo(() => {
    const acc: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const m = o.paymentMode ?? "pending";
      acc[m] = (acc[m] ?? 0) + 1;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [filteredOrders]);

  const periodLabel =
    PERIODS.find((p) => p.value === period)?.label ?? "Last 30 days";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* ── Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            Your spending & order analytics
          </p>
        </div>

        {/* Period dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 h-9 px-3 font-semibold"
          >
            <Clock className="w-3.5 h-3.5 text-primary" />
            {periodLabel}
            <ChevronDown
              className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200"
              style={{ transform: dropOpen ? "rotate(180deg)" : "none" }}
            />
          </Button>

          {dropOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-border overflow-hidden z-50 shadow-lg bg-card">
                {PERIODS.map((p, i) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setPeriod(p.value);
                      setDropOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                    style={{
                      background:
                        period === p.value
                          ? "oklch(0.6271 0.1699 149.2138 / 0.08)"
                          : "transparent",
                      color:
                        period === p.value
                          ? "var(--primary)"
                          : "var(--foreground)",
                      borderBottom:
                        i !== PERIODS.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      fontWeight: period === p.value ? 700 : 500,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Spent"
          value={fmt(totalSpent)}
          sub={`${filteredOrders.length} orders placed`}
          icon={TrendingUp}
          accent
        />
        <MetricCard
          label="Subsidy Saved"
          value={fmt(totalSubsidy)}
          sub="Saved upto 30%"
          icon={Gift}
          accent
        />
        <MetricCard
          label="Orders"
          value={filteredOrders.length}
          sub={`${completedOrders} completed`}
          icon={ShoppingBag}
          isCount
        />
        <MetricCard
          label="Wallet Loaded"
          value={fmt(totalStripeLoad + totalStoreLoad)}
          sub="stripe + store top-ups"
          icon={Wallet}
        />
      </div>
      <CustomerAdvertisements maxHeight={250} />
      {/* ── Savings Calculator */}
      <SavingsCalculator />
      {/* ── Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Spending area */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold mb-1 text-muted-foreground">
                Total Spending
              </p>
              <p className="text-3xl font-black tabular-nums text-foreground">
                CA${fmt(totalSpent)}
              </p>
              {totalSubsidy > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    CA${fmt(totalSubsidy)} subsidised
                  </span>
                </div>
              )}
            </div>
            <Badge
              variant="secondary"
              className="text-xs font-semibold text-primary bg-primary/10 border-primary/20"
            >
              {periodLabel}
            </Badge>
          </div>

          <div style={{ height: 180 }}>
            {spendingChart.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No data for this period
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={spendingChart}
                  margin={{ top: 0, right: 16, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.6271 0.1699 149.2138)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.6271 0.1699 149.2138)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.9324 0.0207 158.2303 / 0.6)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: "oklch(0.5252 0.0315 157.3462)",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => fmtShort(v)}
                    tick={{
                      fontSize: 10,
                      fill: "oklch(0.5252 0.0315 157.3462)",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    name="spent"
                    stroke="oklch(0.6271 0.1699 149.2138)"
                    strokeWidth={2.5}
                    fill="url(#spendGrad)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "oklch(0.6271 0.1699 149.2138)",
                      strokeWidth: 0,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Orders bar */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-semibold mb-1 text-muted-foreground">
              Orders
            </p>
            <p className="text-3xl font-black tabular-nums text-foreground">
              {filteredOrders.length}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {completedOrders} completed ·{" "}
              {filteredOrders.length - completedOrders} pending
            </p>
          </div>
          <div style={{ height: 180 }}>
            {ordersChart.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No orders</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ordersChart}
                  margin={{ top: 0, right: 16, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.9324 0.0207 158.2303 / 0.6)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 9,
                      fill: "oklch(0.5252 0.0315 157.3462)",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 9,
                      fill: "oklch(0.5252 0.0315 157.3462)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="count"
                    fill="oklch(0.6271 0.1699 149.2138)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* ── Bottom row: order history + sidebar */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Order history */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div
            className="grid grid-cols-12 px-5 py-3 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}
          >
            <span className="col-span-1">#</span>
            <span className="col-span-4">Items</span>
            <span className="col-span-3">Status</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center gap-2">
              <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
              <p className="text-sm font-medium text-muted-foreground">
                No orders in this period
              </p>
            </div>
          ) : (
            filteredOrders.slice(0, 7).map((order, i) => {
              const st = statusConfig(order.status, order.paymentMode);
              const allProducts = [...order.products, ...order.subsidyItems];
              return (
                <div
                  key={order._id}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 ${i !== Math.min(filteredOrders.length, 7) - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="col-span-1 text-[11px] font-bold tabular-nums text-muted-foreground">
                    #{i + 1}
                  </span>
                  <div className="col-span-4 min-w-0">
                    <p className="text-xs font-semibold truncate text-foreground">
                      {allProducts[0]?.productId?.name ?? "Order"}
                      {allProducts.length > 1 && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          +{allProducts.length - 1} more
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground">
                      {allProducts.reduce((s, p) => s + p.quantity, 0)} items
                    </p>
                  </div>
                  <div className="col-span-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: st.dot }}
                      />
                      {st.label}
                    </span>
                  </div>
                  <span className="col-span-2 text-[10px] text-muted-foreground">
                    {fmtFull(order.createdAt)}
                  </span>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-black tabular-nums text-primary">
                      CA${fmt(order.cartTotal)}
                    </p>
                    {(order.subsidyUsed ?? 0) > 0 && (
                      <p className="text-[9px] font-semibold text-primary opacity-60">
                        −${fmt(order.subsidyUsed)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Card>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Payment breakdown */}
          <Card className="overflow-hidden">
            <div
              className="px-5 py-4 border-b border-border"
              style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Payment Modes
              </p>
            </div>
            {paymentBreakdown.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">No data</p>
              </div>
            ) : (
              paymentBreakdown.map(([mode, count], i) => (
                <div
                  key={mode}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i !== paymentBreakdown.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-primary/[0.08]">
                    {mode === "card" ? (
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                    ) : mode === "cash" ? (
                      <Banknote className="w-3.5 h-3.5 text-primary" />
                    ) : mode === "wallet" ? (
                      <Wallet className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold capitalize text-foreground">
                      {mode}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full overflow-hidden bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${filteredOrders.length > 0 ? (count / filteredOrders.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-black tabular-nums shrink-0 text-foreground">
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Subsidy earned */}
          {totalSubsidy > 0 && (
            <Card
              className="p-5 border"
              style={{
                background: "oklch(0.6271 0.1699 149.2138 / 0.05)",
                borderColor: "oklch(0.6271 0.1699 149.2138 / 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-primary/15">
                  <Gift className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">
                  Subsidy Earned
                </p>
              </div>
              <p className="text-2xl font-black tabular-nums text-primary">
                <span className="text-sm font-semibold mr-0.5 opacity-70">
                  CA$
                </span>
                {fmt(totalSubsidy)}
              </p>
              <p className="text-[11px] mt-1.5 text-primary opacity-65">
                across{" "}
                {filteredOrders.filter((o) => (o.subsidyUsed ?? 0) > 0).length}{" "}
                orders
              </p>
            </Card>
          )}

          {/* Wallet summary */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-muted-foreground">
                Via Stripe
              </p>
              <p className="text-lg font-black tabular-nums text-primary">
                <span className="text-xs font-semibold mr-0.5 text-muted-foreground">
                  CA$
                </span>
                {fmt(totalStripeLoad)}
              </p>
              <p className="text-[10px] mt-0.5 text-muted-foreground">
                {filteredStripe.filter((t) => t.status === "paid").length}{" "}
                successful charges
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-muted-foreground">
                Via Store
              </p>
              <p className="text-lg font-black tabular-nums text-foreground">
                <span className="text-xs font-semibold mr-0.5 text-muted-foreground">
                  CA$
                </span>
                {fmt(totalStoreLoad)}
              </p>
              <p className="text-[10px] mt-0.5 text-muted-foreground">
                {filteredWallet.length} top-up events
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
