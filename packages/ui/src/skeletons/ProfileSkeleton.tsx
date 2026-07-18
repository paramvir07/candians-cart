import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/customer/landing/Navbar";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 py-4 lg:py-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 text-muted-foreground"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48 hidden sm:block" />
          </div>
        </div>

        <div className="pb-20 max-w-lg mx-auto lg:max-w-none">
          {/* ── Mobile ── */}
          <div className="flex flex-col gap-4 lg:hidden">
            <ProfileHeroSkeleton />
            <ProfileStatsSkeleton />
            <ProfileContactSkeleton />
            <ProfileStoreSkeleton />
            <QuickActionsSkeleton />
            <Skeleton className="h-14 w-full rounded-3xl" />
          </div>

          {/* ── Desktop ── */}
          <div className="hidden lg:grid grid-cols-[1fr_340px] gap-6 items-start">
            {/* Left col */}
            <div className="flex flex-col gap-4">
              <ProfileHeroSkeleton />
              {/* Ad placeholder */}
              <Skeleton className="h-24 w-full rounded-2xl" />
              <ProfileStoreSkeleton />
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-4">
              <ProfileStatsSkeleton />
              <ProfileContactSkeleton />
              <QuickActionsSkeleton />
              <Skeleton className="h-14 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-skeletons matching each profile section ── */

function ProfileHeroSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function ProfileStatsSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5">
      <Skeleton className="h-3 w-20 mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5 items-center">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileContactSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-3">
      <Skeleton className="h-3 w-28 mb-1" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileStoreSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-3">
      <Skeleton className="h-3 w-24 mb-1" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="px-3 pb-3 flex flex-col gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}