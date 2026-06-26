import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartAreaStacked } from "@/components/admin/analytics/AreaChart";
import { TopSpenders } from "@/components/admin/analytics/TopSpenders";
import { TopProducts } from "@/components/admin/analytics/TopProducts";
import { RevenueTrendChart } from "@/components/admin/analytics/RevenueTrendChart";
import { ProfitTrendChart } from "@/components/admin/analytics/ProfitTrendChart";
import MainOverview from "@/components/admin/analytics/MainOverview";
import {
  getOverviewStats,
  getAreaChartData,
  getTopSpendersData,
  getRevenueTrend,
  getProfitTrend,
  getTopProductsData,
} from "@/actions/admin/analytics/analytics.action";

// ─── Suspense wrappers ─────────────────────────────────────────────────────────

async function OverviewWrapper() {
  const data = await getOverviewStats();
  return <MainOverview data={data} />;
}

async function RevenueTrendWrapper() {
  const data = await getRevenueTrend();
  return <RevenueTrendChart data={data} />;
}

async function ProfitTrendWrapper() {
  const data = await getProfitTrend();
  return <ProfitTrendChart data={data} />;
}

async function TopProductsWrapper() {
  const { data, keys } = await getTopProductsData();
  return <TopProducts data={data} keys={keys as string[]} fullHeight />;
}

async function AreaChartWrapper() {
  const { data, keys } = await getAreaChartData();
  return <ChartAreaStacked data={data} keys={keys} />;
}

async function TopSpendersWrapper() {
  const { data, keys } = await getTopSpendersData();
  return <TopSpenders data={data} keys={keys as string[]} fullHeight />;
}

// ─── Skeleton helpers ──────────────────────────────────────────────────────────

const CardSkeleton = ({ className = "h-40" }: { className?: string }) => (
  <Skeleton className={`w-full rounded-2xl ${className}`} />
);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 pb-24 md:pb-6 max-w-[1600px] mx-auto">
      {/* Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track sales, revenue, and user activity across the platform.
        </p>
      </div>

      {/* KPI Overview */}
      <Suspense
        fallback={
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} className="h-32" />
            ))}
          </div>
        }
      >
        <OverviewWrapper />
      </Suspense>

      {/* Revenue Trend */}
      <Suspense fallback={<CardSkeleton className="h-80" />}>
        <RevenueTrendWrapper />
      </Suspense>

      {/* Profit Trend */}
      <Suspense fallback={<CardSkeleton className="h-80" />}>
        <ProfitTrendWrapper />
      </Suspense>

      {/* Area Chart + Top Spenders */}
      <div className="flex flex-col gap-5 lg:flex-row lg:h-[420px]">
        <div className="flex-1 lg:h-full">
          <Suspense fallback={<CardSkeleton className="h-full" />}>
            <AreaChartWrapper />
          </Suspense>
        </div>

        <div className="w-full lg:w-96 lg:h-full shrink-0">
          <Suspense fallback={<CardSkeleton className="h-full" />}>
            <TopSpendersWrapper />
          </Suspense>
        </div>
      </div>

      {/* Top Products */}
      <div className="lg:h-95">
        <Suspense fallback={<CardSkeleton className="h-full" />}>
          <TopProductsWrapper />
        </Suspense>
      </div>
    </div>
  );
}