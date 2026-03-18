import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartAreaStacked } from "@/components/admin/analytics/AreaChart";
import { ChartPieSimple } from "@/components/admin/analytics/PieChart";
import { TopProducts } from "@/components/admin/analytics/TopProducts";
import { TopSpenders } from "@/components/admin/analytics/TopSpenders";
import { RevenueTrendChart } from "@/components/admin/analytics/RevenueTrendChart";
import { PaymentBreakdownChart } from "@/components/admin/analytics/PaymentBreakdownChart";
import MainOverview from "@/components/admin/analytics/MainOverview";
import {
  getOverviewStats,
  getPieChartData,
  getAreaChartData,
  getTopProductsData,
  getTopSpendersData,
  getPaymentBreakdown,
  getRevenueTrend,
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

async function PieChartWrapper() {
  const data = await getPieChartData();
  return <ChartPieSimple data={data} />;
}

async function AreaChartWrapper() {
  const { data, keys } = await getAreaChartData();
  return <ChartAreaStacked data={data} keys={keys} />;
}

async function TopProductsWrapper() {
  const { data, keys } = await getTopProductsData();
  return <TopProducts data={data} keys={keys as string[]} fullHeight />;
}

async function TopSpendersWrapper() {
  const { data, keys } = await getTopSpendersData();
  return <TopSpenders data={data} keys={keys as string[]} fullHeight />;
}

async function PaymentBreakdownWrapper() {
  const data = await getPaymentBreakdown();
  return <PaymentBreakdownChart data={data} />;
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

      {/* ── KPI overview grid ─────────────────────────────────────────────── */}
      <Suspense
        fallback={
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <CardSkeleton key={i} className="h-32" />
            ))}
          </div>
        }
      >
        <OverviewWrapper />
      </Suspense>

      {/* ── Revenue trend — full width ──────────────────────────────────── */}
      <Suspense fallback={<CardSkeleton className="h-80" />}>
        <RevenueTrendWrapper />
      </Suspense>

      {/* ── Pie + Area side by side ─────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:h-[420px]">
        <div className="w-full lg:w-[340px] lg:h-full shrink-0">
          <Suspense fallback={<CardSkeleton className="h-full" />}>
            <PieChartWrapper />
          </Suspense>
        </div>
        <div className="flex-1 lg:h-full">
          <Suspense fallback={<CardSkeleton className="h-full" />}>
            <AreaChartWrapper />
          </Suspense>
        </div>
      </div>

      {/* ── Top Products + Payment breakdown ────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:h-[420px]">
        <div className="flex-1 lg:h-full">
          <Suspense fallback={<CardSkeleton className="h-full" />}>
            <TopProductsWrapper />
          </Suspense>
        </div>
        <div className="w-full lg:w-[340px] lg:h-full shrink-0">
          <Suspense fallback={<CardSkeleton className="h-full" />}>
            <PaymentBreakdownWrapper />
          </Suspense>
        </div>
      </div>

      {/* ── Top Spenders — full width ───────────────────────────────────── */}
      <div className="lg:h-[380px]">
        <Suspense fallback={<CardSkeleton className="h-full" />}>
          <TopSpendersWrapper />
        </Suspense>
      </div>
    </div>
  );
}
