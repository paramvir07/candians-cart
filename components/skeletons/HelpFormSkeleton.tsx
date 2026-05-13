// components/customer/help/HelpFormSkeleton.tsx

import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-muted animate-pulse", className)} />;
}

export default function HelpFormSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] grid">
      <main className="flex flex-col bg-background border-l border-border">

        {/* back button */}
        <div className="px-8 sm:px-12 pt-6">
          <Bone className="h-4 w-12" />
        </div>

        <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-8 sm:px-12 py-12 gap-8">

          {/* header */}
          <div className="space-y-2">
            <Bone className="h-3 w-28" />
            <Bone className="h-9 w-56" />
          </div>

          {/* category grid */}
          <div>
            <Bone className="h-3 w-20 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card"
                >
                  <Bone className="w-8 h-8 rounded-lg shrink-0" />
                  <Bone className="h-3.5 flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* ads banner */}
          <Bone className="h-[90px] w-full rounded-xl" />

          {/* email field */}
          <div className="space-y-2">
            <Bone className="h-3 w-12" />
            <Bone className="h-11 w-full rounded-xl" />
          </div>

          {/* subject field */}
          <div className="space-y-2">
            <Bone className="h-3 w-16" />
            <Bone className="h-11 w-full rounded-xl" />
          </div>

          {/* message field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Bone className="h-3 w-16" />
              <Bone className="h-3 w-12" />
            </div>
            <Bone className="h-36 w-full rounded-xl" />
          </div>

          {/* submit button */}
          <Bone className="h-12 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}