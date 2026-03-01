// components/customer/landing/HeroBanner.tsx
// Server component — no "use client" needed

import Link from "next/link";
import { Leaf, Zap, ShieldCheck } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 overflow-hidden">
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-400/30 blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-muted- text-xs font-bold px-4 py-1.5 rounded-full border border-white/30">
              <Leaf className="h-3.5 w-3.5" />
              Fresh · Local · Delivered
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-primary leading-[1.05] tracking-tight">
              Fresh groceries
              <br />
              <span className="text-green-200">at your door.</span>
            </h1>

            <p className="text-green-100 text-lg leading-relaxed max-w-md">
              From farm-fresh produce to pantry essentials — everything you
              need, delivered fast.
            </p>

            {/* Search bar — links to /customer/search */}
            <Link
              href="/customer/search"
              className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-2xl shadow-green-900/30 hover:shadow-green-900/40 transition-shadow max-w-md group"
            >
              <svg
                className="h-5 w-5 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path
                  d="m21 21-4.35-4.35"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-slate-400 text-[15px] group-hover:text-slate-600 transition-colors flex-1">
                Search bananas, milk, bread…
              </span>
              <span className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-xl shrink-0">
                Search
              </span>
            </Link>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                {
                  icon: <Zap className="h-3.5 w-3.5" />,
                  label: "Quick delivery",
                },
                {
                  icon: <ShieldCheck className="h-3.5 w-3.5" />,
                  label: "Quality guaranteed",
                },
                { icon: <Leaf className="h-3.5 w-3.5" />, label: "Farm fresh" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-green-100 text-xs font-semibold bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20"
                >
                  {icon}
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: decorative category tiles (desktop only) */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              {
                emoji: "🥭",
                label: "Fruits",
                color: "bg-amber-50  border-amber-100",
              },
              {
                emoji: "🥦",
                label: "Vegetables",
                color: "bg-green-50  border-green-100",
              },
              {
                emoji: "🥛",
                label: "Dairy",
                color: "bg-yellow-50 border-yellow-100",
              },
              {
                emoji: "🍗",
                label: "Meat",
                color: "bg-red-50    border-red-100",
              },
              {
                emoji: "☕",
                label: "Beverages",
                color: "bg-orange-50 border-orange-100",
              },
              {
                emoji: "🥟",
                label: "Snacks",
                color: "bg-purple-50 border-purple-100",
              },
            ].map(({ emoji, label, color }, i) => (
              <div
                key={label}
                style={{ animationDelay: `${i * 80}ms` }}
                className={`${color} border rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-bold text-slate-600">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
