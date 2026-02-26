"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { FormattedDay } from "@/lib/storeInfoUtils";
import { cn } from "@/lib/utils";

type Props = {
  formattedDays: FormattedDay[];
  todayIndex: number;
  timezone?: string;
};

export default function StoreHoursToggle({
  formattedDays,
  todayIndex,
  timezone,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!formattedDays.length) return null;

  return (
    <div className="border-t border-border/40">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-sm font-medium"
      >
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Store Hours
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Expandable hours grid */}
      {open && (
        <div className="px-4 pb-4 space-y-1 animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
            {formattedDays.map((day, idx) => {
              const isToday = idx === todayIndex;
              return (
                <div
                  key={day.key}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2 text-sm",
                    isToday ? "bg-primary/5 font-medium" : "hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-1.5 w-16 shrink-0">
                    {isToday && (
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                    )}
                    <span
                      className={
                        isToday ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      {day.shortLabel}
                    </span>
                  </div>
                  <div className="text-right space-y-0.5">
                    {day.isClosed ? (
                      <span className="text-muted-foreground/60 text-xs italic">
                        Closed
                      </span>
                    ) : day.isOpen24h ? (
                      <span className="text-emerald-600 text-xs font-medium">
                        Open 24 hours
                      </span>
                    ) : (
                      day.formattedRanges.map((range, ri) => (
                        <p
                          key={ri}
                          className="text-xs text-foreground/80 tabular-nums"
                        >
                          {range}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {timezone && (
            <p className="text-[10px] text-muted-foreground/50 text-center pt-1">
              Times shown in {timezone.replace(/_/g, " ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
