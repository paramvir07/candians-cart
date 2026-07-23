"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gift,
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  Crown,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { PromoStats } from "@/types/promotions/promo.types";

interface PromotionBannerProps {
  initialStats: PromoStats;
  href?: string;
  variant?: "banner" | "card";
}

export default function PromotionBanner({
  initialStats,
  href = "/promotions#grand-prize-hero",
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

  const isEligible = initialStats.myStatus === "eligible";
  const isNotEligible = initialStats.myStatus === "not_eligible";

  // ── Card variant ──────────────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <Link
        href={href}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
      >
        <div
          className="relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(180,140,40,0.18)] hover:shadow-[0_8px_28px_rgba(180,140,40,0.28)] hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/50"
          style={{
            background:
              "linear-gradient(155deg, #fffaf0 0%, #fdf3dd 45%, #fbeecb 100%)",
          }}
        >
          {/* Subtle gold sparkle texture */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-amber-200/25 blur-xl pointer-events-none" />

          <div className="relative z-10 p-5">
            {/* Label + status */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                <Crown className="w-2.5 h-2.5" />
                Grand Prize
              </div>
              {isEligible && (
                <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full border border-amber-300">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  You're in!
                </div>
              )}
            </div>

            {/* Prize */}
            <div className="mb-3">
              <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider">
                One lucky member wins
              </p>
              <p className="text-4xl font-black leading-tight tracking-tighter bg-gradient-to-b from-amber-500 to-amber-600 bg-clip-text text-transparent">
                $500
              </p>
              <p className="text-stone-700 text-xs font-bold uppercase tracking-wider">
                Grocery Gift Card
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs mb-3">
              <div className="flex items-center gap-1 text-stone-500">
                <Users className="w-3 h-3" />
                <span>
                  <span className="text-stone-800 font-bold">
                    {initialStats.eligibleCount}
                  </span>
                  /{initialStats.targetCount}
                </span>
              </div>
              <div className="flex items-center gap-1 text-stone-500">
                <Clock className="w-3 h-3" />
                <span className="text-stone-800 font-bold tabular-nums">
                  {timeStr}
                </span>
              </div>
            </div>

            {isNotEligible && (
              <p className="text-[11px] text-stone-500 mb-2 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 shrink-0" />
                Place your first order to enter
              </p>
            )}

            {/* CTA */}
            <div className="flex items-center gap-1 text-amber-600 text-xs font-black group-hover:gap-2 transition-all">
              {isEligible ? "See details" : "See how to enter"}{" "}
              <ArrowRight className="w-3 h-3" />
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
      className="group block w-full rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <div
        className="relative w-full overflow-hidden rounded-[1.75rem] border border-amber-300/50 shadow-[0_6px_24px_rgba(180,140,40,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(180,140,40,0.28)]"
        style={{
          background:
            "linear-gradient(155deg, #fffaf0 0%, #fdf3dd 45%, #fbeecb 100%)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-300/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-amber-200/25 blur-2xl pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md ring-2 ring-amber-200">
              <Crown className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black leading-tight tracking-tight text-stone-800 sm:text-lg">
                  Win a $500 Grocery Gift Card!
                </h3>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  Grand Prize
                </span>

                {isEligible && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1 text-[10px] font-black">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    You're in!
                  </span>
                )}
              </div>

              <p className="mt-1 max-w-[280px] text-xs font-semibold leading-snug text-stone-600 sm:max-w-none sm:text-sm">
                {isEligible
                  ? "You're entered — 1 lucky member wins big"
                  : "Place your first order to enter · 1 lucky member wins big"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-white/70 px-3 py-3 text-xs text-stone-600 border border-amber-200/60">
              <Users className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate">
                <span className="font-black text-stone-800">
                  {initialStats.eligibleCount}
                </span>
                <span className="text-stone-500">
                  /{initialStats.targetCount} members
                </span>
              </span>
            </div>

            <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-white/70 px-3 py-3 text-xs text-stone-600 border border-amber-200/60">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate font-black tabular-nums text-stone-800">
                {timeStr}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-xs font-black text-white shadow-md transition-all group-hover:gap-2 hover:from-amber-500 hover:to-amber-600">
            <span>{isEligible ? "See details" : "See the grand prize"}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
