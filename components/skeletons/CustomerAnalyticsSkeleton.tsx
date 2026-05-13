// components/customer/analytics/AnalyticsSkeleton.tsx

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-muted animate-pulse", className)} />;
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Bone className="h-3 w-24" />
          <Bone className="w-8 h-8 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Bone className="h-7 w-28" />
          <Bone className="h-2.5 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-5 pt-5 pb-4 space-y-2">
        <Bone className="h-3 w-24" />
        <Bone className="h-8 w-32" />
        <Bone className="h-2.5 w-20" />
      </div>
      <Bone className="mx-5 mb-5 h-[180px] rounded-xl" />
    </Card>
  );
}

export default function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-7 w-28" />
          <Bone className="h-3.5 w-48" />
        </div>
        <Bone className="h-9 w-36 rounded-lg" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Ads placeholder */}
      <Bone className="h-[120px] w-full rounded-2xl" />

      {/* Savings calculator */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Bone className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <Bone className="h-4 w-36" />
            <Bone className="h-3 w-72" />
          </div>
          <Bone className="h-6 w-24 rounded-full hidden sm:block" />
        </div>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <Bone className="h-3 w-40" />
                <Bone className="h-10 w-full rounded-lg" />
              </div>
              <Bone className="h-4 w-full rounded-full" />
              <div className="space-y-2">
                <Bone className="h-3 w-24" />
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Bone key={i} className="h-8 w-12 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex justify-between px-4 py-3">
                    <Bone className="h-3 w-40" />
                    <Bone className="h-3 w-16" />
                  </div>
                ))}
              </div>
              <Bone className="h-[100px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-4">
        <ChartCardSkeleton className="lg:col-span-3" />
        <ChartCardSkeleton className="lg:col-span-2" />
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Order history */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="grid grid-cols-12 gap-2">
              {[1, 4, 3, 2, 2].map((span, i) => (
                <div key={i} className={`col-span-${span}`}>
                  <Bone className="h-2.5 w-full" />
                </div>
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center px-5 py-3.5 border-b border-border last:border-b-0 gap-2"
            >
              <Bone className="col-span-1 h-3 w-full" />
              <div className="col-span-4 space-y-1">
                <Bone className="h-3 w-full" />
                <Bone className="h-2.5 w-3/4" />
              </div>
              <Bone className="col-span-3 h-5 rounded-full w-20" />
              <Bone className="col-span-2 h-3 w-full" />
              <div className="col-span-2 flex flex-col items-end gap-1">
                <Bone className="h-4 w-14" />
                <Bone className="h-2.5 w-10" />
              </div>
            </div>
          ))}
        </Card>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Payment modes */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <Bone className="h-2.5 w-28" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-b-0">
                <Bone className="w-8 h-8 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-3 w-16" />
                  <Bone className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </Card>

          {/* Subsidy earned */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bone className="w-7 h-7 rounded-xl" />
              <Bone className="h-2.5 w-28" />
            </div>
            <Bone className="h-8 w-28" />
            <Bone className="h-2.5 w-36" />
          </Card>

          {/* Wallet summary */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border space-y-1.5">
              <Bone className="h-2.5 w-16" />
              <Bone className="h-6 w-24" />
              <Bone className="h-2.5 w-32" />
            </div>
            <div className="px-5 py-4 space-y-1.5">
              <Bone className="h-2.5 w-16" />
              <Bone className="h-6 w-24" />
              <Bone className="h-2.5 w-32" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}