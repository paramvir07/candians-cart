import Navbar from "@/components/customer/landing/Navbar";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className}`}
    />
  );
}

export default function ReferralLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="min-h-screen w-full bg-background">
        <div
          className="relative mx-auto w-full px-4 pb-16 pt-8 sm:px-6 sm:pt-12"
          style={{ maxWidth: "520px" }}
        >
          {/* Page header */}
          <div className="mb-6">
            <Skeleton className="h-10 w-48 mb-2 rounded-xl" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-52 mt-1.5" />
          </div>

          {/* EarningsHero skeleton */}
          <div className="mb-3 rounded-2xl overflow-hidden border border-border/60 shadow-sm">
            {/* Green top */}
            <div
              className="px-5 pt-5 pb-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6271 0.1699 149.2138 / 0.25) 0%, oklch(0.4104 0.1066 149.9393 / 0.25) 100%)",
              }}
            >
              <Skeleton className="h-3 w-20 mb-2 bg-muted/40" />
              <Skeleton className="h-12 w-32 mb-5 rounded-xl bg-muted/40" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-14 rounded-xl bg-muted/40" />
                <Skeleton className="h-14 rounded-xl bg-muted/40" />
              </div>
            </div>
            {/* White bottom */}
            <div className="bg-card px-5 pt-4 pb-5">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="mt-3 border-t border-border/60 pt-3 flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
          </div>

          {/* HowItWorks skeleton */}
          <div className="mb-3 rounded-2xl bg-card border border-border/60 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>

          {/* UsageStats skeleton */}
          <div className="mb-3 rounded-2xl bg-card border border-border/60 px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* UsedByList skeleton */}
          <div className="rounded-2xl bg-card border border-border/60 px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <div className="text-center">
                <Skeleton className="h-4 w-28 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>

            {/* User rows */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 px-2"
                style={{ borderTop: i > 0 ? "1px solid hsl(var(--border) / 0.5)" : "none" }}
              >
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-14 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}