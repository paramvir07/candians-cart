"use client"
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShoppingBag, Wallet, Store, ArrowRight, Sparkles, Calculator } from 'lucide-react'
import Link from 'next/link'

export default function FeaturesSection() {
  const storeItems = [
    {
      emoji: "🥛",
      name: "3.25% MILK 4L",
      price: "$5.52",
      was: "$6.99",
      tag: true,
    },
    {
      emoji: "🧈",
      name: "VERKA GHEE 2.5KG",
      price: "$34.12",
      was: "$43.19",
      tag: true,
    },
    {
      emoji: "🫘",
      name: "RAJMA 2LB",
      price: "$4.37",
      was: "$5.39",
      tag: true,
    },
    {
      emoji: "🧅",
      name: "Onions 50lb",
      price: "$36.26",
      was: "$45.90",
      tag: true,
    },
  ];

  const [spend, setSpend] = useState(21)
  const searchParams = useSearchParams()

  useEffect(() => {
    const target = searchParams.get("scrollTo")
    if (!target) return
    const timer = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  const eligible = spend >= 21
  const savings = eligible ? spend * 0.35 * 0.60 : 0
  const annual  = savings * 12

  const fmt    = (n: number) => '$' + n.toFixed(2)
  const fmtInt = (n: number) => '$' + Math.ceil(n).toLocaleString()

  const handleInput = (val: string) => {
    const parsed = parseFloat(val)
    if (isNaN(parsed) || val === '') { setSpend(0); return }
    setSpend(Math.min(5000, Math.max(0, parsed)))
  }

  return (
    <section
      className="features-section"
      style={{
        position: 'relative',
        padding: 'clamp(48px, 8vw, 96px) 0',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ffffff 0%, #fef5e4 55%, #fef5e4 100%)',
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        /* ── dot grid watermark ── */
        .features-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #16a34a14 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── inner wrapper ── */
        .fs-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1024px;
          margin: 0 auto;
          padding: 0 clamp(16px, 5vw, 48px);
          box-sizing: border-box;
        }

        /* ── pill label ── */
        .fs-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 999px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        /* ── bento grid ── */
        .fs-bento {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-areas:
            "stat  wallet chart"
            "store store  family"
            "calc  calc   calc";
        }

        /* tablet */
        @media (max-width: 860px) {
          .fs-bento {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "stat   wallet"
              "chart  chart"
              "store  store"
              "family family"
              "calc   calc";
          }
        }

        /* mobile */
        @media (max-width: 520px) {
          .fs-bento {
            grid-template-columns: 1fr;
            grid-template-areas:
              "stat"
              "wallet"
              "chart"
              "store"
              "family"
              "calc";
          }
        }

        .fs-area-stat   { grid-area: stat; }
        .fs-area-wallet { grid-area: wallet; }
        .fs-area-chart  { grid-area: chart; }
        .fs-area-store  { grid-area: store; }
        .fs-area-family { grid-area: family; }
        .fs-area-calc   { grid-area: calc; }

        /* ── cards ── */
        .fs-card {
          background: #fff;
          border: 1px solid rgba(22,101,52,0.10);
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(22,101,52,0.04), 0 8px 28px rgba(22,101,52,0.07);
          overflow: hidden;
          position: relative;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          box-sizing: border-box;
        }
        .fs-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(22,101,52,0.09), 0 16px 44px rgba(22,101,52,0.12);
        }

        /* ── icon ring ── */
        .fs-icon-ring {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          border: 1px solid #86efac;
          flex-shrink: 0;
        }

        /* ── savings blob (card 1) ── */
        .fs-blob {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, #bbf7d030 0%, transparent 70%);
          top: -50px;
          right: -50px;
          pointer-events: none;
        }

        /* ── savings pulse ── */
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.28); }
          50%       { box-shadow: 0 0 0 8px rgba(22,163,74,0); }
        }
        .fs-pulse { animation: softPulse 2.8s ease-in-out infinite; }

        /* ── chart line draw ── */
        .fs-chart-path {
          stroke-dasharray: 620;
          stroke-dashoffset: 620;
          animation: drawLine 2s ease forwards 0.5s;
        }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }

        /* ── store rows ── */
        .fs-store-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 9px 11px;
          border: 1px solid rgba(22,101,52,0.08);
          border-radius: 10px;
          background: #fff;
          gap: 8px;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .fs-store-row:hover {
          background: #f0fdf4;
          transform: translateX(3px);
        }
        .fs-item-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1c1917;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }

        /* ── store card inner layout ── */
        .fs-store-inner {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }
        @media (min-width: 640px) {
          .fs-store-inner {
            flex-direction: row;
            align-items: stretch;
            gap: 24px;
          }
          .fs-store-left { width: 180px; flex-shrink: 0; }
        }

        /* ── calculator layout ── */
        .fs-calc-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @media (min-width: 680px) {
          .fs-calc-body {
            flex-direction: row;
            align-items: flex-start;
            gap: 0;
          }
          .fs-calc-col { flex: 1; min-width: 0; }
          .fs-calc-col:first-child { padding-right: 28px; }
          .fs-calc-col:last-child  { padding-left: 28px; }
          .fs-calc-divider {
            flex: none;
            width: 1px;
            align-self: stretch;
            background: rgba(22,101,52,0.10);
            display: block !important;
          }
        }
        .fs-calc-divider { display: none; }

        /* ── calc input ── */
        .fs-calc-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px 10px 30px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          color: #1c1917;
          background: #f9fafb;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s;
          -moz-appearance: textfield;
        }
        .fs-calc-input::-webkit-outer-spin-button,
        .fs-calc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .fs-calc-input:focus { border-color: #16a34a; background: #fff; }
        .fs-calc-input.ineligible { border-color: #fca5a5; background: #fff7f7; }

        /* ── range slider ── */
        .fs-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 5px;
          border-radius: 99px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
        }
        .fs-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #16a34a;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #86efac;
          cursor: pointer;
          transition: box-shadow 0.18s;
        }
        .fs-slider::-webkit-slider-thumb:hover { box-shadow: 0 0 0 4px #bbf7d0; }
        .fs-slider::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #16a34a;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #86efac;
          cursor: pointer;
        }

        /* ── calc breakdown rows ── */
        .fs-calc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(22,101,52,0.08);
        }
        .fs-calc-row:last-child { border-bottom: none; }

        /* ── count-up animation ── */
        @keyframes countUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fs-savings-num { animation: countUp 0.22s ease; }

        /* ── quick picks ── */
        .fs-pick-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.14s ease;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          color: #57534e;
        }
        .fs-pick-btn.active {
          border-color: #16a34a;
          background: #dcfce7;
          color: #15803d;
        }
        .fs-pick-btn:hover:not(.active) {
          border-color: #86efac;
          background: #f0fdf4;
          color: #166534;
        }

        /* ── apply button ── */
        .fs-apply-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #15803d;
          font-weight: 700;
          font-size: 0.82rem;
          font-family: 'Sora', sans-serif;
          border-radius: 10px;
          padding: 8px 16px;
          cursor: pointer;
          border: none;
          transition: background 0.15s ease;
          margin-top: 20px;
        }
        .fs-apply-btn:hover { background: #f0fdf4; }

        /* ── text helpers ── */
        .fs-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #57534e;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
      `}</style>

      <div className="fs-inner">

        {/* ── Section header ── */}
        <div id="how-it-works" style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 56px)' }}>
          <div className="fs-pill">
            <Sparkles size={12} />
            Why families choose us
          </div>
          <h2 style={{
            fontWeight: 800,
            letterSpacing: '-0.5px',
            lineHeight: 1.12,
            color: '#1c1917',
            fontSize: 'clamp(1.75rem, 4.5vw, 2.9rem)',
            margin: '0 0 14px',
          }}>
            Everything your family needs,{' '}
            <span style={{ color: '#16a34a' }}>for less</span>
          </h2>
          <p style={{
            color: '#78716c',
            maxWidth: 460,
            margin: '0 auto',
            lineHeight: 1.7,
            fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          }}>
            From subsidised staples to real-time savings tracking — built exclusively for Canadian families in Abbotsford.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="fs-bento">

          {/* Card 1 — 30% avg saved */}
          <div className="fs-card fs-area-stat" style={{ padding: 'clamp(20px, 4vw, 28px)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="fs-blob" />
            <div
              className="fs-pulse"
              style={{
                background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                border: '1px solid #86efac',
                borderRadius: 18,
                padding: '14px 20px',
                display: 'inline-block',
              }}
            >
              <p style={{ fontSize: 'clamp(2.6rem, 6vw, 3.5rem)', fontWeight: 800, lineHeight: 1, color: '#15803d', margin: 0 }}>30%</p>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '2px 0 0' }}>avg saved</p>
            </div>
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1917', margin: '0 0 5px' }}>Average Savings</h3>
              <p style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.6, margin: 0 }}>
                Families save 30% on subsidised pricing every month.
              </p>
            </div>
          </div>

          {/* Card 2 — Gift Wallet */}
          <div className="fs-card fs-area-wallet" style={{ padding: 'clamp(20px, 4vw, 28px)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="fs-icon-ring">
              <Wallet size={22} color="#16a34a" strokeWidth={1.5} />
            </div>
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1917', margin: '0 0 5px' }}>Gift Wallet Rewards</h3>
              <p style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.6, margin: '0 0 14px' }}>
                Earn gift credits on every order. Spend it on anything in store.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                Learn more <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 3 — Chart */}
          <div className="fs-card fs-area-chart" style={{ padding: 'clamp(20px, 4vw, 28px)', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 12px 4px', overflow: 'hidden' }}>
              <svg viewBox="0 0 260 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
                {[20, 40, 60].map(y => (
                  <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#d1fae5" strokeWidth="1" />
                ))}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 65 C30 58,55 50,80 44 S120 30,150 26 S200 18,230 14 L260 10 L260 80 L0 80Z" fill="url(#chartGrad)" opacity="0.5" />
                <path className="fs-chart-path" d="M0 65 C30 58,55 50,80 44 S120 30,150 26 S200 18,230 14 L260 10" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
                {([[0,65],[80,44],[150,26],[260,10]] as [number,number][]).map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="3.5" fill="#16a34a" />
                ))}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 4px', fontSize: '0.64rem', color: '#86efac', fontWeight: 600 }}>
                <span>Jan</span><span>Mar</span><span>Jun</span><span>Now</span>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1917', margin: '0 0 5px' }}>Subsidy tracked live</h3>
              <p style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.6, margin: 0 }}>
                Watch your monthly subsidy balance update as you add items — no surprises at checkout.
              </p>
            </div>
          </div>

          {/* Card 4 — Local Store (wide) */}
          <div className="fs-card fs-area-store" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
            <div className="fs-store-inner">
              {/* Left text */}
              <div className="fs-store-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="fs-icon-ring" style={{ marginBottom: 16 }}>
                    <Store size={22} color="#16a34a" strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1c1917', lineHeight: 1.3, margin: '0 0 8px' }}>
                    Your local store, online
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.65, margin: 0 }}>
                    Browse live inventory, add to cart, and pick up — all from your phone.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontSize: '0.8rem', fontWeight: 600, marginTop: 16 }}>
                  Browse store <ArrowRight size={13} />
                </div>
              </div>

              {/* Mock browser */}
              <div style={{ flex: 1, border: '1px solid rgba(22,101,52,0.12)', borderRadius: 12, overflow: 'hidden', background: '#fafaf9', minWidth: 0 }}>
                {/* Browser bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f5f5f4', borderBottom: '1px solid rgba(22,101,52,0.10)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fca5a5', display: 'inline-block' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fde68a', display: 'inline-block' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#86efac', display: 'inline-block' }} />
                  <div style={{ flex: 1, background: '#fff', borderRadius: 5, border: '1px solid #e7e5e4', padding: '3px 8px', fontSize: '0.62rem', color: '#a8a29e', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    candianscart.ca · store
                  </div>
                </div>
                {/* Items */}
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {storeItems.map(item => (
                    <div key={item.name} className="fs-store-row">
                      {/* emoji + text column */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                          <span className="fs-item-name">{item.name}</span>
                          {item.tag && (
                            <span className="fs-subsidised-badge" style={{ fontSize: '0.6rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 999, padding: '2px 7px', whiteSpace: 'nowrap', display: 'inline-block', width: 'fit-content' }}>
                              Subsidised
                            </span>
                          )}
                        </div>
                      </div>
                      {/* price column — always right-aligned */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontSize: '0.68rem', color: '#a8a29e', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{item.was}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d', whiteSpace: 'nowrap' }}>{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 5 — Family Plans (dark) */}
          <div
            className="fs-card fs-area-family"
            style={{
              padding: 'clamp(20px, 4vw, 28px)',
              background: 'linear-gradient(145deg, #166534 0%, #15803d 55%, #16a34a 100%)',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 200,
            }}
          >
            {/* decorative rings */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -16, right: -16, width: 90, height: 90, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.09)', pointerEvents: 'none' }} />

            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <ShoppingBag size={20} color="#fff" strokeWidth={1.5} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, marginTop: 20 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                🇨🇦 Canada-only
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', lineHeight: 1.3, margin: '0 0 8px' }}>Family Plans</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0 }}>
                Exclusive access for Canadian families. Apply once — your whole household benefits every week.
              </p>
              <Link href="/customer/signup">
                <button className="fs-apply-btn">
                  Apply now <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 6 — Savings Calculator */}
          <div id="calculator" className="fs-card fs-area-calc" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div className="fs-icon-ring" style={{ flexShrink: 0 }}>
                <Calculator size={22} color="#16a34a" strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1c1917', margin: '0 0 3px' }}>Savings Calculator</h3>
                <p style={{ fontSize: '0.82rem', color: '#78716c', margin: 0 }}>
                  Enter your monthly grocery spend to see how much you could save.
                </p>
              </div>
            </div>

            <div className="fs-calc-body">

              {/* Left: controls */}
              <div className="fs-calc-col">
                {/* Dollar input */}
                <div style={{ marginBottom: 20 }}>
                  <span className="fs-label">Monthly spend</span>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', fontWeight: 600, color: '#78716c', pointerEvents: 'none' }}>$</span>
                    <input
                      className={`fs-calc-input${!eligible && spend > 0 ? ' ineligible' : ''}`}
                      type="number"
                      min="0"
                      max="5000"
                      step="1"
                      value={spend === 0 ? '' : spend}
                      onChange={e => handleInput(e.target.value)}
                    />
                  </div>
                  {spend > 0 && !eligible && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ⚠️ Minimum spend of $21 required to qualify.
                    </p>
                  )}
                </div>

                {/* Slider */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.76rem', color: '#a8a29e', fontWeight: 600 }}>$0</span>
                    <span style={{ fontSize: '0.76rem', color: '#a8a29e', fontWeight: 600 }}>$2,000</span>
                  </div>
                  <input
                    className="fs-slider"
                    type="range"
                    min="0"
                    max="2000"
                    step="1"
                    value={Math.min(2000, Math.max(0, spend))}
                    onChange={e => handleInput(e.target.value)}
                  />
                </div>

                {/* Quick picks */}
                <div>
                  <span className="fs-label">Quick select</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {[21, 34, 55, 89, 144, 200, 300, 400, 500].map(v => (
                      <button
                        key={v}
                        className={`fs-pick-btn${spend === v ? ' active' : ''}`}
                        onClick={() => setSpend(v)}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="fs-calc-divider" />

              {/* Right: results */}
              <div className="fs-calc-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Breakdown */}
                <div style={{ background: '#f9fafb', border: '1px solid rgba(22,101,52,0.09)', borderRadius: 14, padding: '14px 16px' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a8a29e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>How it works</p>

                  <div className="fs-calc-row">
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1c1917' }}>Your total spend</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c1917' }}>{fmt(spend)}</span>
                  </div>
                  <div className="fs-calc-row">
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1c1917' }}>Discount applied</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: eligible ? '#16a34a' : '#a8a29e' }}>{fmt(savings)}</span>
                  </div>
                </div>

                {/* Result banner */}
                <div
                  style={{
                    background: eligible
                      ? 'linear-gradient(135deg, #166534 0%, #16a34a 100%)'
                      : 'linear-gradient(135deg, #78716c 0%, #a8a29e 100%)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.35s ease',
                  }}
                >
                  <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <div style={{ position: 'absolute', top: -8, right: -8, width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.09)' }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 3px' }}>
                      {eligible ? 'You save up to' : 'Minimum not met'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                      <span
                        key={Math.round(savings)}
                        className="fs-savings-num"
                        style={{ fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 800, color: '#fff', lineHeight: 1 }}
                      >
                        {fmtInt(savings)}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.68)', fontWeight: 600 }}>/ mo</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.58)', margin: '0 0 2px', fontWeight: 600 }}>Annually</p>
                    <span
                      key={Math.round(annual)}
                      className="fs-savings-num"
                      style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', fontWeight: 800, color: '#fff' }}
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