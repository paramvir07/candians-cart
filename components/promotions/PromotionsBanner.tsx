"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Users, ArrowRight, Sparkles, Clock } from "lucide-react";
import { PromoStats } from "@/types/promotions/promo.types";

interface PromotionBannerProps {
  initialStats: PromoStats;
  href?: string;
  variant?: "banner" | "card";
}

export default function PromotionBanner({
  initialStats,
  href = "/promotions",
  variant = "banner",
}: PromotionBannerProps) {
  const [seconds, setSeconds] = useState(initialStats.secondsRemaining);
  const [minutes, setMinutes] = useState(initialStats.minutesRemaining);
  const [hours, setHours] = useState(initialStats.hoursRemaining);
  const [days, setDays] = useState(initialStats.daysRemaining);

  // Live ticker
  useEffect(() => {
    const deadline = new Date(initialStats.timerDeadline);
    const tick = () => {
      const diff = Math.max(0, deadline.getTime() - Date.now());
      const totalSec = Math.floor(diff / 1000);
      setDays(Math.floor(totalSec / 86400));
      setHours(Math.floor((totalSec % 86400) / 3600));
      setMinutes(Math.floor((totalSec % 3600) / 60));
      setSeconds(totalSec % 60);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [initialStats.timerDeadline]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const timeStr =
    days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // ── Card variant ──────────────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <Link
        href={href}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <div className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg hover:shadow-xl transition-shadow">
          {/* Glow blob */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/30 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {/* Label */}
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              <Sparkles className="w-2.5 h-2.5" />
              Promotion
            </div>

            {/* Prize */}
            <div>
              <p className="text-primary-foreground/70 text-xs font-medium">
                Win a
              </p>
              <p className="text-3xl font-black text-primary-foreground leading-tight tracking-tighter">
                $500
              </p>
              <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wider">
                Grocery Gift Card
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-primary-foreground/70">
                <Users className="w-3 h-3" />
                <span>
                  <span className="text-primary-foreground font-bold">
                    {initialStats.eligibleCount}
                  </span>
                  /{initialStats.targetCount}
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary-foreground/70">
                <Clock className="w-3 h-3" />
                <span className="text-primary-foreground font-bold tabular-nums">
                  {timeStr}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1 text-amber-300 text-xs font-bold group-hover:gap-2 transition-all">
              See details <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Banner variant (default) ───────────────────────────────────────────────
  return (
    <Link
      href={href}
      className="group block w-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative w-full overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-primary/80 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/25 blur-xl" />
        <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

        <div className="relative z-10 flex w-full flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Top content */}
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300 shadow-lg shadow-amber-950/20 sm:h-12 sm:w-12">
              <Gift className="h-5 w-5 text-amber-950 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-black leading-tight tracking-tight text-white sm:text-lg">
                  Win a $500 Grocery Gift Card!
                </span>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-950 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" />
                  Live
                </span>
              </div>

              <p className="mt-1 max-w-[260px] text-xs font-medium leading-snug text-white/75 sm:max-w-none sm:text-sm">
                Complete 1 order to enter · 1 lucky member wins
              </p>
            </div>
          </div>

          {/* Mobile-safe bottom content */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3 lg:shrink-0">
            <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-white/12 px-2.5 py-2.5 text-[11px] text-white/85 backdrop-blur-sm sm:min-w-[112px] sm:px-3 sm:text-xs">
              <Users className="h-3.5 w-3.5 shrink-0 text-amber-200" />
              <span className="truncate">
                <span className="font-black text-white">
                  {initialStats.eligibleCount}
                </span>
                <span className="text-white/65">
                  /{initialStats.targetCount} members
                </span>
              </span>
            </div>

            <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-white/12 px-2.5 py-2.5 text-[11px] text-white/85 backdrop-blur-sm sm:min-w-[120px] sm:px-3 sm:text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-200" />
              <span className="truncate font-black tabular-nums text-white">
                {timeStr}
              </span>
            </div>

            <div className="col-span-2 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-amber-300 px-4 py-2.5 text-xs font-black text-amber-950 shadow-md shadow-amber-950/10 transition-all group-hover:gap-2 hover:bg-amber-200 sm:col-span-1 sm:w-auto sm:min-w-[130px]">
              <span className="sm:hidden">See promo</span>
              <span className="hidden sm:inline">See promotion</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
