"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TABS = [
  { icon: "🛒", label: "Order Online" },
  { icon: "💸", label: "Save 30%" },
  { icon: "🌾", label: "Fresh Produce" },
];

const ORDER_ITEMS = [
  { emoji: "🌾", name: "Sher Atta 20lb",    was: "$18.99", now: "$12.49", save: "34%" },
  { emoji: "🍚", name: "Basmati Rice 10kg", was: "$24.99", now: "$15.99", save: "36%" },
  { emoji: "🧅", name: "Yellow Onions 5lb", was: "$4.49",  now: "$2.79",  save: "38%" },
  { emoji: "🥛", name: "Whole Milk 4L",     was: "$5.49",  now: "$3.29",  save: "40%" },
];

const PRODUCE_ITEMS = [
  { emoji: "🍅", name: "Roma Tomatoes 2lb",  was: "$3.99",  now: "$2.49",  save: "38%" },
  { emoji: "🥦", name: "Broccoli Crown",      was: "$2.99",  now: "$1.79",  save: "40%" },
  { emoji: "🥕", name: "Baby Carrots 1kg",   was: "$3.49",  now: "$1.99",  save: "43%" },
  { emoji: "🌽", name: "Sweet Corn 4-pack",  was: "$4.99",  now: "$2.99",  save: "40%" },
];

const SAVINGS_ITEMS = [
  { emoji: "🌾", name: "Sher Atta 20lb",    was: "$18.99", now: "$12.49", save: "34%", highlight: true },
  { emoji: "🍚", name: "Basmati Rice 10kg", was: "$24.99", now: "$15.99", save: "36%", highlight: true },
  { emoji: "🧅", name: "Yellow Onions 5lb", was: "$4.49",  now: "$2.79",  save: "38%", highlight: true },
  { emoji: "🥛", name: "Whole Milk 4L",     was: "$5.49",  now: "$3.29",  save: "40%", highlight: true },
];

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const mockupRef = useRef<HTMLDivElement>(null);

  // Fix hydration / back-navigation blank screen
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleTabChange = (idx: number) => {
    if (idx === activeTab) return;
    setActiveTab(idx);
    setAnimKey((k) => k + 1);
    // Smooth scroll to mockup on mobile
    setTimeout(() => {
      mockupRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  const fade = (delay: string) => ({
    opacity: mounted && visible ? 1 : 0,
    transform: mounted && visible ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.65s ease ${delay}, transform 0.65s ease ${delay}`,
  });

  const items =
    activeTab === 2 ? PRODUCE_ITEMS : activeTab === 1 ? SAVINGS_ITEMS : ORDER_ITEMS;

  const isSavings = activeTab === 1;
  const isProduce = activeTab === 2;

  const bottomBarLabel = isProduce
    ? "Fresh Produce"
    : "Placing order at";
  const bottomBarSub = isProduce ? "Abbotsford Store" : "Abbotsford Store";
  const bottomBarBtn = isProduce ? "Browse All →" : "Place Order →";

  const savingsBanner = isSavings ? "$47.30 saved" : "$31.40 saved";
  const savingsDesc = isSavings
    ? "Total savings this month · 39% avg off"
    : "On your 4-item cart · 37% avg off";

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">

      {/* ── Diagonal Cross Top-Left Fade Grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
          `,
          backgroundSize: "40px 40px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        * { font-family: 'Sora', 'DM Sans', sans-serif; }

        .tab-pill {
          transition: background 0.22s, color 0.22s, box-shadow 0.22s, border-color 0.22s, transform 0.15s;
          cursor: pointer;
        }
        .tab-pill:active { transform: scale(0.95); }
        .tab-pill.active {
          background: #166534;
          color: #fff;
          box-shadow: 0 4px 14px rgba(22,101,52,0.28);
          border-color: #166534;
        }
        .tab-pill:not(.active):hover { background: rgba(22,101,52,0.07); }

        .tab-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tab-strip::-webkit-scrollbar { display: none; }

        /* Stage layout */
        .stage {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
        }
        .stage-char {
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .stage-char--left  { justify-content: flex-end; }
        .stage-char--right { justify-content: flex-start; }
        .stage-char img {
          display: block;
          width: auto;
          height: clamp(280px, 26vw, 420px);
          max-width: clamp(200px, 20vw, 320px);
          object-fit: contain;
          object-position: bottom center;
        }
        .stage-mockup {
          width: clamp(300px, 38vw, 480px);
          padding: 0 8px 52px;
        }

        @media (max-width: 860px) {
          .stage-char { display: none; }
          .stage {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .stage-mockup {
            width: 100%;
            max-width: 460px;
            padding: 0 16px 40px;
          }
        }

        /* Mockup content fade-slide on tab change */
        @keyframes mockup-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mockup-animate {
          animation: mockup-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Savings highlight pulse */
        @keyframes savings-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
          50%      { box-shadow: 0 0 0 6px rgba(22,163,74,0.18); }
        }
        .savings-highlight {
          animation: savings-pulse 1.8s ease-in-out infinite;
          border: 1.5px solid #bbf7d0 !important;
        }

        /* Grid for cart items */
        .cart-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
      `}</style>

      <section style={{ position: "relative" }}>

        {/* ── HEADLINE ── */}
        <div className="max-w-3xl mx-auto px-5 pt-16 sm:pt-20 pb-6 sm:pb-8 text-center">
          <div
            style={fade("0.05s")}
            className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-full shadow-sm mb-5 sm:mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            Exclusive to Canadian Families · Abbotsford, BC
          </div>

          <h1
            style={{
              ...fade("0.18s"),
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: "1.06",
              color: "#1c1917",
            }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-5"
          >
            Smart Grocery Shopping
            <br />
            <span style={{ color: "#16a34a" }}>for Families</span>
          </h1>

          <p
            style={{
              ...fade("0.32s"),
              color: "#79716b",
              fontSize: "1rem",
              lineHeight: 1.65,
              maxWidth: 520,
              margin: "0 auto 24px",
            }}
            className="sm:text-lg"
          >
            Order online, pick up at our Abbotsford store, and save up to 30% on
            everyday groceries — subsidised exclusively for Canadian families.
          </p>

          <div style={fade("0.44s")} className="flex flex-wrap gap-3 justify-center mb-5">
            <Link href="/customer/signup">
              <button
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-white text-sm sm:text-base transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(180deg,#22c55e 0%,#16a34a 100%)",
                  boxShadow: "0 1px 2px rgba(0,0,0,.1),0 4px 12px rgba(22,101,52,.3)",
                  border: "1px solid rgba(0,0,0,.1)",
                }}
              >
                Sign Up
              </button>
            </Link>
            <Link href="/customer">
              <button className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-green-800 text-sm sm:text-base bg-white border border-green-200 hover:bg-green-50 transition-colors active:scale-95">
                Login
              </button>
            </Link>
          </div>

          <div
            style={fade("0.54s")}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-500"
          >
            <span className="flex items-center gap-1">
              ⭐⭐⭐⭐⭐ <strong className="text-stone-700">4.9</strong> / 5
            </span>
            <span className="w-px h-4 bg-stone-300 hidden sm:block" />
            <span>500+ families in Abbotsford</span>
            <span className="w-px h-4 bg-stone-300 hidden sm:block" />
            <span>🇨🇦 Family-exclusive access</span>
          </div>
        </div>

        {/* ── TAB STRIP ── */}
        <div style={fade("0.6s")} className="max-w-2xl mx-auto px-4 mb-6 sm:mb-8">
          <div className="tab-strip">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => handleTabChange(i)}
                className={`tab-pill flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${
                  i === activeTab
                    ? "active border-green-700"
                    : "border-stone-200 bg-white text-stone-600"
                }`}
              >
                <span>{t.icon}</span>
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── STAGE ── */}
        <div className="stage" style={fade("0.72s")}>

          {/* LEFT character */}
          <div className="stage-char stage-char--left">
            <img
              src="https://ik.imagekit.io/h7w5h0hou/customer-left.png"
              alt="Customer shopping"
            />
          </div>

          {/* MOCKUP */}
          <div className="stage-mockup" ref={mockupRef}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(68,25,6,0.12)",
                boxShadow:
                  "0 1px 2px rgba(68,25,6,0.04),0 4px 12px rgba(68,25,6,0.06),0 28px 56px rgba(68,25,6,0.13)",
              }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-1.5 px-3 py-2.5 border-b border-stone-100"
                style={{ background: "#fafaf9" }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <div className="flex-1 mx-3 bg-white border border-stone-200 rounded-md px-3 py-1 text-xs text-stone-400 text-center truncate">
                  candianscart.ca · {isProduce ? "fresh produce" : "your cart"}
                </div>
              </div>

              {/* Animated content wrapper */}
              <div key={animKey} className="mockup-animate" style={{ background: "#fff" }}>

                {/* Top nav */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      CC
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 leading-none mb-0.5">Shopping at</p>
                      <p className="text-sm font-bold text-stone-800">Abbotsford Store ▾</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm">👤</div>
                </div>

                {/* Savings banner */}
                <div
                  className="mx-3 mt-3 rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{
                    background: isSavings
                      ? "linear-gradient(135deg,#dcfce7,#86efac)"
                      : "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                    border: isSavings ? "1.5px solid #4ade80" : "none",
                    transition: "background 0.4s",
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                      {isSavings ? "💸 Your Total Savings" : isProduce ? "🌾 Fresh This Week" : "This Week's Savings"}
                    </p>
                    <p className="text-2xl font-black text-green-700">
                      {isProduce ? "Just Restocked" : savingsBanner}
                    </p>
                    <p className="text-xs text-green-600">
                      {isProduce ? "Straight from local farms · Abbotsford" : savingsDesc}
                    </p>
                  </div>
                  <div className="text-4xl">{isProduce ? "🥦" : "🎉"}</div>
                </div>

                {/* Items label row */}
                <div className="px-3 mt-3 mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-stone-700">
                    {isProduce ? "Fresh Produce" : isSavings ? "Your Biggest Savings" : "Your Subsidised Cart"}
                  </p>
                  <span className="text-xs text-green-600 font-semibold">
                    {isProduce ? "4 items" : isSavings ? "This month" : "4 items"}
                  </span>
                </div>

                {/* Items grid */}
                <div className="px-3 mb-2">
                  <div className="cart-grid">
                    {items.map((item) => (
                      <div
                        key={item.name}
                        className={`bg-white rounded-xl border border-stone-100 p-3 flex flex-col gap-1.5 ${
                          isSavings ? "savings-highlight" : ""
                        }`}
                        style={{
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          transition: "border 0.3s, box-shadow 0.3s",
                        }}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <p className="text-xs font-semibold text-stone-700 leading-tight">{item.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-stone-400 line-through">{item.was}</span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: isSavings ? "#15803d" : "#16a34a" }}
                          >
                            {item.now}
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold rounded-full px-2 py-0.5 w-fit"
                          style={{
                            background: isSavings ? "#dcfce7" : "#f0fdf4",
                            color: isSavings ? "#15803d" : "#16a34a",
                          }}
                        >
                          Save {item.save}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="mx-3 mb-3 mt-2 rounded-xl px-4 py-3 flex items-center justify-between bg-green-700">
                  <div>
                    <p className="text-xs text-green-200">{bottomBarLabel}</p>
                    <p className="text-sm font-bold text-white">{bottomBarSub}</p>
                  </div>
                  <button className="bg-white text-green-700 font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap hover:bg-green-50 transition-colors">
                    {bottomBarBtn}
                  </button>
                </div>

              </div>{/* end mockup-animate */}
            </div>
          </div>

          {/* RIGHT character */}
          <div className="stage-char stage-char--right">
            <img
              src="https://ik.imagekit.io/h7w5h0hou/customer-right.png"
              alt="Happy customer"
            />
          </div>
        </div>

      </section>
    </div>
  );
}