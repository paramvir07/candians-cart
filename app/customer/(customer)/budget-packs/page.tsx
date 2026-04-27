"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Package, Check, Sparkles, Tag } from "lucide-react";
import Link from "next/link";

const SUBSIDY_RATE = 0.21;

// Each combo's items sum exactly to maxPrice
const packages = [
  {
    id: 1,
    name: "Package 1",
    maxPrice: 21,
    description: "A starter pack with essential items, perfect for individuals or small families.",
    items: 4,
    combo: [
      { name: "Potatoes 5 lb",  price: 3.49 },
      { name: "Yogurt 750g",    price: 3.79 },
      { name: "Chili 1 lb",     price: 1.99 },
      { name: "Milk 1 gallon",  price: 5.99 },
      { name: "Eggs 6pk",       price: 5.74 },
    ],
  },
  {
    id: 2,
    name: "Package 2",
    maxPrice: 34,
    description: "A medium-value pack for weekly needs, offering a great balance of staples.",
    items: 6,
    combo: [
      { name: "Flour 10 lb",     price: 9.99 },
      { name: "Potatoes 5 lb",   price: 4.99 },
      { name: "Chili 1 lb",      price: 1.99 },
      { name: "Cauliflower",     price: 3.49 },
      { name: "Milk 1 gallon",   price: 5.99 },
      { name: "Yogurt 750g",     price: 3.79 },
      { name: "Onion 3 lb",      price: 3.76 },
    ],
  },
  {
    id: 3,
    name: "Package 3",
    maxPrice: 55,
    description: "A solid mid-range pack covering all weekly essentials for small families.",
    items: 7,
    combo: [
      { name: "Flour 10 lb",    price: 9.99 },
      { name: "Potatoes 10 lb", price: 4.99 },
      { name: "Milk 1 gallon",  price: 5.99 },
      { name: "Yogurt 750g",    price: 3.79 },
      { name: "Eggs 12pk",      price: 4.49 },
      { name: "Chili 1 lb",     price: 1.99 },
      { name: "Onion 10 lb",    price: 5.49 },
      { name: "Paneer 400g",    price: 5.49 },
      { name: "Basmati Rice 4lb", price: 5.49 },
      { name: "Tomatoes 3 lb",  price: 7.29 },
    ],
  },
  {
    id: 4,
    name: "Package 4",
    maxPrice: 89,
    description: "A balanced value set for larger families, with a wide variety of items.",
    items: 10,
    combo: [
      { name: "Flour 20 lb",      price: 16.99 },
      { name: "Milk 1 gallon",    price: 5.99 },
      { name: "Yogurt 1500g",     price: 7.99 },
      { name: "Paneer 400g",      price: 5.49 },
      { name: "Potatoes 10 lb",   price: 4.99 },
      { name: "Chili 1 lb",       price: 1.99 },
      { name: "Eggs 18pk",        price: 6.49 },
      { name: "Basmati Rice 10lb",price: 12.99 },
      { name: "Cauliflower",      price: 3.49 },
      { name: "Onion 10 lb",      price: 5.49 },
      { name: "Tomatoes 3 lb",    price: 7.29 },
      { name: "Cooking Oil 2L",   price: 9.80 },
    ],
  },
  {
    id: 5,
    name: "Package 5",
    maxPrice: 144,
    description: "High-value family combo packed with bulk staples to last the whole month.",
    items: 14,
    combo: [
      { name: "Flour 20 lb",       price: 16.99 },
      { name: "Milk (2×)",         price: 11.98 },
      { name: "Yogurt 1500g",      price: 7.99 },
      { name: "Paneer 400g (2×)",  price: 10.98 },
      { name: "Red Onion 25 lb",   price: 10.99 },
      { name: "Potatoes 10 lb",    price: 4.99 },
      { name: "Desi Ghee 800g",    price: 17.99 },
      { name: "Eggs 18pk",         price: 6.49 },
      { name: "Basmati Rice 10lb", price: 12.99 },
      { name: "Chili 2 lb",        price: 3.49 },
      { name: "Cooking Oil 2L",    price: 9.99 },
      { name: "Cauliflower (2×)",  price: 6.98 },
      { name: "Tomatoes 5 lb",     price: 9.99 },
      { name: "Lentils 4 lb",      price: 12.16 },
    ],
  },
  {
    id: 6,
    name: "Package 6",
    maxPrice: 233,
    description: "Premium bulk combo with maximum savings — the ultimate household stock-up.",
    items: 20,
    combo: [
      { name: "Desi Ghee 1.6 kg",  price: 34.99 },
      { name: "Flour 20 lb (2×)",  price: 33.98 },
      { name: "Milk (3×)",         price: 17.97 },
      { name: "Yogurt 1500g (2×)", price: 15.98 },
      { name: "Paneer 400g (3×)",  price: 16.47 },
      { name: "Potatoes 10 lb",    price: 4.99 },
      { name: "Red Onion 25 lb",   price: 10.99 },
      { name: "Eggs 18pk (2×)",    price: 12.98 },
      { name: "Basmati Rice 20lb", price: 25.99 },
      { name: "Cooking Oil 4L",    price: 17.99 },
      { name: "Lentils 8 lb",      price: 15.99 },
      { name: "Chili 2 lb",        price: 3.49 },
      { name: "Tomatoes 5 lb",     price: 9.99 },
      { name: "Cauliflower (2×)",  price: 6.99 },
      { name: "Chickpeas 4 lb",    price: 4.21 },
    ],
  },
];

function PackageCard({ pkg, index }: { pkg: (typeof packages)[0]; index: number }) {
  const total = pkg.combo.reduce((sum, item) => sum + item.price, 0);
  const subsidy = +(total * SUBSIDY_RATE).toFixed(2);
  const youPay = +(total - subsidy).toFixed(2);
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80 * index);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="pack-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: 20,
        border: selected
          ? "2px solid #16a34a"
          : hovered
          ? "2px solid #bbf7d0"
          : "2px solid #f0fdf4",
        boxShadow: selected
          ? "0 12px 40px rgba(22,163,74,0.18), 0 2px 8px rgba(0,0,0,0.06)"
          : hovered
          ? "0 16px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 2px 16px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: visible
          ? hovered
            ? "translateY(-4px) scale(1.01)"
            : "translateY(0) scale(1)"
          : "translateY(24px) scale(0.97)",
        opacity: visible ? 1 : 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Green accent top bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 3,
        background: selected
          ? "linear-gradient(90deg, #16a34a, #4ade80)"
          : "linear-gradient(90deg, #dcfce7, #bbf7d0)",
        transition: "background 0.4s ease",
      }} />

      {selected && (
        <div style={{
          position: "absolute",
          top: 14, right: 14,
          background: "#16a34a",
          color: "white",
          borderRadius: 999,
          padding: "3px 10px",
          fontSize: 11,
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 4,
          letterSpacing: 0.3,
          boxShadow: "0 2px 8px rgba(22,163,74,0.35)",
          animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <Check size={10} strokeWidth={3} /> Selected
        </div>
      )}

      <div style={{ padding: "24px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, paddingRight: selected ? 70 : 0, transition: "padding 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: selected ? "#dcfce7" : "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s",
            }}>
              <Package size={18} color={selected ? "#16a34a" : "#4ade80"} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
              {pkg.name}
            </span>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: "#16a34a", letterSpacing: -0.5 }}>
            ${pkg.maxPrice}
          </span>
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748b", fontSize: 13, margin: "0 0 14px", lineHeight: 1.6, minHeight: 42 }}>
          {pkg.description}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <span style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 999,
            padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 5,
          }}>
            <Tag size={11} /> Subsidy: ${(pkg.maxPrice * SUBSIDY_RATE).toFixed(2)}
          </span>
          <span style={{
            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 999,
            padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            fontSize: 12, color: "#475569",
          }}>
            {pkg.items} items
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>ⓘ</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 12, color: "#334155", letterSpacing: 0.2, textTransform: "uppercase" }}>
            Example Combo
          </span>
        </div>

        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9", marginBottom: 4 }}>
          {pkg.combo.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 13px",
              background: i % 2 === 0 ? "#fafafa" : "white",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#374151",
            }}>
              <span>{item.name}</span>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: "14px 22px 0", borderTop: "1px solid #f1f5f9", marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8" }}>Total Cost</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#475569" }}>${total.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8" }}>Subsidy (21%)</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#f87171", fontWeight: 600 }}>−${subsidy}</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: selected ? "#f0fdf4" : "#fafafa",
          borderRadius: 10, padding: "10px 14px", transition: "background 0.3s",
        }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>You Pay</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20, color: "#16a34a", letterSpacing: -0.5 }}>${youPay}</span>
        </div>
      </div>

      <div style={{ padding: "14px 22px 22px" }}>
        <button
          onClick={() => setSelected(s => !s)}
          style={{
            width: "100%",
            background: selected
              ? "linear-gradient(135deg, #15803d, #16a34a)"
              : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white", border: "none", borderRadius: 12,
            padding: "14px 0",
            fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: selected ? "0 4px 20px rgba(22,163,74,0.4)" : "0 2px 8px rgba(34,197,94,0.25)",
            letterSpacing: 0.2,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(22,163,74,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = selected ? "0 4px 20px rgba(22,163,74,0.4)" : "0 2px 8px rgba(34,197,94,0.25)"; }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
        >
          {selected ? <Check size={16} strokeWidth={2.5} /> : <ShoppingCart size={16} />}
          {selected ? "Pack Selected" : "Select This Pack"}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; }

        .pack-grid {
          display: grid;
          gap: 20px;
          width: 100%;
          max-width: 1380px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .pack-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .pack-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .back-btn:hover .back-icon { transform: translateX(-3px); }
        .back-icon { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .savings-pill {
          background: linear-gradient(90deg, #16a34a 0%, #4ade80 50%, #16a34a 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(220,252,231,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(187,247,208,0.4) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <main style={{
        minHeight: "100vh", position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "32px 16px 48px",
      }}>
        <div style={{
          width: "100%", maxWidth: 1380, display: "flex", alignItems: "center",
          marginBottom: 40,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-12px)",
          transition: "all 0.5s cubic-bezier(0.34,1.2,0.64,1)",
        }}>
          <Link href="/customer" style={{ textDecoration: "none" }}>
            <button
              className="back-btn"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12,
                padding: "9px 16px", fontFamily: "'Sora', sans-serif", fontWeight: 600,
                fontSize: 13, color: "#334155", cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(22,163,74,0.12)"; e.currentTarget.style.color = "#16a34a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.color = "#334155"; }}
            >
              <ArrowLeft size={15} className="back-icon" />
              Back
            </button>
          </Link>
        </div>

        <div style={{
          textAlign: "center", marginBottom: 44,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.55s cubic-bezier(0.34,1.2,0.64,1) 0.1s",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 999, padding: "5px 14px", marginBottom: 16,
          }}>
            <Sparkles size={13} color="#16a34a" />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, color: "#15803d", letterSpacing: 0.4, textTransform: "uppercase" }}>
              App Exclusive
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 38px)", color: "#0f172a",
            margin: "0 0 12px", letterSpacing: -0.8, lineHeight: 1.15,
          }}>
            Budget Grocery Packs
          </h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", color: "#64748b",
            fontSize: "clamp(14px, 2vw, 16px)", margin: "0 auto",
            maxWidth: 480, lineHeight: 1.7,
          }}>
            Every pack comes with an instant{" "}
            <span className="savings-pill">21% subsidy</span>
            {" "}applied at checkout — real savings, no vouchers needed.
          </p>
        </div>

        <div className="pack-grid">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </main>
    </>
  );
}