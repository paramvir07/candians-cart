// components/customer/budgetpacks/BudgetPacksSkeleton.tsx

import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted animate-pulse",
        className,
      )}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border bg-background flex flex-col overflow-hidden">
      {/* top accent */}
      <div className="h-0.5 bg-muted" />

      <div className="pt-6 px-5 pb-0 flex-1 space-y-4">
        {/* header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bone className="w-9 h-9 rounded-xl" />
            <Bone className="h-4 w-24" />
          </div>
          <Bone className="h-7 w-10" />
        </div>

        {/* description */}
        <div className="space-y-1.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-4/5" />
        </div>

        {/* gift subsidy pill */}
        <Bone className="h-10 w-full rounded-xl" />

        {/* items list */}
        <div className="rounded-xl overflow-hidden border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between px-3 py-2.5 bg-muted/20">
              <Bone className="h-3 w-32" />
              <Bone className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* pricing footer */}
      <div className="px-5 pt-4 border-t border-border mt-3 space-y-2.5">
        <div className="flex justify-between">
          <Bone className="h-3 w-28" />
          <Bone className="h-5 w-12" />
        </div>
        <Bone className="h-14 w-full rounded-xl" />
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-3">
        <Bone className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function BudgetPacksSkeleton() {
  return (
    <main className="min-h-screen flex flex-col items-center py-6 sm:py-8 px-4">
      {/* back button */}
      <div className="w-full max-w-5xl mb-6">
        <Bone className="h-9 w-20 rounded-xl" />
      </div>

      {/* hero */}
      <div className="text-center mb-6 w-full max-w-xl space-y-3">
        <Bone className="h-9 w-64 mx-auto" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-4/5 mx-auto" />
      </div>

      {/* how-it-works card */}
      <div className="w-full max-w-5xl mb-6 rounded-2xl border-2 border-border p-5 space-y-4">
        <Bone className="h-5 w-44" />
        <Bone className="h-3 w-80" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <Bone className="w-8 h-8 rounded-full" />
                <Bone className="w-5 h-5 rounded-full" />
              </div>
              <Bone className="h-4 w-3/4" />
              <div className="space-y-1">
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-5/6" />
                <Bone className="h-3 w-4/6" />
              </div>
            </div>
          ))}
        </div>

        {/* subsidy tier table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex justify-between">
            <Bone className="h-3 w-48" />
            <Bone className="h-3 w-32" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 flex flex-col items-center gap-1.5">
                <Bone className="h-2.5 w-12" />
                <Bone className="h-5 w-8" />
                <Bone className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-border">
            <Bone className="h-3 w-72" />
          </div>
        </div>
      </div>

      {/* view switcher + heading */}
      <div className="w-full max-w-5xl mb-4 space-y-3">
        <Bone className="h-9 w-52 rounded-2xl" />
        <Bone className="h-4 w-56" />
        <Bone className="h-3 w-72" />
      </div>

      {/* cards grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}