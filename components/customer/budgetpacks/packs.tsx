"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ShoppingCart, Package, Check, Sparkles, Tag,
  X, Info, ChevronRight, Gift, Pencil, Zap,
} from "lucide-react";
import Link from "next/link";

const SUBSIDY_RATE = 0.21;

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
      { name: "Flour 10 lb",      price: 9.99 },
      { name: "Potatoes 10 lb",   price: 4.99 },
      { name: "Milk 1 gallon",    price: 5.99 },
      { name: "Yogurt 750g",      price: 3.79 },
      { name: "Eggs 12pk",        price: 4.49 },
      { name: "Chili 1 lb",       price: 1.99 },
      { name: "Onion 10 lb",      price: 5.49 },
      { name: "Paneer 400g",      price: 5.49 },
      { name: "Basmati Rice 4lb", price: 5.49 },
      { name: "Tomatoes 3 lb",    price: 7.29 },
    ],
  },
  {
    id: 4,
    name: "Package 4",
    maxPrice: 89,
    description: "A balanced value set for larger families, with a wide variety of items.",
    items: 10,
    combo: [
      { name: "Flour 20 lb",       price: 16.99 },
      { name: "Milk 1 gallon",     price: 5.99 },
      { name: "Yogurt 1500g",      price: 7.99 },
      { name: "Paneer 400g",       price: 5.49 },
      { name: "Potatoes 10 lb",    price: 4.99 },
      { name: "Chili 1 lb",        price: 1.99 },
      { name: "Eggs 18pk",         price: 6.49 },
      { name: "Basmati Rice 10lb", price: 12.99 },
      { name: "Cauliflower",       price: 3.49 },
      { name: "Onion 10 lb",       price: 5.49 },
      { name: "Tomatoes 3 lb",     price: 7.29 },
      { name: "Cooking Oil 2L",    price: 9.80 },
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmedSelection {
  items: { name: string; price: number; discount: number }[];
  subsidyUsed: number;
  unusedSubsidy: number;
  youPay: number;          // what customer pays for partially-covered items
  effectiveBudget: number; // maxPrice + unusedSubsidy + youPay
}

// ─── Allocator ────────────────────────────────────────────────────────────────

function allocateSubsidy(
  combo: { name: string; price: number }[],
  checked: boolean[],
  budget: number
) {
  let remaining = budget;
  const itemDiscount: number[] = combo.map(() => 0);
  let subsidyUsed = 0;

  for (let i = 0; i < combo.length; i++) {
    if (!checked[i]) continue;
    const price = combo[i].price;
    if (remaining <= 0) break;
    const discount = Math.min(price, remaining);
    itemDiscount[i] = +discount.toFixed(2);
    subsidyUsed += discount;
    remaining -= discount;
  }

  const unusedSubsidy = +(budget - subsidyUsed).toFixed(2);
  const selectedTotal = combo.reduce((s, item, i) => (checked[i] ? s + item.price : s), 0);
  const youPay = +(selectedTotal - subsidyUsed).toFixed(2);

  return { subsidyUsed: +subsidyUsed.toFixed(2), unusedSubsidy, youPay, itemDiscount };
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

function SubsidyDialog({
  pkg,
  onClose,
  onConfirm,
}: {
  pkg: (typeof packages)[0];
  onClose: () => void;
  onConfirm: (selection: ConfirmedSelection) => void;
}) {
  const packTotal     = pkg.combo.reduce((s, i) => s + i.price, 0);
  const subsidyBudget = +(packTotal * SUBSIDY_RATE).toFixed(2);
  const [checked, setChecked] = useState<boolean[]>(pkg.combo.map(() => true));

  const { subsidyUsed, unusedSubsidy, youPay, itemDiscount } = allocateSubsidy(
    pkg.combo, checked, subsidyBudget
  );
  // effectiveBudget = what the customer can spend in store
  // = pack price they paid + any unused subsidy remainder + any partial item cost they owe
  const effectiveBudget = +(pkg.maxPrice + unusedSubsidy + youPay).toFixed(2);

  const toggle = (i: number) =>
    setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; });

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    const items = pkg.combo
      .map((item, i) => ({ name: item.name, price: item.price, discount: itemDiscount[i] }))
      .filter((_, i) => checked[i]);
    onConfirm({ items, subsidyUsed, unusedSubsidy, youPay, effectiveBudget });
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background: "white", borderRadius: 24, width: "100%", maxWidth: 520,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22),0 4px 16px rgba(0,0,0,0.08)",
        animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #f1f5f9", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Gift size={18} color="#16a34a" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a", margin: 0 }}>
                Choose Your Free Items
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                {pkg.name} · Your free credit: <strong style={{ color: "#16a34a" }}>${subsidyBudget}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            position: "absolute", top: 18, right: 18,
            background: "#f1f5f9", border: "none", borderRadius: 8,
            width: 30, height: 30, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
          }}>
            <X size={15} />
          </button>
        </div>

        {/* Budget bar */}
        <div style={{ padding: "14px 24px", background: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#64748b", fontWeight: 500 }}>
              Free credit used
            </span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#16a34a" }}>
              ${subsidyUsed} <span style={{ color: "#94a3b8", fontWeight: 500 }}>of ${subsidyBudget} free</span>
            </span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, (subsidyUsed / subsidyBudget) * 100)}%`,
              background: "linear-gradient(90deg,#4ade80,#16a34a)",
              borderRadius: 999,
              transition: "width 0.35s cubic-bezier(0.34,1.2,0.64,1)",
            }} />
          </div>

          {unusedSubsidy > 0 ? (
            <div style={{
              marginTop: 8, background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: 8, padding: "8px 12px",
              display: "flex", alignItems: "flex-start", gap: 7,
            }}>
              <Zap size={13} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                <strong>${unusedSubsidy.toFixed(2)} not used yet.</strong> Pick more items — or it will be saved to your gift wallet.
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#16a34a", margin: "6px 0 0", fontWeight: 600 }}>
              All free credit used ✓
            </p>
          )}
        </div>

        {/* Info */}
        <div style={{
          margin: "12px 24px 0", background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <Info size={13} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#15803d", margin: 0, lineHeight: 1.6 }}>
            You have <strong>${subsidyBudget} free credit</strong>. Pick items below — we will pay for them using your credit. Any credit not used goes to your <strong>gift wallet</strong>.
          </p>
        </div>

        {/* Item list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 24px 0" }}>
          {/* Select all */}
          <div
            onClick={() => { const allOn = checked.every(Boolean); setChecked(pkg.combo.map(() => !allOn)); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", background: "#f8fafc", borderRadius: 10,
              marginBottom: 8, cursor: "pointer", border: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#334155" }}>
              Select all items
            </span>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: checked.every(Boolean) ? "#16a34a" : "white",
              border: `2px solid ${checked.every(Boolean) ? "#16a34a" : "#cbd5e1"}`,
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
            }}>
              {checked.every(Boolean) && <Check size={12} color="white" strokeWidth={3} />}
            </div>
          </div>

          {pkg.combo.map((item, i) => {
            const discount      = itemDiscount[i];
            const isFree        = checked[i] && discount >= item.price - 0.001;
            const isPartial     = checked[i] && discount > 0 && !isFree;
            const effectivePrice = +(item.price - discount).toFixed(2);

            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                style={{
                  display: "flex", alignItems: "center", padding: "11px 14px",
                  borderRadius: 10, marginBottom: 4, cursor: "pointer",
                  background: isFree ? "#f0fdf4" : isPartial ? "#fffbeb" : checked[i] ? "#f0fdf4" : "white",
                  border: `1.5px solid ${isFree ? "#bbf7d0" : isPartial ? "#fde68a" : checked[i] ? "#bbf7d0" : "#f1f5f9"}`,
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: checked[i] ? "#16a34a" : "white",
                  border: `2px solid ${checked[i] ? "#16a34a" : "#cbd5e1"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s", marginRight: 12,
                }}>
                  {checked[i] && <Check size={12} color="white" strokeWidth={3} />}
                </div>
                <span style={{
                  flex: 1, fontFamily: "'DM Sans',sans-serif", fontSize: 14,
                  color: checked[i] ? "#0f172a" : "#94a3b8", transition: "color 0.2s",
                }}>
                  {item.name}
                </span>
                <div style={{ textAlign: "right" }}>
                  {isFree ? (
                    <>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#16a34a" }}>FREE</span>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#94a3b8", textDecoration: "line-through", marginTop: 1 }}>
                        ${item.price.toFixed(2)}
                      </div>
                    </>
                  ) : isPartial ? (
                    <>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#d97706" }}>
                        ${effectivePrice.toFixed(2)}
                      </span>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#fbbf24", marginTop: 1 }}>
                        −${discount.toFixed(2)} subsidy
                      </div>
                    </>
                  ) : (
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: "#94a3b8" }}>
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ height: 12 }} />
        </div>

        {/* Summary */}
        <div style={{ padding: "16px 24px 22px", borderTop: "1px solid #f1f5f9", background: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: unusedSubsidy > 0 ? 3 : 10 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8" }}>Free credit used</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#16a34a", fontWeight: 600 }}>−${subsidyUsed.toFixed(2)}</span>
          </div>
          {unusedSubsidy > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8" }}>Leftover credit → gift wallet</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#d97706", fontWeight: 600 }}>${unusedSubsidy.toFixed(2)} saved</span>
            </div>
          )}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", margin: "0 0 14px",
          }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              You pay for these items
            </span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#16a34a", letterSpacing: -0.5 }}>
              ${youPay.toFixed(2)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "13px 0", background: "white", border: "1.5px solid #e2e8f0",
                borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13,
                color: "#64748b", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={checked.every(v => !v)}
              style={{
                flex: 2, padding: "13px 0",
                background: checked.every(v => !v) ? "#e2e8f0" : "linear-gradient(135deg,#22c55e,#16a34a)",
                border: "none", borderRadius: 12,
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14,
                color: checked.every(v => !v) ? "#94a3b8" : "white",
                cursor: checked.every(v => !v) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                boxShadow: checked.every(v => !v) ? "none" : "0 4px 16px rgba(22,163,74,0.35)",
                transition: "all 0.2s",
              }}
            >
              <Check size={15} strokeWidth={2.5} />
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  index,
  isSelected,
  onSelect,
}: {
  pkg: (typeof packages)[0];
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  const packTotal     = pkg.combo.reduce((s, i) => s + i.price, 0);
  const subsidyBudget = +(packTotal * SUBSIDY_RATE).toFixed(2);

  const [hovered,    setHovered]    = useState(false);
  const [visible,    setVisible]    = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed,  setConfirmed]  = useState<ConfirmedSelection | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 * index);
    return () => clearTimeout(t);
  }, [index]);

  const handleDeselect = () => {
    setConfirmed(null);
    onSelect(pkg.id); // toggles off in parent
  };

  const handleConfirm = (sel: ConfirmedSelection) => {
    setConfirmed(sel);
    setDialogOpen(false);
    // only call onSelect if not already selected
    if (!isSelected) onSelect(pkg.id);
  };

  // ── Item section rendering ────────────────────────────────────────────────
  const PREVIEW_COUNT = 3;

  const renderItemsSection = () => {
    if (!confirmed) {
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Gift size={14} color="#16a34a" />
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#15803d" }}>
              Items in This Pack
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", margin: "0 0 10px", lineHeight: 1.6 }}>
            Use your <strong style={{ color: "#15803d" }}>${subsidyBudget} free grocery credit</strong> on eligible items.
          </p>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9" }}>
            {pkg.combo.slice(0, PREVIEW_COUNT).map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "9px 13px",
                background: i % 2 === 0 ? "#fafafa" : "white",
                fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#374151",
              }}>
                <span>{item.name}</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <Link href="/customer/budget-packs/subsidy-items" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "10px 13px", background: "white",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderTop: "1px solid #f1f5f9", cursor: "pointer",
              }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: "#16a34a" }}>
                  Many more items available
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#16a34a" }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500 }}>Browse all</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          </div>
        </>
      );
    }

    // ── Confirmed: show selected items + remainder row ────────────────────
    const { items, unusedSubsidy } = confirmed;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={14} color="#16a34a" />
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#15803d" }}>
              Your Free Items ({items.length})
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setDialogOpen(true); }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "white", border: "1px solid #e2e8f0",
              borderRadius: 8, padding: "4px 10px", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#64748b",
            }}
          >
            <Pencil size={11} />
            Edit
          </button>
        </div>

        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9" }}>
          {items.map((item, i) => {
            const isFree     = item.discount >= item.price - 0.001;
            const isPartial  = item.discount > 0 && !isFree;
            const effPrice   = +(item.price - item.discount).toFixed(2);

            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 13px",
                background: isFree ? "#f0fdf4" : isPartial ? "#fffbeb" : i % 2 === 0 ? "#fafafa" : "white",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", flex: 1 }}>
                  {item.name}
                </span>
                <div style={{ textAlign: "right" }}>
                  {isFree ? (
                    <>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "#16a34a" }}>FREE</span>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#94a3b8", textDecoration: "line-through" }}>
                        ${item.price.toFixed(2)}
                      </div>
                    </>
                  ) : isPartial ? (
                    <>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: "#d97706" }}>
                        ${effPrice.toFixed(2)}
                      </span>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#fbbf24" }}>
                        −${item.discount.toFixed(2)} off
                      </div>
                    </>
                  ) : (
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Remainder row */}
          {unusedSubsidy > 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 13px",
              background: "linear-gradient(90deg,#fffbeb,#fef9ec)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={13} color="#d97706" />
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: "#92400e" }}>
                    Saved to Gift Wallet
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#b45309" }}>
                    Leftover free credit
                  </div>
                </div>
              </div>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#d97706" }}>
                +${unusedSubsidy.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </>
    );
  };

  // ── Pricing footer ────────────────────────────────────────────────────────
  const hasRemainder      = confirmed ? confirmed.unusedSubsidy > 0 : false;
  const effectiveBudget   = confirmed?.effectiveBudget ?? pkg.maxPrice;

  return (
    <>
      {dialogOpen && (
        <SubsidyDialog
          pkg={pkg}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleConfirm}
        />
      )}

      <div
        className="pack-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "white", borderRadius: 20,
          border: isSelected ? "2px solid #16a34a" : hovered ? "2px solid #bbf7d0" : "2px solid #f0fdf4",
          boxShadow: isSelected
            ? "0 12px 40px rgba(22,163,74,0.18),0 2px 8px rgba(0,0,0,0.06)"
            : hovered ? "0 16px 48px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.04)"
            : "0 2px 16px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", height: "100%",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          transform: visible
            ? hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)"
            : "translateY(24px) scale(0.97)",
          opacity: visible ? 1 : 0,
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: isSelected
            ? "linear-gradient(90deg,#16a34a,#4ade80)"
            : "linear-gradient(90deg,#dcfce7,#bbf7d0)",
          transition: "background 0.4s",
        }} />

        {isSelected && (
          <div style={{
            position: "absolute", top: 14, right: 14, width: 24, height: 24,
            background: "#16a34a", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(22,163,74,0.4)",
            animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <Check size={13} color="white" strokeWidth={3} />
          </div>
        )}

        <div style={{ padding: "24px 22px 0" }}>
          {/* Title */}
          <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            marginBottom: 6, paddingRight: isSelected ? 36 : 0, transition: "padding 0.3s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isSelected ? "#dcfce7" : "#f0fdf4",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.3s",
              }}>
                <Package size={18} color={isSelected ? "#16a34a" : "#4ade80"} />
              </div>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
                {pkg.name}
              </span>
            </div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -0.5,
              color: confirmed && confirmed.effectiveBudget !== pkg.maxPrice ? "#d97706" : "#16a34a" }}>
              ${confirmed ? confirmed.effectiveBudget.toFixed(2) : pkg.maxPrice}
            </span>
          </div>

          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#64748b", fontSize: 13, margin: "0 0 14px", lineHeight: 1.6, minHeight: 42 }}>
            {pkg.description}
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <span style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 999,
              padding: "4px 12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
              fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 5,
            }}>
              <Tag size={11} /> +${subsidyBudget} free groceries
            </span>
            <span style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 999,
              padding: "4px 12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
              fontSize: 12, color: "#475569",
            }}>
              {pkg.items} items
            </span>
          </div>

          {renderItemsSection()}
        </div>

        <div style={{ flex: 1 }} />

        {/* Pricing footer */}
        <div style={{ padding: "14px 22px 0", borderTop: "1px solid #f1f5f9", marginTop: 14 }}>

          {confirmed ? (
            // ── POST-CONFIRM: show actual breakdown ──────────────────────────
            <>
              {/* Items total */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#94a3b8" }}>Items you picked</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#475569" }}>
                  ${confirmed.items.reduce((s, i) => s + i.price, 0).toFixed(2)}
                </span>
              </div>

              {/* Free credit used */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: hasRemainder ? 5 : 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#94a3b8" }}>Free credit used</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#16a34a", fontWeight: 700 }}>
                  −${confirmed.subsidyUsed.toFixed(2)}
                </span>
              </div>

              {/* Remainder row — only if unused subsidy */}
              {hasRemainder && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 10, padding: "7px 11px",
                  background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Zap size={12} color="#d97706" />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                      Saved to gift wallet
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, color: "#d97706", fontWeight: 700 }}>
                    +${confirmed.unusedSubsidy.toFixed(2)}
                  </span>
                </div>
              )}

              {/* You Pay box */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", transition: "background 0.3s",
              }}>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                    You Pay
                  </div>
                  {/* Breakdown subline: $21 pack + $2.87 items = $23.87 effective budget */}
                  {confirmed.youPay > 0 ? (
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#d97706", marginTop: 2, fontWeight: 600 }}>
                      ${pkg.maxPrice} pack + ${confirmed.youPay.toFixed(2)} extra = ${confirmed.effectiveBudget.toFixed(2)} total
                    </div>
                  ) : hasRemainder ? (
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#d97706", marginTop: 2, fontWeight: 600 }}>
                      ${pkg.maxPrice} + ${confirmed.unusedSubsidy.toFixed(2)} gift wallet = ${confirmed.effectiveBudget.toFixed(2)} total
                    </div>
                  ) : (
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                      All free credit used ✓
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  {/* Show $21 struck through only when effective budget is different */}
                  {confirmed.effectiveBudget !== pkg.maxPrice ? (
                    <>
                      <div style={{
                        fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15,
                        color: "#94a3b8", letterSpacing: -0.5, textDecoration: "line-through",
                      }}>
                        ${pkg.maxPrice}
                      </div>
                      <div style={{
                        fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22,
                        color: "#d97706", letterSpacing: -0.5,
                      }}>
                        ${confirmed.effectiveBudget.toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#16a34a", letterSpacing: -0.5 }}>
                      ${pkg.maxPrice}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            // ── PRE-CONFIRM: show static pack info ───────────────────────────
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#94a3b8" }}>Pack Price</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#475569" }}>${pkg.maxPrice}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#94a3b8" }}>Free Credit</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#16a34a", fontWeight: 700 }}>+${subsidyBudget}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#fafafa", borderRadius: 10, padding: "12px 14px",
              }}>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>You Pay</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                    + pick ${subsidyBudget} of free items
                  </div>
                </div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#16a34a", letterSpacing: -0.5 }}>
                  ${pkg.maxPrice}
                </span>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "14px 22px 22px" }}>
          <button
            onClick={() => isSelected ? handleDeselect() : setDialogOpen(true)}
            style={{
              width: "100%",
              background: isSelected ? "#f1f5f9" : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: isSelected ? "#64748b" : "white",
              border: isSelected ? "1.5px solid #e2e8f0" : "none",
              borderRadius: 12, padding: "15px 0",
              fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: isSelected ? "none" : "0 2px 8px rgba(34,197,94,0.25)",
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = isSelected ? "scale(1)" : "scale(1.02)"; }}
          >
            {isSelected
              ? "Remove This Pack"
              : <><ShoppingCart size={17} /> Choose This Pack — +${subsidyBudget} Free</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetPacks() {
  const [headerVisible,  setHeaderVisible]  = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        body{margin:0;background:#f8fafc;}
        .pack-grid{display:grid;gap:20px;width:100%;max-width:1380px;grid-template-columns:1fr;}
        @media(min-width:640px){.pack-grid{grid-template-columns:repeat(2,1fr);}}
        @media(min-width:1024px){.pack-grid{grid-template-columns:repeat(3,1fr);}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.7);}100%{opacity:1;transform:scale(1);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
        .back-btn:hover .back-icon{transform:translateX(-3px);}
        .back-icon{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);}
        .savings-pill{
          background:linear-gradient(90deg,#16a34a 0%,#4ade80 50%,#16a34a 100%);
          background-size:200% auto;animation:shimmer 3s linear infinite;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 20% 20%,rgba(220,252,231,0.6) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(187,247,208,0.4) 0%,transparent 50%)",
        pointerEvents: "none",
      }} />

      <main style={{
        minHeight: "100vh", position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "32px 16px 48px",
      }}>
        <div style={{
          width: "100%", maxWidth: 1380, display: "flex", alignItems: "center", marginBottom: 40,
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
                padding: "9px 16px", fontFamily: "'Sora',sans-serif", fontWeight: 600,
                fontSize: 13, color: "#334155", cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.color = "#16a34a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
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
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, color: "#15803d", letterSpacing: 0.4, textTransform: "uppercase" }}>
              App Exclusive
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 800,
            fontSize: "clamp(26px,4vw,38px)", color: "#0f172a",
            margin: "0 0 12px", letterSpacing: -0.8, lineHeight: 1.15,
          }}>
            Budget Grocery Packs
          </h1>

          <p style={{
            fontFamily: "'DM Sans',sans-serif", color: "#64748b",
            fontSize: "clamp(14px,2vw,16px)", margin: "0 auto 16px",
            maxWidth: 540, lineHeight: 1.7,
          }}>
            Pay for a grocery pack and get upto {" "}
            <span className="savings-pill">30% back</span>
            {" "}as free groceries on top. Unused credit boosts your spending power automatically.
          </p>

          <div style={{
            display: "inline-flex", gap: 0,
            background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
            padding: "10px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            {[
              { step: "1", label: "Pick a pack" },
              { step: "2", label: "Pick your free items" },
              { step: "3", label: "Unused credit → more budget" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: "#16a34a", color: "white",
                    fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {s.step}
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#334155" }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <ChevronRight size={14} color="#cbd5e1" style={{ margin: "0 6px" }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="pack-grid">
          {packages.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              isSelected={selectedPackId === pkg.id}
              onSelect={(id) => setSelectedPackId(prev => prev === id ? null : id)}
            />
          ))}
        </div>
      </main>
    </>
  );
}