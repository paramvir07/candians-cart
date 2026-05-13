// components/customer/orderHistory/OrdersHistorySkeleton.tsx

import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-muted animate-pulse", className)} />;
}

function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden p-4 space-y-3">
      {/* top row: order id + status badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-5 w-16 rounded-full" />
        </div>
        <Bone className="h-3.5 w-20" />
      </div>

      {/* product rows */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Bone className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Bone className="h-3 w-3/4" />
            <Bone className="h-3 w-1/3" />
          </div>
          <Bone className="h-4 w-12 shrink-0" />
        </div>
      ))}

      {/* footer row: payment mode + total */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <Bone className="h-3 w-20" />
        <Bone className="h-5 w-16" />
      </div>
    </div>
  );
}

export default function OrdersHistorySkeleton({
  withNavbar = false,
}: {
  withNavbar?: boolean;
}) {
  return (
    <>
      {withNavbar && (
        <div className="sticky top-0 z-40 bg-background border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <Bone className="h-9 w-9 rounded-xl shrink-0" />
            <Bone className="h-8 flex-1 max-w-xs rounded-full" />
            <div className="ml-auto flex items-center gap-2">
              <Bone className="h-9 w-9 rounded-xl" />
              <Bone className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* ads banner placeholder */}
        {withNavbar && <Bone className="h-[100px] w-full rounded-2xl mb-6" />}

        {/* header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Bone className="h-9 w-9 rounded-full shrink-0" />
            <Bone className="h-7 w-40" />
          </div>
          <div className="flex items-center gap-2 ml-11">
            <Bone className="h-3 w-48" />
          </div>
        </div>

        {/* filters + search row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Bone className="h-8 w-12 rounded-md" />
            <Bone className="h-8 w-24 rounded-md" />
            <Bone className="h-8 w-28 rounded-md" />
          </div>
          <Bone className="h-9 w-full sm:w-60 rounded-md" />
        </div>

        {/* order cards */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}