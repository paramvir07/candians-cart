import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Mobile/Tablet ── */}
      <div className="lg:hidden flex flex-col px-4 pt-5 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-8 rounded-full ml-auto" />
        </div>

        {/* Progress bar card */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>

        {/* Items section label */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Cart items */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 bg-card rounded-xl border border-border/60 p-3"
            >
              <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-16 shrink-0" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wallet section label */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Wallet cards */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <Card key={i} className="border-border/60 shadow-none">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2.5 w-14" />
                  </div>
                </div>
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order summary card */}
        <Card className="border-border/60 shadow-none overflow-hidden">
          <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
            <Skeleton className="h-3 w-28" />
          </CardHeader>
          <CardContent className="px-5 py-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <div className="pt-1 flex justify-between">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 px-4 pt-3.5 pb-6 z-10">
          <div className="flex justify-between items-center gap-4 mb-2">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-8" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg shrink-0" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full ml-1" />
        </div>

        {/* Progress bar */}
        <Card className="mb-6 border-border/60 shadow-none">
          <CardContent className="px-5 py-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>

        {/* 2-col layout */}
        <div className="flex gap-6 items-start">
          {/* Left col */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Items card */}
            <Card className="border-border/60 shadow-none overflow-hidden">
              <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <div className="divide-y divide-border/50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-28 rounded-md shrink-0" />
                    <Skeleton className="h-4 w-16 shrink-0" />
                    <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Wallets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <Card key={i} className="border-border/60 shadow-none">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-2.5 w-14" />
                        </div>
                      </div>
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right col — order summary */}
          <div className="w-72 shrink-0 space-y-3">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
                <Skeleton className="h-3 w-28" />
              </CardHeader>
              <CardContent className="px-5 py-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                <div className="pt-1 flex justify-between items-center">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
              <div className="px-5 pb-5 pt-4 border-t border-border/50 space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex justify-center">
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}