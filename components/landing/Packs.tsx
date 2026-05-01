"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Link from "next/link";

const SUBSIDY = 0.21;

const packs = [
  {
    id: 1,
    tier: "Starter",
    name: "Essential pack",
    retailPrice: 21,
    hero: false,
    desc: "Fresh weekly staples for individuals and couples.",
    items: [
      { name: "Potatoes 5 lb", price: 3.49 },
      { name: "Yogurt 750g", price: 3.79 },
      { name: "Milk 1 gallon", price: 5.99 },
      { name: "Eggs 6pk", price: 5.74 },
      { name: "Chili 1 lb", price: 1.99 },
    ],
    extraItems: 0,
  },
  {
    id: 2,
    tier: "Most popular",
    name: "Family pack",
    retailPrice: 55,
    hero: true,
    desc: "Everything a small family needs for the week.",
    items: [
      { name: "Flour 10 lb", price: 9.99 },
      { name: "Basmati Rice 4 lb", price: 5.49 },
      { name: "Milk 1 gallon", price: 5.99 },
      { name: "Paneer 400g", price: 5.49 },
      { name: "Eggs 12pk", price: 4.49 },
    ],
    extraItems: 5,
  },
];

function PackCard({ pack, isMobile }: { pack: (typeof packs)[0]; isMobile: boolean }) {
  const subsidy = +(pack.retailPrice * SUBSIDY).toFixed(2);
  const youPay  = +(pack.retailPrice - subsidy).toFixed(2);
  // On mobile only show 3 items to keep cards short
  const visibleItems = isMobile ? pack.items.slice(0, 3) : pack.items;
  const hiddenCount  = isMobile
    ? pack.items.length - 3 + pack.extraItems
    : pack.extraItems;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: pack.hero
          ? "2px solid #16a34a"
          : "1px solid rgba(22,101,52,0.10)",
        boxShadow: "0 2px 8px rgba(22,101,52,0.04), 0 8px 28px rgba(22,101,52,0.07)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(22,101,52,0.09), 0 16px 44px rgba(22,101,52,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(22,101,52,0.04), 0 8px 28px rgba(22,101,52,0.07)";
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: pack.hero ? "#16a34a" : "#f0fdf4" }} />

      {/* Body */}
      <div style={{ padding: isMobile ? "14px" : "clamp(18px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: isMobile ? 9 : 12, flex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#16a34a" }}>
              {pack.tier}
            </span>
            <span style={{ fontSize: isMobile ? "0.9rem" : "1.05rem", fontWeight: 800, color: "#1c1917", letterSpacing: "-0.3px" }}>
              {pack.name}
            </span>
            {pack.hero && (
              <span style={{ alignSelf: "flex-start", fontSize: "0.58rem", fontWeight: 700, background: "#16a34a", color: "#fff", padding: "2px 8px", borderRadius: 999 }}>
                Best value
              </span>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "0.65rem", color: "#a8a29e", textDecoration: "line-through" }}>
              ${pack.retailPrice.toFixed(2)}
            </div>
            <div style={{ fontSize: isMobile ? "1.4rem" : "clamp(1.6rem, 3.5vw, 2rem)", fontWeight: 800, color: "#16a34a", lineHeight: 1, letterSpacing: "-1px" }}>
              ${youPay.toFixed(2)}
            </div>
            <div style={{ fontSize: "0.6rem", color: "#a8a29e", marginTop: 1 }}>after subsidy</div>
          </div>
        </div>

        {/* Description — hidden on mobile to save space */}
        {!isMobile && (
          <p style={{ fontSize: "0.8rem", color: "#78716c", lineHeight: 1.65, margin: 0 }}>
            {pack.desc}
          </p>
        )}

        {/* Pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
            Save ${subsidy.toFixed(2)}
          </span>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#f9fafb", color: "#78716c", border: "1px solid #e5e7eb" }}>
            {pack.items.length + pack.extraItems} items
          </span>
        </div>

        {/* Item list */}
        <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(22,101,52,0.08)" }}>
          {visibleItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: isMobile ? "6px 10px" : "7px 12px",
                fontSize: isMobile ? "0.72rem" : "0.78rem",
                color: "#374151",
                background: i % 2 === 0 ? "#fff" : "#f9fafb",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
              onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f9fafb")}
            >
              <span>{item.name}</span>
              <span style={{ color: "#16a34a", fontWeight: 700, fontSize: isMobile ? "0.72rem" : "0.8rem" }}>
                ${item.price.toFixed(2)}
              </span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <div style={{ display: "flex", justifyContent: "center", padding: isMobile ? "5px 10px" : "6px 12px", fontSize: "0.68rem", color: "#a8a29e", background: "#f9fafb", fontWeight: 500 }}>
              + {hiddenCount} more items included
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: isMobile ? "10px 14px 14px" : "12px clamp(18px, 3vw, 24px) clamp(18px, 3vw, 24px)", borderTop: "1px solid rgba(22,101,52,0.08)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
          {[
            ["Retail total", `$${pack.retailPrice.toFixed(2)}`, false],
            ["Subsidy (21%)", `− $${subsidy.toFixed(2)}`, true],
          ].map(([label, val, green]) => (
            <div key={label as string} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#a8a29e" }}>
              <span>{label}</span>
              <span style={{ fontWeight: 600, color: green ? "#16a34a" : undefined }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", borderRadius: 10, padding: isMobile ? "8px 12px" : "10px 14px" }}>
          <span style={{ fontSize: isMobile ? "0.75rem" : "0.82rem", fontWeight: 700, color: "#166534" }}>You pay</span>
          <span style={{ fontSize: isMobile ? "1.1rem" : "clamp(1.2rem, 2.5vw, 1.4rem)", fontWeight: 800, color: "#16a34a", letterSpacing: "-0.5px" }}>
            ${youPay.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PacksSection() {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile once on mount
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      id="grocery-packs"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(28px, 5vw, 64px) 0",
        background: "#fef5e4",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, #16a34a14 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1024,
          margin: "0 auto",
          padding: "0 clamp(16px, 5vw, 48px)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 44px)" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 999,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a", display: "inline-block", flexShrink: 0 }} />
            App exclusive packs
          </div>
          <h2
            style={{
              fontWeight: 800,
              letterSpacing: "-0.5px",
              lineHeight: 1.12,
              color: "#1c1917",
              fontSize: "clamp(1.35rem, 4vw, 2.6rem)",
              margin: "0 0 10px",
            }}
          >
            Groceries that cost{" "}
            <span style={{ color: "#16a34a" }}>21% less.</span>{" "}
            Guaranteed.
          </h2>
          <p
            style={{
              color: "#78716c",
              maxWidth: 380,
              margin: "0 auto",
              lineHeight: 1.65,
              fontSize: "clamp(0.78rem, 2vw, 0.92rem)",
            }}
          >
            Instant subsidy at checkout — no vouchers, no waiting.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gap: isMobile ? 12 : 14,
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          }}
        >
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} isMobile={isMobile} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: isMobile ? 20 : 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Link href="/customer/signup">
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#16a34a",
                color: "#fff",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? "0.8rem" : "0.85rem",
                padding: isMobile ? "10px 22px" : "11px 28px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                transition: "background 0.18s ease, transform 0.15s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#15803d";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#16a34a";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <Users size={14} strokeWidth={2} />
              Sign up to unlock all 6 packs
            </button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {["Free to join", "Subsidy applied instantly", "No vouchers needed"].map((t, i, arr) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.65rem", color: "#a8a29e" }}>{t}</span>
                {i < arr.length - 1 && (
                  <span style={{ width: 2, height: 2, borderRadius: "50%", background: "#d6d3d1", display: "inline-block" }} />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}