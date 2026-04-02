"use client"
import { useState } from 'react'
import { ShoppingBag, Wallet, Store, ArrowRight, Sparkles, Calculator } from 'lucide-react'

export default function FeaturesSection() {
  const storeItems = [
    { emoji: "🌾", name: "Sher Atta 20lb",    price: "$12.49", was: "$18.99", tag: true  },
    { emoji: "🍚", name: "Basmati Rice 10kg", price: "$15.99", was: "$24.99", tag: true  },
    { emoji: "🫘", name: "Chana Dal 4lb",     price: "$4.99",  was: "$7.99",  tag: true  },
    { emoji: "🥛", name: "Whole Milk 4L",     price: "$4.29",  was: "$6.49",  tag: false },
  ]

  const [spend, setSpend] = useState(100)

  const subsidised = spend * 0.40
  const savings = subsidised * 0.60
  const annual = savings * 12

  const fmt = (n: number) => '$' + n.toFixed(2)
  const fmtInt = (n: number) => '$' + Math.round(n).toLocaleString()

  const handleInput = (val: string) => {
    const v = Math.max(0, Math.min(5000, parseFloat(val) || 0))
    setSpend(v)
  }

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #fff 0%, #fef5e4 60%, #fef5e4 100%)",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .feat-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #16a34a18 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .feat-card {
          background: #fff;
          border: 1px solid rgba(22,101,52,0.10);
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(22,101,52,0.04), 0 8px 32px rgba(22,101,52,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
          position: relative;
        }
        .feat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(22,101,52,0.08), 0 16px 48px rgba(22,101,52,0.10);
        }

        .stat-blob {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, #bbf7d0 0%, #dcfce700 70%);
          top: -40px;
          right: -40px;
          pointer-events: none;
        }

        .icon-ring {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          border: 1px solid #86efac;
          flex-shrink: 0;
        }

        .chart-path {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawLine 2s ease forwards 0.4s;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }

        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(22,163,74,0); }
        }
        .savings-badge { animation: softPulse 2.5s ease-in-out infinite; }

        .store-row {
          transition: background 0.15s ease, transform 0.15s ease;
          border-radius: 10px;
        }
        .store-row:hover {
          background: #f0fdf4;
          transform: translateX(3px);
        }

        .bento {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto auto auto;
          gap: 16px;
        }

        .card-stat   { grid-column: 1 / 2; grid-row: 1 / 2; }
        .card-wallet { grid-column: 2 / 3; grid-row: 1 / 2; }
        .card-chart  { grid-column: 3 / 4; grid-row: 1 / 2; }
        .card-store  { grid-column: 1 / 3; grid-row: 2 / 3; }
        .card-family { grid-column: 3 / 4; grid-row: 2 / 3; }
        .card-calc   { grid-column: 1 / 4; grid-row: 3 / 4; }

        @media (max-width: 900px) {
          .bento {
            grid-template-columns: 1fr 1fr;
          }
          .card-stat   { grid-column: 1 / 2; grid-row: auto; }
          .card-wallet { grid-column: 2 / 3; grid-row: auto; }
          .card-chart  { grid-column: 1 / 3; grid-row: auto; }
          .card-store  { grid-column: 1 / 3; grid-row: auto; }
          .card-family { grid-column: 1 / 3; grid-row: auto; }
          .card-calc   { grid-column: 1 / 3; grid-row: auto; }
        }

        @media (max-width: 560px) {
          .bento { grid-template-columns: 1fr; }
          .card-stat, .card-wallet, .card-chart,
          .card-store, .card-family, .card-calc { grid-column: 1 / 2; }
        }

        .section-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 99px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        /* ── Calculator styles ── */
        .calc-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px 10px 32px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          color: #1c1917;
          background: #f9fafb;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
          -moz-appearance: textfield;
        }
        .calc-input::-webkit-outer-spin-button,
        .calc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .calc-input:focus { border-color: #16a34a; background: #fff; }

        .calc-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 99px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
        }
        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #16a34a;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #86efac;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .calc-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 4px #bbf7d0;
        }
        .calc-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #16a34a;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #86efac;
          cursor: pointer;
        }

        .calc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px solid rgba(22,101,52,0.08);
        }
        .calc-row:last-child { border-bottom: none; }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .savings-num {
          animation: countUp 0.25s ease;
        }
      `}</style>

      <div className="feat-section relative max-w-5xl mx-auto px-5 sm:px-6">

        {/* Section header */}
        <div className="text-center mb-12">
          <div className="section-pill">
            <Sparkles size={13} />
            Why families choose us
          </div>
          <h2
            style={{
              fontWeight: 800,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              color: "#1c1917",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
            className="mb-4"
          >
            Everything your family needs,{" "}
            <span style={{ color: "#16a34a" }}>for less</span>
          </h2>
          <p style={{ color: "#78716c", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }} className="text-sm sm:text-base">
            From subsidised staples to real-time savings tracking — built exclusively for Canadian families in Abbotsford.
          </p>
        </div>

        {/* Bento grid */}
        <div className="bento">

          {/* ── Card 1: 30% Savings stat ── */}
          <div className="feat-card card-stat p-7 flex flex-col justify-between min-h-[220px]">
            <div className="stat-blob" />
            <div
              className="savings-badge w-fit rounded-2xl px-5 py-3 text-center"
              style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", border: "1px solid #86efac" }}
            >
              <p style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: "#15803d" }}>30%</p>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#166534", letterSpacing: "0.06em", textTransform: "uppercase" }}>avg saved</p>
            </div>
            <div className="mt-5">
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1c1917" }}>Average Savings</h3>
              <p style={{ fontSize: "0.82rem", color: "#78716c", lineHeight: 1.6, marginTop: 4 }}>
                Families save on average 30% on subsidised pricing every month.
              </p>
            </div>
          </div>

          {/* ── Card 2: Gift Wallet ── */}
          <div className="feat-card card-wallet p-7 flex flex-col justify-between min-h-[220px]">
            <div className="icon-ring">
              <Wallet size={22} color="#16a34a" strokeWidth={1.5} />
            </div>
            <div className="mt-5">
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1c1917" }}>Gift Wallet Rewards</h3>
              <p style={{ fontSize: "0.82rem", color: "#78716c", lineHeight: 1.6, marginTop: 4 }}>
                Earn gift credits on every order. Your wallet grows with every shop — spend it on anything in store.
              </p>
              <div className="mt-4 flex items-center gap-2" style={{ color: "#16a34a", fontSize: "0.8rem", fontWeight: 600 }}>
                Learn more <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* ── Card 3: Subsidy chart ── */}
          <div className="feat-card card-chart p-7 flex flex-col justify-between min-h-[220px]">
            <div>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 12px 4px" }}
              >
                <svg viewBox="0 0 260 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
                  {[20, 40, 60].map(y => (
                    <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#d1fae5" strokeWidth="1" />
                  ))}
                  <path
                    d="M0 65 C30 58, 55 50, 80 44 S120 30, 150 26 S200 18, 230 14 L260 10 L260 80 L0 80Z"
                    fill="url(#chartGrad)"
                    opacity="0.5"
                  />
                  <path
                    className="chart-path"
                    d="M0 65 C30 58, 55 50, 80 44 S120 30, 150 26 S200 18, 230 14 L260 10"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {[[0,65],[80,44],[150,26],[260,10]].map(([x,y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#16a34a" />
                  ))}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-between px-1 pb-1" style={{ fontSize: "0.65rem", color: "#86efac", fontWeight: 600 }}>
                  <span>Jan</span><span>Mar</span><span>Jun</span><span>Now</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1c1917" }}>Subsidy tracked live</h3>
              <p style={{ fontSize: "0.82rem", color: "#78716c", lineHeight: 1.6, marginTop: 4 }}>
                Watch your monthly subsidy balance update as you add items — no surprises at checkout.
              </p>
            </div>
          </div>

          {/* ── Card 4: Local store (wide) ── */}
          <div className="feat-card card-store p-7">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 h-full">
              <div className="flex flex-col justify-between sm:w-52 flex-shrink-0">
                <div>
                  <div className="icon-ring mb-5">
                    <Store size={22} color="#16a34a" strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.15rem", color: "#1c1917", lineHeight: 1.3 }}>
                    Your local store, online
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "#78716c", lineHeight: 1.6, marginTop: 6 }}>
                    Browse live inventory, add to cart, and pick up — all from your phone, anytime.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2" style={{ color: "#16a34a", fontSize: "0.8rem", fontWeight: 600 }}>
                  Browse store <ArrowRight size={14} />
                </div>
              </div>

              <div
                className="flex-1 rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(22,101,52,0.12)", background: "#fafaf9" }}
              >
                <div
                  className="flex items-center gap-1.5 px-3 py-2.5 border-b"
                  style={{ borderColor: "rgba(22,101,52,0.1)", background: "#f5f5f4" }}
                >
                  <span className="w-2 h-2 rounded-full bg-red-300" />
                  <span className="w-2 h-2 rounded-full bg-yellow-300" />
                  <span className="w-2 h-2 rounded-full bg-green-300" />
                  <span
                    className="ml-2 flex-1 rounded px-2 py-0.5 text-center"
                    style={{ background: "#fff", fontSize: "0.65rem", color: "#a8a29e", border: "1px solid #e7e5e4" }}
                  >
                    candianscart.ca · store
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  {storeItems.map((item) => (
                    <div
                      key={item.name}
                      className="store-row flex items-center justify-between px-3 py-2.5"
                      style={{ border: "1px solid rgba(22,101,52,0.08)", background: "#fff" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1917" }}>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.tag && (
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 99, padding: "2px 8px" }}>
                            Subsidised
                          </span>
                        )}
                        <span style={{ fontSize: "0.7rem", color: "#a8a29e", textDecoration: "line-through" }}>{item.was}</span>
                        <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#15803d" }}>{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 5: Family Plans ── */}
          <div
            className="feat-card card-family p-7 flex flex-col justify-between min-h-[200px]"
            style={{ background: "linear-gradient(145deg, #166534 0%, #15803d 60%, #16a34a 100%)", border: "none" }}
          >
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -15, right: -15, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)", pointerEvents: "none" }} />

            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
              <ShoppingBag size={22} color="#fff" strokeWidth={1.5} />
            </div>

            <div style={{ position: "relative", zIndex: 1, marginTop: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                🇨🇦 Canada-only
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#fff", lineHeight: 1.3 }}>Family Plans</h3>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginTop: 6 }}>
                Exclusive access for Canadian families. Apply once — your whole household benefits every week.
              </p>
              <div className="mt-5 inline-flex items-center gap-2" style={{ background: "#fff", color: "#15803d", fontWeight: 700, fontSize: "0.82rem", borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}>
                Apply now <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* ── Card 6: Savings Calculator (full width) ── */}
          <div className="feat-card card-calc p-7 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-7">
              <div className="icon-ring">
                <Calculator size={22} color="#16a34a" strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1.15rem", color: "#1c1917", margin: 0 }}>Savings Calculator</h3>
                <p style={{ fontSize: "0.82rem", color: "#78716c", margin: "3px 0 0" }}>
                  Enter your monthly grocery spend to see how much you could save with us.
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

              {/* Left: Input controls */}
              <div style={{ flex: 1 }}>

                {/* Dollar input */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#57534e", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
                    Monthly spend
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", fontWeight: 600, color: "#78716c", pointerEvents: "none" }}>$</span>
                    <input
                      className="calc-input"
                      type="number"
                      min="0"
                      max="5000"
                      step="1"
                      value={spend === 0 ? '' : spend}
                      onChange={e => handleInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* Slider */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: "0.78rem", color: "#a8a29e", fontWeight: 600 }}>$10</span>
                    <span style={{ fontSize: "0.78rem", color: "#a8a29e", fontWeight: 600 }}>$2,000</span>
                  </div>
                  <input
                    className="calc-slider"
                    type="range"
                    min="10"
                    max="2000"
                    step="1"
                    value={Math.min(2000, Math.max(10, spend))}
                    onChange={e => handleInput(e.target.value)}
                  />
                </div>

                {/* Quick picks */}
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#57534e", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>Quick select</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[100, 200, 300, 500, 800].map(v => (
                      <button
                        key={v}
                        onClick={() => setSpend(v)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: spend === v ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                          background: spend === v ? "#dcfce7" : "#f9fafb",
                          color: spend === v ? "#15803d" : "#57534e",
                          transition: "all 0.15s ease",
                          fontFamily: "'Sora', sans-serif",
                        }}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: 1, background: "rgba(22,101,52,0.10)", alignSelf: "stretch", display: "none" }} className="lg:block" />

              {/* Right: Breakdown + result */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Breakdown table */}
                <div style={{ background: "#f9fafb", border: "1px solid rgba(22,101,52,0.09)", borderRadius: 14, padding: "16px 18px" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a8a29e", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>How it works</p>

                  <div className="calc-row">
                    <div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1917", margin: 0 }}>Your total spend</p>
                    </div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1c1917" }}>{fmt(spend)}</span>
                  </div>

                  <div className="calc-row">
                    <div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1917", margin: 0 }}>Subsidised portion</p>
                      <p style={{ fontSize: "0.72rem", color: "#a8a29e", margin: "2px 0 0" }}>40% of your spend</p>
                    </div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1c1917" }}>{fmt(subsidised)}</span>
                  </div>

                  <div className="calc-row">
                    <div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1917", margin: 0 }}>Discount applied</p>
                      <p style={{ fontSize: "0.72rem", color: "#a8a29e", margin: "2px 0 0" }}>60% off the subsidised portion</p>
                    </div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#16a34a" }}>{fmt(savings)}</span>
                  </div>
                </div>

                {/* Result banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", top: -24, right: -24, width: 96, height: 96, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ position: "absolute", top: -8, right: -8, width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)" }} />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 4px" }}>
                      You save up to
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span
                        key={Math.round(savings)}
                        className="savings-num"
                        style={{ fontSize: "2.6rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}
                      >
                        {fmtInt(savings)}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>/ month</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", margin: "0 0 3px", fontWeight: 600 }}>Annually</p>
                    <span
                      key={Math.round(annual)}
                      className="savings-num"
                      style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}
                    >
                      {fmtInt(annual)}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}