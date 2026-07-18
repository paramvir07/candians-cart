"use client";

import { Gift, ArrowRight, Sparkles, Check, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";

const SUBSIDY_RATE = 0.21;

interface ComboItem {
  name: string;
  price: number;
}

interface Package {
  id: number;
  name: string;
  maxPrice: number;
  description: string;
  combo: ComboItem[];
}

const packages: Package[] = [
  {
    id: 1,
    name: "Budget Pack 1",
    maxPrice: 21,
    description: "Buy $21 of groceries, get $4.41 in free gift subsidy to use on subsidized items.",
    combo: [
      { name: "Potatoes 5 lb", price: 3.49 },
      { name: "Yogurt 750g", price: 3.79 },
      { name: "Chili 1 lb", price: 1.99 },
      { name: "Milk 1 gallon", price: 5.99 },
      { name: "Eggs 6pk", price: 5.74 },
    ],
  },
  {
    id: 2,
    name: "Budget Pack 2",
    maxPrice: 34,
    description: "Buy $34 of groceries, get $7.14 in free gift subsidy — more you spend, more you save.",
    combo: [
      { name: "Flour 10 lb", price: 9.99 },
      { name: "Potatoes 5 lb", price: 4.99 },
      { name: "Chili 1 lb", price: 1.99 },
      { name: "Cauliflower", price: 3.49 },
      { name: "Milk 1 gallon", price: 5.99 },
      { name: "Yogurt 750g", price: 3.79 },
      { name: "Onion 3 lb", price: 3.76 },
    ],
  },
  {
    id: 3,
    name: "Budget Pack 3",
    maxPrice: 55,
    description: "Buy $55 of groceries, get $11.55 free — great for families stocking up for the week.",
    combo: [
      { name: "Flour 10 lb", price: 9.99 },
      { name: "Potatoes 10 lb", price: 4.99 },
      { name: "Milk 1 gallon", price: 5.99 },
      { name: "Yogurt 750g", price: 3.79 },
      { name: "Eggs 12pk", price: 4.49 },
      { name: "Chili 1 lb", price: 1.99 },
      { name: "Onion 10 lb", price: 5.49 },
      { name: "Paneer 400g", price: 5.49 },
      { name: "Basmati Rice 4lb", price: 5.49 },
      { name: "Tomatoes 3 lb", price: 7.29 },
    ],
  },
];

function PackCard({
  pkg,
  index,
  isLocked,
  isLoggedIn,
}: {
  pkg: Package;
  index: number;
  isLocked: boolean;
  isLoggedIn: boolean;
}) {
  const packTotal = pkg.combo.reduce((s: number, i: ComboItem) => s + i.price, 0);
  const subsidy = +(packTotal * SUBSIDY_RATE).toFixed(2);
  const visibleItems = pkg.combo.slice(0, 4);
  const hiddenCount = pkg.combo.length - 4;

  return (
    <div className={`pack-card pack-card--delay-${index} flex flex-col overflow-hidden bg-white rounded-[20px] border border-[rgba(22,101,52,0.10)]`}>
      {/* top accent */}
      <div className="h-0.75 w-full shrink-0 bg-linear-to-r from-green-100 to-green-200" />

      {/* body */}
      <div className="px-6 pt-6 flex flex-col gap-4">
        {/* name + price */}
        <div className="flex items-center justify-between">
          <span
            className="text-[16px] font-extrabold text-[#1c1917] tracking-tight leading-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {pkg.name}
          </span>
          <span
            className="text-[24px] font-extrabold text-green-600 leading-none tracking-tight shrink-0 ml-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ${pkg.maxPrice}
          </span>
        </div>

        {/* description */}
        <p
          className="text-[13.5px] text-[#78716c] leading-relaxed m-0"
          style={{ fontFamily: "'DM Sans', sans-serif", minHeight: 48 }}
        >
          {pkg.description}
        </p>

        {/* subsidy pill */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-[10px] px-3.5 py-2">
          <Gift size={13} className="text-green-600 shrink-0" />
          <span
            className="text-[13.5px] font-extrabold text-green-600 whitespace-nowrap"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            +${subsidy} gift subsidy
          </span>
          <span
            className="text-[11px] text-slate-400 hidden sm:inline"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            — at checkout
          </span>
        </div>

        {/* item list */}
        <div className="rounded-[10px] overflow-hidden border border-[rgba(22,101,52,0.08)]">
          {visibleItems.map((item: ComboItem, i: number) => (
            <div
              key={i}
              className={[
                "flex justify-between items-center px-3.5 py-2.5",
                i % 2 === 0 ? "bg-[#fafaf9]" : "bg-white",
                i < visibleItems.length - 1 ? "border-b border-[rgba(22,101,52,0.06)]" : "",
              ].join(" ")}
            >
              <span
                className="text-[13px] text-[#374151] truncate mr-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.name}
              </span>
              <span
                className="text-[13px] text-green-600 font-semibold shrink-0"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ${item.price.toFixed(2)}
              </span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <div
              className="text-center text-[12px] text-[#a8a29e] py-2.5 bg-[#fafaf9] border-t border-[rgba(22,101,52,0.06)]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              + {hiddenCount} more items
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* footer */}
      <div className="px-6 pt-4 pb-6 border-t border-[rgba(22,101,52,0.08)] mt-5 flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="text-[13px] text-[#a8a29e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            You spend
          </span>
          <span className="text-[13px] text-[#57534e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            ${pkg.maxPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-[13px] text-[#a8a29e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Gift subsidy back
          </span>
          <span className="text-[13px] text-green-600 font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            +${subsidy}
          </span>
        </div>

        {isLoggedIn ? (
          <Link href="/customer/budget-packs" className="no-underline block">
            <button
              className="pack-cta-green w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border-none bg-linear-to-br from-green-400 to-green-600 text-white text-[13.5px] font-bold cursor-pointer"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <Gift size={14} />
              View this budget pack
              <ArrowRight size={13} />
            </button>
          </Link>
        ) : !isLocked ? (
          <Link href="/customer/signup" className="no-underline block">
            <button
              className="pack-cta-green w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border-none bg-linear-to-br from-green-400 to-green-600 text-white text-[13.5px] font-bold cursor-pointer"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <Gift size={14} />
              Get ${subsidy} free — Sign up
              <ArrowRight size={13} />
            </button>
          </Link>
        ) : (
          <Link href="/customer/signup" className="no-underline block">
            <button
              className="pack-cta-lock w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-green-200 bg-green-50 text-green-700 text-[13.5px] font-bold cursor-pointer"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <Lock size={13} />
              Sign up to unlock all 6 packs
              <ChevronRight size={13} />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PacksSection({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        /* ── dot grid ── */
        .packs-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #16a34a14 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── card entrance ── */
        .pack-card {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
          animation: packFadeUp 0.46s cubic-bezier(0.34,1.2,0.64,1) forwards;
          box-shadow: 0 2px 8px rgba(22,101,52,0.04), 0 8px 28px rgba(22,101,52,0.07);
          transition: box-shadow 0.22s ease, transform 0.22s ease;
        }
        .pack-card--delay-0 { animation-delay: 0ms; }
        .pack-card--delay-1 { animation-delay: 80ms; }
        .pack-card--delay-2 { animation-delay: 160ms; }

        @keyframes packFadeUp {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .pack-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(22,101,52,0.09), 0 16px 44px rgba(22,101,52,0.12);
        }

        /* ── green CTA ── */
        .pack-cta-green {
          box-shadow: 0 3px 12px rgba(22,163,74,0.28);
          transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.2s ease;
        }
        .pack-cta-green:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(22,163,74,0.4);
        }
        .pack-cta-green:active { transform: translateY(0); }

        /* ── lock CTA ── */
        .pack-cta-lock {
          transition: border-color 0.16s ease, color 0.16s ease, background 0.16s ease;
        }
        .pack-cta-lock:hover {
          border-color: #86efac;
          color: #15803d;
          background: #dcfce7;
        }

        /* ── card grid ── */
        .packs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 639px) {
          .packs-grid {
            display: flex;
            flex-direction: row;
            gap: 14px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .packs-grid::-webkit-scrollbar { display: none; }
          .packs-grid .pack-card {
            flex: 0 0 78vw;
            max-width: 300px;
            scroll-snap-align: start;
          }
        }

        /* ── bottom CTA ── */
        .bottom-cta {
          box-shadow: 0 4px 16px rgba(22,163,74,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bottom-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22,163,74,0.42);
        }
        .bottom-cta:active { transform: translateY(0); }
      `}</style>

      <section
        className="packs-section relative overflow-hidden"
        style={{
          padding: "clamp(48px, 8vw, 96px) 0",
          background: "#fef5e4",
          fontFamily: "'Sora', 'DM Sans', sans-serif",
        }}
      >
        <div className="relative z-10 w-full max-w-[1024px] mx-auto box-border" style={{ padding: "0 clamp(16px, 5vw, 48px)" }}>

          {/* ── header ── */}
          <div className="text-center mb-10 sm:mb-14">
            <div id="grocery-packs" className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3.5 py-1 mb-4">
              <Sparkles size={11} className="text-green-600" />
              <span
                className="text-[11px] font-bold text-green-700 uppercase tracking-widest"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                App-exclusive savings
              </span>
            </div>

            <h2
              className="font-extrabold text-[#1c1917] tracking-tight leading-[1.12]"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(1.75rem, 4.5vw, 2.9rem)",
                letterSpacing: "-0.5px",
                margin: "0 0 14px",
              }}
            >
              Groceries that cost up to{" "}
              <span className="text-green-600">30% less.</span> Guaranteed.
            </h2>

            <p
              className="text-[#78716c] max-w-[460px] mx-auto leading-[1.7]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                margin: "0 auto 20px",
              }}
            >
              Pick a budget pack, spend at the store, and get gift subsidy straight
              into your wallet. Use it to pay for essentials — free.
            </p>

            {/* trust pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {["No vouchers", "Instant at checkout", "Gift Wallet savings", "All 6 packs on signup"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#57534e] bg-white border border-[rgba(22,101,52,0.12)] rounded-full px-3 py-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Check size={9} className="text-green-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── single card grid — 3 cols on desktop, horizontal scroll on mobile ── */}
          <div className="packs-grid">
            {packages.map((pkg, i) => (
              <PackCard key={pkg.id} pkg={pkg} index={i} isLocked={false} isLoggedIn={isLoggedIn} />
            ))}
          </div>

          {/* ── bottom CTA ── */}
          <div className="mt-10 sm:mt-12 flex flex-col items-center gap-3">
            {isLoggedIn ? (
              <Link href="/customer/budget-packs" className="no-underline">
                <button
                  className="bottom-cta inline-flex items-center gap-2 bg-green-600 text-white font-bold border-none cursor-pointer rounded-[10px] px-6 sm:px-8 py-3 sm:py-3.5"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "clamp(0.8rem, 2vw, 0.88rem)",
                  }}
                >
                  <Gift size={15} />
                  View all 6 packs
                  <ArrowRight size={14} />
                </button>
              </Link>
            ) : (
              <Link href="/customer/signup" className="no-underline">
                <button
                  className="bottom-cta inline-flex items-center gap-2 bg-green-600 text-white font-bold border-none cursor-pointer rounded-[10px] px-6 sm:px-8 py-3 sm:py-3.5"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "clamp(0.8rem, 2vw, 0.88rem)",
                  }}
                >
                  <Gift size={15} />
                  Sign up to unlock all 6 packs
                  <ArrowRight size={14} />
                </button>
              </Link>
            )}
            {!isLoggedIn && (
              <p
                className="text-[12px] text-[#a8a29e]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Free to join · No credit card required
              </p>
            )}
          </div>

        </div>
      </section>
    </>
  );
}