"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users,
  Clock,
  Star,
  CheckCircle2,
  ShoppingCart,
  Trophy,
  Sparkles,
  Crown,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PromoStats } from "@/types/promotions/promo.types";

// ─── Countdown tile ────────────────────────────────────────────────────────────

function CountdownTile({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shadow-md border-2 border-amber-300">
          <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight leading-none bg-gradient-to-b from-amber-500 to-amber-600 bg-clip-text text-transparent">
            {display}
          </span>
        </div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-amber-200 pointer-events-none" />
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest mt-1.5">
        {label}
      </span>
    </div>
  );
}

// ─── Confetti / spark field ────────────────────────────────────────────────────

function ConfettiDots() {
  const dots = [
    {
      top: "8%",
      left: "5%",
      size: 7,
      color: "bg-amber-400",
      delay: "0s",
      dur: "3s",
    },
    {
      top: "12%",
      left: "88%",
      size: 5,
      color: "bg-amber-300",
      delay: "0.5s",
      dur: "2.5s",
    },
    {
      top: "25%",
      left: "92%",
      size: 8,
      color: "bg-amber-500",
      delay: "1s",
      dur: "3.5s",
    },
    {
      top: "70%",
      left: "3%",
      size: 6,
      color: "bg-amber-300",
      delay: "0.3s",
      dur: "4s",
    },
    {
      top: "80%",
      left: "90%",
      size: 7,
      color: "bg-amber-400",
      delay: "1.5s",
      dur: "3s",
    },
    {
      top: "45%",
      left: "96%",
      size: 4,
      color: "bg-amber-300",
      delay: "0.8s",
      dur: "2.8s",
    },
    {
      top: "55%",
      left: "1%",
      size: 6,
      color: "bg-amber-400/70",
      delay: "1.2s",
      dur: "3.2s",
    },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${d.color} pointer-events-none`}
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            animation: `bounce ${d.dur} ${d.delay} infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          to   { transform: translateY(-12px) rotate(20deg); opacity: 1; }
        }
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-6px) rotate(3deg); }
        }
      `}</style>
    </>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({
  pct,
  count,
  target,
}: {
  pct: number;
  count: number;
  target: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-stone-700 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-600" />
          Eligible members
        </span>
        <span className="tabular-nums font-bold">
          <span className="text-amber-600">{count}</span>
          <span className="text-stone-400"> / {target}</span>
        </span>
      </div>
      <div className="h-3 bg-amber-100/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, oklch(0.75 0.16 75) 0%, oklch(0.82 0.16 85) 100%)",
          }}
        />
      </div>
      <p className="text-xs text-stone-500">
        {target - count > 0
          ? `${target - count} more member${target - count !== 1 ? "s" : ""} needed to unlock the draw`
          : "🎉 Member target reached!"}
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface PromotionPageProps {
  initialStats: PromoStats;
}

export default function PromotionPage({ initialStats }: PromotionPageProps) {
  const [stats, setStats] = useState(initialStats);
  const [timeLeft, setTimeLeft] = useState({
    days: initialStats.daysRemaining,
    hours: initialStats.hoursRemaining,
    minutes: initialStats.minutesRemaining,
    seconds: initialStats.secondsRemaining,
  });
  const deadlineRef = useRef(new Date(initialStats.timerDeadline));

  // Live countdown tick
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diffMs = Math.max(0, deadlineRef.current.getTime() - now.getTime());
      const totalSec = Math.floor(diffMs / 1000);
      setTimeLeft({
        days: Math.floor(totalSec / 86400),
        hours: Math.floor((totalSec % 86400) / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const rules = [
    {
      icon: ShoppingCart,
      text: "Place your first order and unlock your subsidy during the promotion period",
    },
    { icon: Users, text: "Be a registered member of Candian's Cart" },
    {
      icon: CheckCircle2,
      text: "Draw happens once 200+ eligible members AND 15 days have passed",
    },
    {
      icon: Trophy,
      text: "One lucky eligible member wins the $500 grocery gift card",
    },
    {
      icon: Clock,
      text: "If either condition isn't met at 15 days, the timer extends until both are met",
    },
  ];

  return (
    <div id="grand-prize-draw" className="min-h-screen bg-background">
      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section
        id="grand-prize-hero"
        className="relative overflow-hidden pt-14 pb-24 sm:py-24 px-4"
        style={{
          background:
            "linear-gradient(160deg, #fffaf0 0%, #fdf3dd 50%, #fbeecb 100%)",
        }}
      >
        <ConfettiDots />

        {/* Left customer illustration */}
        <img
          src="https://ik.imagekit.io/h7w5h0hou/customer-left.png"
          alt="Customer holding groceries"
          className="
    absolute left-[-26px] bottom-[-4px]
    w-[76px]
    sm:left-[-12px] sm:w-[105px]
    md:left-2 md:w-[140px]
    lg:left-4 lg:w-[220px]
    xl:left-16 xl:w-[300px]
    z-10 pointer-events-none select-none drop-shadow-2xl
  "
        />

        {/* Right customer illustration */}
        <img
          src="https://ik.imagekit.io/h7w5h0hou/customer-right.png"
          alt="Customer shopping online"
          className="
    absolute right-[-30px] bottom-[-4px]
    w-[86px]
    sm:right-[-12px] sm:w-[115px]
    md:right-2 md:w-[150px]
    lg:right-4 lg:w-[260px]
    xl:right-16 xl:w-[340px]
    z-10 pointer-events-none select-none drop-shadow-2xl
  "
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, rgba(217,160,60,0.15) 1px, transparent 1px), radial-gradient(circle at 75% 50%, rgba(217,160,60,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-300/25 blur-[100px] pointer-events-none" />

        <div className="relative z-20 max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Bonus Launch Promotion
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <div
              className="text-5xl sm:text-6xl mx-auto w-fit"
              style={{ animation: "crownFloat 3.5s ease-in-out infinite" }}
            >
              <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-amber-500 mx-auto drop-shadow-[0_2px_8px_rgba(217,160,60,0.4)]" />
            </div>
            <p className="text-amber-700/80 text-lg sm:text-xl font-bold tracking-wide uppercase">
              One lucky member will
            </p>
            <h1 className="text-6xl sm:text-8xl font-black text-stone-800 leading-none tracking-tighter">
              WIN
            </h1>
          </div>

          {/* Prize card — ticket stub style */}
          <div className="relative inline-block">
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "rgba(217,160,60,0.25)",
                filter: "blur(24px)",
              }}
            />
            <div className="relative bg-white text-stone-800 rounded-3xl px-8 py-5 shadow-xl border-2 border-amber-300">
              <p className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-b from-amber-500 to-amber-600 bg-clip-text text-transparent">
                $500
              </p>
              <p className="text-base sm:text-lg font-black uppercase tracking-widest mt-1 text-stone-700">
                Grocery Gift Card
              </p>
            </div>
          </div>

          {/* Sub */}
          <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Shop with us, earn your entry, and be in the draw for a $500 grocery
            gift card — exclusively for Candian's Cart members.
          </p>

          {/* ── Eligibility status — front and center ──────────────────── */}
          {stats.myStatus === "eligible" ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-[0_8px_28px_rgba(180,140,40,0.18)] max-w-md mx-auto">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-amber-100/30 blur-xl pointer-events-none" />
              <div className="relative z-10 p-5 sm:p-6 flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🍀</span>
                </div>
                <div>
                  <p className="font-black text-amber-700 text-lg leading-tight">
                    You're in the draw — good luck! 🎉
                  </p>
                  <p className="text-sm text-stone-600 mt-0.5 leading-snug">
                    You've unlocked your subsidy, so you're automatically
                    entered for the <span className="font-bold">$500</span>{" "}
                    grocery gift card.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-[0_8px_28px_rgba(180,140,40,0.15)] max-w-md mx-auto">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
              <div className="relative z-10 p-5 sm:p-6 flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-stone-800 text-base leading-tight">
                    You're not in the draw yet
                  </p>
                  <p className="text-sm text-stone-500 mt-0.5 leading-snug">
                    Place your first order and unlock your subsidy to enter — no
                    extra steps.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Countdown + progress ─────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-gradient-to-b from-amber-50/40 to-transparent border-b border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Draw status badge */}
          {stats.isReadyToDraw ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 border border-green-200 text-sm font-bold px-5 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                Both conditions met — draw is happening soon!
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-bold text-amber-700/80 uppercase tracking-widest mb-1">
                {stats.daysRemaining === 0 && stats.hoursRemaining === 0
                  ? "Extended — waiting for members"
                  : "Draw countdown"}
              </p>
              <p className="text-sm text-muted-foreground">
                Timer extends if 200 members aren't reached by the deadline
              </p>
            </div>
          )}

          {/* Countdown tiles */}
          <div className="flex items-start justify-center gap-3 sm:gap-4">
            <CountdownTile value={timeLeft.days} label="Days" />
            <div className="text-3xl font-black text-amber-500 mt-4 sm:mt-5">
              :
            </div>
            <CountdownTile value={timeLeft.hours} label="Hours" />
            <div className="text-3xl font-black text-amber-500 mt-4 sm:mt-5">
              :
            </div>
            <CountdownTile value={timeLeft.minutes} label="Minutes" />
            <div className="text-3xl font-black text-amber-500 mt-4 sm:mt-5">
              :
            </div>
            <CountdownTile value={timeLeft.seconds} label="Seconds" />
          </div>

          {/* Progress */}
          <ProgressBar
            pct={stats.progressPct}
            count={stats.eligibleCount}
            target={stats.targetCount}
          />
        </div>
      </section>

      {/* ── Not eligible: how to get in ───────────────────────────────────── */}
      {stats.myStatus !== "eligible" && (
        <section className="py-8 px-4 bg-muted/20 border-b border-border">
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="font-black text-foreground text-base">
                    You're not in the draw yet
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Place your first order and unlock your subsidy to be
                    automatically entered — no extra steps needed.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 transition-colors shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Start shopping
                    </a>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Sunfarm+Produce+Abbotsford"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Visit Sunfarm Produce, Abbotsford
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-0.5">
                    You can also drop by our Sunfarm Produce store in Abbotsford
                    — our team can help you place your first order and unlock
                    your subsidy in person.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Simple conditions, one big winner
            </p>
          </div>

          {/* Both conditions card */}
          <Card className="overflow-hidden border-amber-300/50">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 border-b border-amber-300/30">
              <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-white" />
                Two conditions must BOTH be met before the draw
              </p>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="px-5 py-4 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    Condition 1
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-snug pl-9">
                  At least{" "}
                  <span className="font-bold text-foreground">15 days</span>{" "}
                  must pass since the promotion started
                </p>
              </div>
              <div className="px-5 py-4 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    Condition 2
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-snug pl-9">
                  At least{" "}
                  <span className="font-bold text-foreground">200 members</span>{" "}
                  must each place their{" "}
                  <span className="font-bold text-foreground">first order</span>{" "}
                  and unlock their subsidy
                </p>
              </div>
            </div>
          </Card>

          {/* Rules list */}
          <div className="space-y-2">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <rule.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {rule.text}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Fine print */}
          <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Terms
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The draw is conducted by Candian's Cart. The winner is selected
              randomly from all eligible members (those who have placed their
              first order and unlocked their subsidy). The $500 prize is issued
              as a grocery gift card redeemable on Candian's Cart. Employees and
              their immediate family members are not eligible. The promotion may
              be extended or modified at the discretion of Candian's Cart
              management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
