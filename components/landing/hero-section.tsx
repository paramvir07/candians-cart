"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const TABS = [
  { icon: "🛒", label: "Order Online" },
  { icon: "🏪", label: "Store Pickup" },
  { icon: "💸", label: "Save 30%" },
  { icon: "🌾", label: "Fresh Produce" },
  { icon: "🇨🇦", label: "Family Plans" },
];

const MOCK_ITEMS = [
  { emoji: "🌾", name: "Sher Atta 20lb",      was: "$18.99", now: "$12.49", save: "34%" },
  { emoji: "🍚", name: "Basmati Rice 10kg",   was: "$24.99", now: "$15.99", save: "36%" },
  { emoji: "🧅", name: "Yellow Onions 5lb",   was: "$4.49",  now: "$2.79",  save: "38%" },
  { emoji: "🫙", name: "Patak's Curry Paste", was: "$5.49",  now: "$3.29",  save: "40%" },
];

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tabStart, setTabStart] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.65s ease ${delay}, transform 0.65s ease ${delay}`,
  });

  const visibleTabs = TABS.slice(tabStart, tabStart + 4);
  const prevTab = () => setTabStart((s) => Math.max(0, s - 1));
  const nextTab = () => setTabStart((s) => Math.min(TABS.length - 4, s + 1));

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">

      {/* Diagonal Cross Top-Left Fade Grid Background */}
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

      <section
        style={{
          background: "linear-gradient(180deg, #fef5e430 0%, #fef5e415 100%)",
          fontFamily: "'Sora', 'DM Sans', sans-serif",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

          .tab-pill { transition: all 0.2s; cursor: pointer; }
          .tab-pill.active {
            background: #166534;
            color: #fff;
            box-shadow: 0 4px 14px rgba(22,101,52,0.25);
            border-color: #166534;
          }
          .tab-pill:not(.active):hover { background: rgba(22,101,52,0.08); }

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

          .stage {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: end;
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
            padding-bottom: 0;
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
            width: clamp(220px, 22vw, 360px);
            height: auto;
            object-fit: contain;
            object-position: bottom center;
          }

          .stage-mockup {
            width: clamp(300px, 38vw, 500px);
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
              max-width: 480px;
              padding: 0 16px 40px;
            }
          }

          .cart-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
        `}</style>

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
            <Link href={"/customer"}>
            <button
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-white text-sm sm:text-base"
              style={{
                background: "linear-gradient(180deg,#22c55e 0%,#16a34a 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,.1),0 4px 12px rgba(22,101,52,.3)",
                border: "1px solid rgba(0,0,0,.1)",
              }}
            >
              Sign Up
            </button>
            </Link>
            <Link href={"/customer"}>
            <button className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-green-800 text-sm sm:text-base bg-white border border-green-200 hover:bg-green-50 transition-colors">
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
            <button
              onClick={prevTab}
              disabled={tabStart === 0}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 shadow-sm transition-colors text-xs disabled:opacity-30"
            >
              ←
            </button>
            {visibleTabs.map((t, i) => {
              const globalIdx = tabStart + i;
              return (
                <button
                  key={t.label}
                  onClick={() => setActiveTab(globalIdx)}
                  className={`tab-pill flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${
                    globalIdx === activeTab
                      ? "active border-green-700"
                      : "border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
            <button
              onClick={nextTab}
              disabled={tabStart >= TABS.length - 4}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-800 shadow-sm transition-colors text-xs disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        {/* ── STAGE ── */}
        <div className="stage" style={fade("0.72s")}>

          {/* LEFT character */}
          <div className="stage-char stage-char--left">
            <img
              src="https://ik.imagekit.io/h7w5h0hou/customer-left.png"
              alt="https://ik.imagekit.io/h7w5h0hou/customer-right.png"
            />
          </div>

          {/* MOCKUP */}
          <div className="stage-mockup">
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
                  candianscart.ca · Your cart
                </div>
              </div>

              <div style={{ background: "#fff" }}>

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
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm">
                    👤
                  </div>
                </div>

                {/* Savings banner */}
                <div
                  className="mx-3 mt-3 rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)" }}
                >
                  <div>
                    <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">This Week's Savings</p>
                    <p className="text-2xl font-black text-green-700">$31.40 saved</p>
                    <p className="text-xs text-green-600">On your 4-item cart · 37% avg off</p>
                  </div>
                  <div className="text-4xl">🎉</div>
                </div>

                {/* Items grid */}
                <div className="px-3 mt-3 mb-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-bold text-stone-700">Your Subsidised Cart</p>
                    <span className="text-xs text-green-600 font-semibold">4 items</span>
                  </div>
                  <div className="cart-grid">
                    {MOCK_ITEMS.map((item) => (
                      <div
                        key={item.name}
                        className="bg-white rounded-xl border border-stone-100 p-3 flex flex-col gap-1.5"
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <p className="text-xs font-semibold text-stone-700 leading-tight">{item.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-stone-400 line-through">{item.was}</span>
                          <span className="text-sm font-bold text-green-700">{item.now}</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 font-bold rounded-full px-2 py-0.5 w-fit">
                          Save {item.save}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="mx-3 mb-3 mt-2 rounded-xl px-4 py-3 flex items-center justify-between bg-green-700">
                  <div>
                    <p className="text-xs text-green-200">Pickup ready in</p>
                    <p className="text-sm font-bold text-white">~2 hours · Abbotsford</p>
                  </div>
                  <button className="bg-white text-green-700 font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap">
                    Schedule Pickup →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT character */}
          <div className="stage-char stage-char--right">
            <img
              src="https://media.discordapp.net/attachments/1265793460825227377/1488677059143274618/bbb.png?ex=69cda60d&is=69cc548d&hm=1ef689b262206f3f768b66e91ee079d2f640b84b08f347e15f529b688cd01a38&=&format=webp&quality=lossless"
              alt="Happy customer"
            />
          </div>
        </div>
      </section>
    </div>
  );
}