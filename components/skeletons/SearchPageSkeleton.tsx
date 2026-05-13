import React from "react";
import { cn } from "@/lib/utils";

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("rounded-lg bg-muted animate-pulse", className)} style={style} />;
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
      <Bone className="w-full aspect-square rounded-none" />
      <div className="p-3 space-y-2 flex-1">
        <Bone className="h-3 w-3/4" />
        <Bone className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Bone className="h-5 w-14" />
          <Bone className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* SearchNav skeleton */}
      <div className="sticky top-0 z-40 bg-background border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Bone className="h-9 w-9 rounded-xl shrink-0" />
          <Bone className="h-10 flex-1 rounded-full" />
          <Bone className="h-9 w-9 rounded-xl shrink-0" />
          <Bone className="h-9 w-9 rounded-xl shrink-0" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar skeleton */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0">
            <div className="sticky top-18 rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-border/40">
                <Bone className="w-7 h-7 rounded-lg" />
                <Bone className="h-3.5 w-16" />
              </div>
              <div className="px-5 py-4 space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2.5">
                    <Bone className="h-3 w-20" />
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Bone className="h-4 w-4 rounded" />
                        <Bone className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Results column */}
          <div className="flex-1 min-w-0">
            {/* Toolbar row */}
            <div className="flex items-center justify-between mb-5">
              <Bone className="h-4 w-24" />
              <Bone className="h-9 w-28 rounded-xl lg:hidden" />
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}