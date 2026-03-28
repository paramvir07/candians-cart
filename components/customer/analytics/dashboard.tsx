"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  ShoppingBag, Wallet, TrendingUp, Gift,
  CreditCard, Banknote, ChevronDown, BarChart3,
  CheckCircle2, Clock, Package, ArrowUpRight,
} from "lucide-react";
import { SerializedOrder, SerializedWalletPayment, WalletTopUpEntry } from "@/app/customer/(customer)/analytics/page";

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
  new Date(iso).toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });

const PERIODS: { label: string; value: Period }[] = [
  { label: "Last 7 days",   value: "7d"  },
  { label: "Last 30 days",  value: "30d" },
  { label: "Last 3 months", value: "3m"  },
  { label: "Last 6 months", value: "6m"  },
  { label: "This year",     value: "1y"  },
  { label: "All time",      value: "all" },
];

function cutoff(period: Period): Date | null {
  const now = new Date();
  if (period === "7d")  return new Date(now.getTime() - 7   * 86400000);
  if (period === "30d") return new Date(now.getTime() - 30  * 86400000);
  if (period === "3m")  return new Date(now.getTime() - 90  * 86400000);
  if (period === "6m")  return new Date(now.getTime() - 180 * 86400000);
  if (period === "1y")  return new Date(new Date().getFullYear(), 0, 1);
  return null;
}

function filterByPeriod<T extends { createdAt: string }>(items: T[], period: Period): T[] {
  const co = cutoff(period);
  if (!co) return items;
  return items.filter(i => new Date(i.createdAt) >= co);
}

const statusConfig = (status?: string, paymentMode?: string) => {
  if (status === "completed") return { label: "Completed",        bg: "oklch(0.6271 0.1699 149.2138 / 0.1)",  color: "var(--primary)",       dot: "var(--primary)" };
  if (paymentMode === "pending") return { label: "Awaiting Payment", bg: "oklch(0.7858 0.1598 85.3091 / 0.12)", color: "oklch(0.45 0.13 85)", dot: "oklch(0.6 0.15 85)" };
  return { label: "Processing",       bg: "oklch(0.5271 0.1699 149.2138 / 0.08)", color: "oklch(0.45 0.12 149)", dot: "oklch(0.55 0.15 149)" };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-[11px] shadow-lg"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <p className="font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-black" style={{ color: "var(--primary)" }}>
          {p.name === "spent" ? `CA$${fmt(p.value)}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

// ── Metric Card (like reference image top row)
const MetricCard = ({ label, value, sub, icon: Icon, accent = false, isCount = false }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: boolean; isCount?: boolean;
}) => (
  <div className="rounded-2xl border p-5 flex flex-col gap-3"
    style={{ background: "var(--card)", borderColor: "var(--border)" }}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: accent ? "oklch(0.6271 0.1699 149.2138 / 0.1)" : "var(--secondary)" }}>
        <Icon className="w-4 h-4" style={{ color: accent ? "var(--primary)" : "var(--muted-foreground)" }} />
      </div>
    </div>
    <div>
      <div className="flex items-baseline gap-1">
        {!isCount && <span className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>CA$</span>}
        <span className="text-2xl font-black tabular-nums tracking-tight"
          style={{ color: accent ? "var(--primary)" : "var(--foreground)" }}>
          {value}
        </span>
      </div>
      {sub && (
        <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

export default function AnalyticsDashboard({ orders, stripeTopUps, walletTopUps }: Props) {
  const [period, setPeriod]     = useState<Period>("30d");
  const [dropOpen, setDropOpen] = useState(false);

  const filteredOrders = useMemo(() => filterByPeriod(orders, period),       [orders, period]);
  const filteredStripe = useMemo(() => filterByPeriod(stripeTopUps, period), [stripeTopUps, period]);
  const filteredWallet = useMemo(() => filterByPeriod(walletTopUps, period), [walletTopUps, period]);

  const totalSpent      = filteredOrders.reduce((s, o) => s + o.cartTotal, 0);
  const totalSubsidy    = filteredOrders.reduce((s, o) => s + (o.subsidyUsed ?? 0), 0);
  const completedOrders = filteredOrders.filter(o => o.status === "completed").length;
  const totalStripeLoad = filteredStripe.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalStoreLoad  = filteredWallet.reduce((s, t) => s + t.amount, 0);

  const spendingChart = useMemo(() => {
    const useMonth = ["3m","6m","1y","all"].includes(period);
    const map = new Map<string, number>();
    filteredOrders.forEach(o => {
      const key = useMonth ? fmtMonth(o.createdAt) : fmtDate(o.createdAt);
      map.set(key, (map.get(key) ?? 0) + o.cartTotal);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, spent]) => ({ date, spent }));
  }, [filteredOrders, period]);

  const ordersChart = useMemo(() => {
    const useMonth = ["3m","6m","1y","all"].includes(period);
    const map = new Map<string, number>();
    filteredOrders.forEach(o => {
      const key = useMonth ? fmtMonth(o.createdAt) : fmtDate(o.createdAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  }, [filteredOrders, period]);

  const paymentBreakdown = useMemo(() => {
    const acc: Record<string, number> = {};
    filteredOrders.forEach(o => { const m = o.paymentMode ?? "pending"; acc[m] = (acc[m] ?? 0) + 1; });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [filteredOrders]);

  const periodLabel = PERIODS.find(p => p.value === period)?.label ?? "Last 30 days";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">

      {/* ── Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Your spending & order analytics
          </p>
        </div>

        {/* Period dropdown */}
        <div className="relative">
          <button onClick={() => setDropOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            {periodLabel}
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ color: "var(--muted-foreground)", transform: dropOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border overflow-hidden z-50 shadow-lg"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {PERIODS.map((p, i) => (
                  <button key={p.value}
                    onClick={() => { setPeriod(p.value); setDropOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--secondary)]"
                    style={{
                      background: period === p.value ? "oklch(0.6271 0.1699 149.2138 / 0.08)" : "transparent",
                      color: period === p.value ? "var(--primary)" : "var(--foreground)",
                      borderBottom: i !== PERIODS.length - 1 ? "1px solid var(--border)" : "none",
                      fontWeight: period === p.value ? 700 : 500,
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Top metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total Spent"    value={fmt(totalSpent)}           sub={`${filteredOrders.length} orders placed`} icon={TrendingUp}   accent />
        <MetricCard label="Subsidy Saved"  value={fmt(totalSubsidy)}         sub="60% markup returned"                      icon={Gift}         accent />
        <MetricCard label="Orders"         value={filteredOrders.length}     sub={`${completedOrders} completed`}           icon={ShoppingBag}  isCount />
        <MetricCard label="Wallet Loaded"  value={fmt(totalStripeLoad + totalStoreLoad)} sub="stripe + store top-ups"      icon={Wallet}       />
      </div>

      {/* ── Charts */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* Spending area */}
        <div className="lg:col-span-3 rounded-2xl border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 pt-5 pb-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
                Total Spending
              </p>
              <p className="text-3xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>
                CA${fmt(totalSpent)}
              </p>
              {totalSubsidy > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" style={{ color: "var(--primary)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                    CA${fmt(totalSubsidy)} subsidised
                  </span>
                </div>
              )}
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.1)", color: "var(--primary)" }}>
              {periodLabel}
            </div>
          </div>

          <div style={{ height: 180 }}>
            {spendingChart.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No data for this period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingChart} margin={{ top: 0, right: 16, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="oklch(0.6271 0.1699 149.2138)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="oklch(0.6271 0.1699 149.2138)" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9324 0.0207 158.2303 / 0.6)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.5252 0.0315 157.3462)" }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 10, fill: "oklch(0.5252 0.0315 157.3462)" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="spent" name="spent" stroke="oklch(0.6271 0.1699 149.2138)" strokeWidth={2.5} fill="url(#spendGrad)" dot={false} activeDot={{ r: 4, fill: "oklch(0.6271 0.1699 149.2138)", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders bar */}
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>Orders</p>
            <p className="text-3xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>
              {filteredOrders.length}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {completedOrders} completed · {filteredOrders.length - completedOrders} pending
            </p>
          </div>
          <div style={{ height: 180 }}>
            {ordersChart.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No orders</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersChart} margin={{ top: 0, right: 16, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9324 0.0207 158.2303 / 0.6)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "oklch(0.5252 0.0315 157.3462)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "oklch(0.5252 0.0315 157.3462)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="count" fill="oklch(0.6271 0.1699 149.2138)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Order history table-style */}
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>

          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 border-b text-[10px] font-black uppercase tracking-widest"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}>
            <span className="col-span-1">#</span>
            <span className="col-span-4">Items</span>
            <span className="col-span-3">Status</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center gap-2">
              <ShoppingBag className="w-10 h-10" style={{ color: "var(--muted-foreground)", opacity: 0.2 }} />
              <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>No orders in this period</p>
            </div>
          ) : (
            filteredOrders.slice(0, 7).map((order, i) => {
              const st = statusConfig(order.status, order.paymentMode);
              const allProducts = [...order.products, ...order.subsidyItems];
              return (
                <div key={order._id}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 ${i !== Math.min(filteredOrders.length, 7) - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "var(--border)" }}>

                  {/* Index */}
                  <span className="col-span-1 text-[11px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                    #{i + 1}
                  </span>

                  {/* Items */}
                  <div className="col-span-4 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>
                      {allProducts[0]?.productId?.name ?? "Order"}
                      {allProducts.length > 1 && (
                        <span className="ml-1 font-normal" style={{ color: "var(--muted-foreground)" }}>
                          +{allProducts.length - 1} more
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {allProducts.reduce((s, p) => s + p.quantity, 0)} items
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="col-span-2 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {fmtFull(order.createdAt)}
                  </span>

                  {/* Total */}
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-black tabular-nums" style={{ color: "var(--primary)" }}>
                      CA${fmt(order.cartTotal)}
                    </p>
                    {(order.subsidyUsed ?? 0) > 0 && (
                      <p className="text-[9px] font-semibold" style={{ color: "var(--primary)", opacity: 0.6 }}>
                        −${fmt(order.subsidyUsed)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">

          {/* Payment breakdown */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b"
              style={{ borderColor: "var(--border)", background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Payment Modes
              </p>
            </div>
            {paymentBreakdown.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No data</p>
              </div>
            ) : (
              paymentBreakdown.map(([mode, count], i) => (
                <div key={mode}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i !== paymentBreakdown.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "var(--border)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.08)" }}>
                    {mode === "card"   ? <CreditCard className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} /> :
                     mode === "cash"   ? <Banknote   className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} /> :
                     mode === "wallet" ? <Wallet     className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} /> :
                                         <Clock      className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold capitalize" style={{ color: "var(--foreground)" }}>{mode}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${filteredOrders.length > 0 ? (count / filteredOrders.length) * 100 : 0}%`,
                            background: "var(--primary)",
                          }} />
                      </div>
                      <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color: "var(--foreground)" }}>
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subsidy card */}
          {totalSubsidy > 0 && (
            <div className="rounded-2xl p-5 border"
              style={{
                background: "oklch(0.6271 0.1699 149.2138 / 0.05)",
                borderColor: "oklch(0.6271 0.1699 149.2138 / 0.2)",
              }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.15)" }}>
                  <Gift className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                  Subsidy Earned
                </p>
              </div>
              <p className="text-2xl font-black tabular-nums" style={{ color: "var(--primary)" }}>
                <span className="text-sm font-semibold mr-0.5" style={{ opacity: 0.7 }}>CA$</span>
                {fmt(totalSubsidy)}
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--primary)", opacity: 0.65 }}>
                across {filteredOrders.filter(o => (o.subsidyUsed ?? 0) > 0).length} orders
              </p>
            </div>
          )}

          {/* Wallet summary */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                style={{ color: "var(--muted-foreground)" }}>Via Stripe</p>
              <p className="text-lg font-black tabular-nums" style={{ color: "var(--primary)" }}>
                <span className="text-xs font-semibold mr-0.5" style={{ color: "var(--muted-foreground)" }}>CA$</span>
                {fmt(totalStripeLoad)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {filteredStripe.filter(t => t.status === "paid").length} successful charges
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                style={{ color: "var(--muted-foreground)" }}>Via Store</p>
              <p className="text-lg font-black tabular-nums" style={{ color: "var(--foreground)" }}>
                <span className="text-xs font-semibold mr-0.5" style={{ color: "var(--muted-foreground)" }}>CA$</span>
                {fmt(totalStoreLoad)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {filteredWallet.length} top-up events
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}