"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  CheckCircle2,
  Clock,
  Star,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { StoreAnalyticsData } from "@/actions/store/getStoreAnalytics.action";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  if (cents >= 100_000_00) return "$" + (cents / 100 / 1000).toFixed(1) + "k";
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function fmtFull(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// ─── Palette ───────────────────────────────────────────────────────────────────

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];
const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  growth,
  icon: Icon,
  bg,
}: {
  label: string;
  value: string;
  sub: string;
  growth?: number;
  icon: React.ElementType;
  bg: string;
}) {
  const isPositive = growth === undefined || growth >= 0;
  const TIcon = isPositive ? TrendingUp : TrendingDown;
  return (
    <div className={`${bg} border border-gray-100 rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">
          {label}
        </p>
        <div className={`bg-white/60 p-1.5 rounded-xl shrink-0`}>
          <Icon className={`w-4 h-4`} />
        </div>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1`}>
        {value}
      </p>
      <div className="flex items-center gap-1">
        {growth !== undefined && (
          <TIcon
            className={`w-3 h-3 shrink-0 ${isPositive ? "text-emerald-500" : "text-red-400"}`}
          />
        )}
        <p
          className={`text-xs font-medium ${growth !== undefined ? (isPositive ? "text-emerald-600" : "text-red-500") : "text-gray-400"}`}
        >
          {growth !== undefined
            ? `${growth > 0 ? "+" : ""}${growth}% vs last month`
            : sub}
        </p>
      </div>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name === "revenue" ? fmt(p.value) : p.value + " orders"}
        </p>
      ))}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  data: StoreAnalyticsData;
}

export default function StoreAnalyticsClient({ data }: Props) {
  const revenueChartData = data.monthlyRevenue.map((d) => ({
    ...d,
    revenueDollars: +(d.revenue / 100).toFixed(2),
  }));

  const dailyChartData = data.dailyOrders.map((d) => ({
    ...d,
    revenueDollars: +(d.revenue / 100).toFixed(2),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-350 mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back + heading */}
        <div>
          <Link
            href="/store"
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            A full picture of your store's performance
          </p>
        </div>

        {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Total Revenue"
            value={fmt(data.totalRevenue)}
            sub=""
            growth={data.revenueGrowth}
            icon={DollarSign}
            bg="bg-emerald-50/60"
          />
          <KpiCard
            label="This Month"
            value={fmt(data.revenueThisMonth)}
            sub="Current month"
            icon={TrendingUp}
            bg="bg-blue-50/60"
          />
          <KpiCard
            label="Total Orders"
            value={data.totalOrders.toLocaleString()}
            sub=""
            growth={data.ordersGrowth}
            icon={ShoppingCart}
            bg="bg-amber-50/60"
          />
          <KpiCard
            label="Avg Order"
            value={fmtFull(data.avgOrderValue)}
            sub="Per order"
            icon={DollarSign}
            bg="bg-violet-50/60"
          />
          <KpiCard
            label="Customers"
            value={data.totalCustomers.toLocaleString()}
            sub={`+${data.newCustomersThisMonth} new this month`}
            icon={Users}
            bg="bg-pink-50/60"
          />
          <KpiCard
            label="Completion Rate"
            value={`${data.completionRate}%`}
            sub={`${data.completedOrders} completed`}
            icon={CheckCircle2}
            bg="bg-green-50/60"
          />
          <KpiCard
            label="Pending Orders"
            value={data.pendingOrders.toLocaleString()}
            sub="Need attention"
            icon={Clock}
            bg="bg-rose-50/60"
          />
          <KpiCard
            label="Products"
            value={data.totalProducts.toLocaleString()}
            sub={`${data.inStockProducts} in stock`}
            icon={Package}
            bg="bg-sky-50/60"
          />
        </div>

        {/* ── Revenue trend (area) ───────────────────────────────────────────── */}
        <Section title="Revenue trend — last 6 months">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={revenueChartData}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#rev)"
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        {/* ── Daily orders + Categories row ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Daily orders (bar) */}
          <Section title="Daily orders — last 7 days">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={dailyChartData}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                barSize={28}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Bar
                  dataKey="orders"
                  name="orders"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          {/* Category breakdown (pie) */}
          <Section title="Products by category">
            {data.categoryBreakdown.length === 0 ? (
              <div className="h-55 flex items-center justify-center text-gray-400 text-sm">
                No products yet
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number, name: string) => [v, name]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "0.5px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data.categoryBreakdown.map((c, i) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {c.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-gray-700">
                          {c.count}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {c.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* ── Payment methods + Top Products row ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Payment methods (horizontal bar) */}
          <Section title="Payment methods">
            {data.paymentMethods.length === 0 ? (
              <div className="h-50 flex items-center justify-center text-gray-400 text-sm">
                No orders yet
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {data.paymentMethods.map((p, i) => (
                  <div key={p.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {p.method}
                      </span>
                      <span className="text-gray-500 text-xs tabular-nums">
                        {p.count} orders · {p.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${p.percentage}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Top products */}
          <Section title="Top products by sales">
            {data.topProducts.length === 0 ? (
              <div className="h-50 flex items-center justify-center text-gray-400 text-sm">
                No sales yet
              </div>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    {/* Rank */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-gray-100 text-gray-600"
                            : i === 2
                              ? "bg-orange-50 text-orange-600"
                              : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {i === 0 ? <Star className="w-3.5 h-3.5" /> : i + 1}
                    </div>

                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-500 tabular-nums ml-2 shrink-0">
                          {p.totalQuantity} sold
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                          style={{
                            width: `${Math.round((p.totalQuantity / (data.topProducts[0]?.totalQuantity || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Revenue */}
                    <span className="text-xs font-semibold text-emerald-600 tabular-nums shrink-0">
                      {fmt(p.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── Orders vs Revenue combined (bar + line) ────────────────────────── */}
        <Section title="Monthly orders vs revenue">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={revenueChartData}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              barSize={32}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="revenue"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                opacity={0.85}
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                name="orders"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                opacity={0.65}
              />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>
    </div>
  );
}
