"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { StoreInfoDialog } from "@/components/customer/signup/StoreInfoDialog";
import { StoreDocument } from "@/types/store/store";
import { FormattedDay } from "@/lib/storeInfoUtils";
import { cn } from "@/lib/utils";

type Props = {
  store: StoreDocument;
  formattedDays: FormattedDay[];
  todayIndex: number;
  isOpen: boolean;
  closesAt: string | null;
  opensAt: string | null;
};

export default function StoreProfileClient({
  store,
  isOpen,
  closesAt,
  opensAt,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {/* Hours button — bottom of the store card */}
      <div className="border-t border-border/40 px-4 py-3">
        <button
          onClick={() => setDialogOpen(true)}
          className="w-full group flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 px-4 py-2.5"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium leading-none">Store Hours</p>
              <p
                className={cn(
                  "text-[10px] mt-0.5 font-medium",
                  isOpen ? "text-emerald-600" : "text-rose-500",
                )}
              >
                {isOpen
                  ? closesAt
                    ? `Closes at ${closesAt}`
                    : "Open Now"
                  : opensAt
                    ? `Opens at ${opensAt}`
                    : "Currently Closed"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <span>View all</span>
            <svg
              className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* The existing StoreInfoDialog — pass the full store object */}
      <StoreInfoDialog
        store={store}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
