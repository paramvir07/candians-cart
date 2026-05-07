"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Check,
  Sparkles,
  Tag,
  X,
  Info,
  ChevronRight,
  Gift,
  Pencil,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBSIDY_RATE = 0.21;

// ─── Data ─────────────────────────────────────────────────────────────────────

const packages = [
  {
    id: 1,
    name: "Budget Pack 1",
    maxPrice: 21,
    description:
      "Buy $21 of groceries, get $4.41 in free gift credit to use on subsidized items.",
    items: 4,
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
    description:
      "Buy $34 of groceries, get $7.14 in free gift credit — more you spend, more you save.",
    items: 6,
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
    description:
      "Buy $55 of groceries, get $11.55 free — great for families stocking up for the week.",
    items: 7,
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
  {
    id: 4,
    name: "Budget Pack 4",
    maxPrice: 89,
    description:
      "Buy $89 of groceries, get $18.69 free — ideal for larger families.",
    items: 10,
    combo: [
      { name: "Flour 20 lb", price: 16.99 },
      { name: "Milk 1 gallon", price: 5.99 },
      { name: "Yogurt 1500g", price: 7.99 },
      { name: "Paneer 400g", price: 5.49 },
      { name: "Potatoes 10 lb", price: 4.99 },
      { name: "Chili 1 lb", price: 1.99 },
      { name: "Eggs 18pk", price: 6.49 },
      { name: "Basmati Rice 10lb", price: 12.99 },
      { name: "Cauliflower", price: 3.49 },
      { name: "Onion 10 lb", price: 5.49 },
      { name: "Tomatoes 3 lb", price: 7.29 },
      { name: "Cooking Oil 2L", price: 9.8 },
    ],
  },
  {
    id: 5,
    name: "Budget Pack 5",
    maxPrice: 144,
    description:
      "Buy $144 of groceries, get $30.24 free — bulk staples to last the whole month.",
    items: 14,
    combo: [
      { name: "Flour 20 lb", price: 16.99 },
      { name: "Milk (2×)", price: 11.98 },
      { name: "Yogurt 1500g", price: 7.99 },
      { name: "Paneer 400g (2×)", price: 10.98 },
      { name: "Red Onion 25 lb", price: 10.99 },
      { name: "Potatoes 10 lb", price: 4.99 },
      { name: "Desi Ghee 800g", price: 17.99 },
      { name: "Eggs 18pk", price: 6.49 },
      { name: "Basmati Rice 10lb", price: 12.99 },
      { name: "Chili 2 lb", price: 3.49 },
      { name: "Cooking Oil 2L", price: 9.99 },
      { name: "Cauliflower (2×)", price: 6.98 },
      { name: "Tomatoes 5 lb", price: 9.99 },
      { name: "Lentils 4 lb", price: 12.16 },
    ],
  },
  {
    id: 6,
    name: "Budget Pack 6",
    maxPrice: 233,
    description:
      "Buy $233 of groceries, get $48.93 free — the biggest pack with the most savings.",
    items: 20,
    combo: [
      { name: "Desi Ghee 1.6 kg", price: 34.99 },
      { name: "Flour 20 lb (2×)", price: 33.98 },
      { name: "Milk (3×)", price: 17.97 },
      { name: "Yogurt 1500g (2×)", price: 15.98 },
      { name: "Paneer 400g (3×)", price: 16.47 },
      { name: "Potatoes 10 lb", price: 4.99 },
      { name: "Red Onion 25 lb", price: 10.99 },
      { name: "Eggs 18pk (2×)", price: 12.98 },
      { name: "Basmati Rice 20lb", price: 25.99 },
      { name: "Cooking Oil 4L", price: 17.99 },
      { name: "Lentils 8 lb", price: 15.99 },
      { name: "Chili 2 lb", price: 3.49 },
      { name: "Tomatoes 5 lb", price: 9.99 },
      { name: "Cauliflower (2×)", price: 6.99 },
      { name: "Chickpeas 4 lb", price: 4.21 },
    ],
  },
];

const creditTiers = [
  { spend: 21, credit: 4.41 },
  { spend: 34, credit: 7.14 },
  { spend: 55, credit: 11.55 },
  { spend: 89, credit: 18.69 },
  { spend: 144, credit: 30.24 },
  { spend: 233, credit: 48.93 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmedSelection {
  items: { name: string; price: number; discount: number }[];
  subsidyUsed: number;
  unusedSubsidy: number;
  youPay: number;
  // effectiveBudget removed — customer always pays pkg.maxPrice
}

// ─── Allocator ────────────────────────────────────────────────────────────────

function allocateSubsidy(
  combo: { name: string; price: number }[],
  checked: boolean[],
  budget: number,
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
  const selectedTotal = combo.reduce(
    (s, item, i) => (checked[i] ? s + item.price : s),
    0,
  );
  const youPay = +(selectedTotal - subsidyUsed).toFixed(2);

  return {
    subsidyUsed: +subsidyUsed.toFixed(2),
    unusedSubsidy,
    youPay,
    itemDiscount,
  };
}

// ─── CreditTierTable ──────────────────────────────────────────────────────────

function CreditTierTable() {
  return (
    <div
      style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
          borderBottom: "1px solid #bbf7d0",
        }}
      >
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#15803d",
          }}
        >
          How much gift credit do I get?
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          You keep ~21% of what you spend
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 1,
          background: "#bbf7d0",
        }}
      >
        {creditTiers.map((tier, i) => (
          <div
            key={i}
            style={{
              background: "#f0fdf4",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              You spend
            </span>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: "#0f172a",
              }}
            >
              ${tier.spend}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#dcfce7",
                borderRadius: 999,
                padding: "3px 10px",
                marginTop: 2,
              }}
            >
              <Gift size={10} color="#16a34a" />
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#16a34a",
                }}
              >
                +${tier.credit.toFixed(2)} free
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 18px",
          borderTop: "1px solid #bbf7d0",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Zap size={13} color="#d97706" />
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            color: "#92400e",
            fontWeight: 500,
          }}
        >
          Gift credit you don't use is saved to your Gift Wallet — it never
          disappears.
        </span>
      </div>
    </div>
  );
}

// ─── HowItWorksExplainer ──────────────────────────────────────────────────────

function HowItWorksExplainer() {
  const steps = [
    {
      icon: <ShoppingCart size={20} color="#16a34a" />,
      title: "Shop for $21 or more",
      body: "Buy any regular grocery items worth at least $21. The more you buy, the bigger your gift credit.",
    },
    {
      icon: <Gift size={20} color="#16a34a" />,
      title: "Get free gift credit",
      body: "The app gives you back about 21% of what you spent as gift credit. Spend $21 → get $4.41 free. Spend more → get more.",
    },
    {
      icon: <Tag size={20} color="#16a34a" />,
      title: "Use it on subsidized items",
      body: "Pick items like milk, eggs, flour, vegetables and more — the app pays for them using your gift credit. Any leftover credit is saved in your Gift Wallet for next time.",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1380,
        background: "white",
        borderRadius: 20,
        border: "2px solid #dcfce7",
        padding: "28px 28px 24px",
        marginBottom: 20,
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <Sparkles size={16} color="#16a34a" />
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 800,
            fontSize: 17,
            color: "#0f172a",
          }}
        >
          How Budget Packs work
        </span>
      </div>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14,
          color: "#64748b",
          margin: "0 0 22px",
          lineHeight: 1.6,
        }}
      >
        It's simple — shop for groceries, get free money back, and use it to pay
        less.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#f8fafc",
              borderRadius: 14,
              border: "1px solid #f1f5f9",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#16a34a",
                  color: "white",
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 800,
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
            </div>
            <p
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {s.title}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                color: "#64748b",
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <CreditTierTable />
    </div>
  );
}

// ─── DialogHeader ─────────────────────────────────────────────────────────────

function DialogHeader({
  pkgName,
  subsidyBudget,
  onClose,
}: {
  pkgName: string;
  subsidyBudget: number;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderBottom: "1px solid #f1f5f9",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Gift size={18} color="#16a34a" />
        </div>
        <div>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: 17,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Pick items to use your gift credit on
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              color: "#64748b",
              margin: "2px 0 0",
            }}
          >
            {pkgName} · Your gift credit:{" "}
            <strong style={{ color: "#16a34a" }}>${subsidyBudget}</strong>
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          background: "#f1f5f9",
          border: "none",
          borderRadius: 8,
          width: 30,
          height: 30,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── DialogInfoBanner ─────────────────────────────────────────────────────────

function DialogInfoBanner({ subsidyBudget }: { subsidyBudget: number }) {
  return (
    <div
      style={{
        padding: "12px 24px",
        background: "#f0fdf4",
        borderBottom: "1px solid #dcfce7",
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <Info size={14} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 13,
          color: "#15803d",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        You have <strong>${subsidyBudget} gift credit</strong>. Tick the items
        below that you want — we will pay for them using your credit. Any credit
        left over will be saved in your <strong>Gift Wallet</strong> for next
        time.
      </p>
    </div>
  );
}

// ─── DialogBudgetBar ──────────────────────────────────────────────────────────

function DialogBudgetBar({
  subsidyUsed,
  subsidyBudget,
  unusedSubsidy,
}: {
  subsidyUsed: number;
  subsidyBudget: number;
  unusedSubsidy: number;
}) {
  return (
    <div
      style={{
        padding: "14px 24px",
        background: "#fafafa",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 7,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Gift credit used so far
        </span>
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#16a34a",
          }}
        >
          ${subsidyUsed}{" "}
          <span style={{ color: "#94a3b8", fontWeight: 500 }}>
            of ${subsidyBudget}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 999,
          background: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, (subsidyUsed / subsidyBudget) * 100)}%`,
            background: "linear-gradient(90deg,#4ade80,#16a34a)",
            borderRadius: 999,
            transition: "width 0.35s cubic-bezier(0.34,1.2,0.64,1)",
          }}
        />
      </div>

      {unusedSubsidy > 0 ? (
        <div
          style={{
            marginTop: 8,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "flex-start",
            gap: 7,
          }}
        >
          <Zap
            size={13}
            color="#d97706"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              color: "#92400e",
              margin: 0,
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            <strong>${unusedSubsidy.toFixed(2)} still unused.</strong> Pick more
            items to use it — or it will be saved to your Gift Wallet for next
            time.
          </p>
        </div>
      ) : (
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            color: "#16a34a",
            margin: "6px 0 0",
            fontWeight: 600,
          }}
        >
          All gift credit used ✓
        </p>
      )}
    </div>
  );
}

// ─── DialogItemRow ────────────────────────────────────────────────────────────

function DialogItemRow({
  item,
  checked,
  discount,
  onToggle,
}: {
  item: { name: string; price: number };
  checked: boolean;
  discount: number;
  onToggle: () => void;
}) {
  const isFree = checked && discount >= item.price - 0.001;
  const isPartial = checked && discount > 0 && !isFree;
  const effectivePrice = +(item.price - discount).toFixed(2);

  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "11px 14px",
        borderRadius: 10,
        marginBottom: 4,
        cursor: "pointer",
        background: isFree
          ? "#f0fdf4"
          : isPartial
            ? "#fffbeb"
            : checked
              ? "#f0fdf4"
              : "white",
        border: `1.5px solid ${isFree ? "#bbf7d0" : isPartial ? "#fde68a" : checked ? "#bbf7d0" : "#f1f5f9"}`,
        transition: "all 0.18s ease",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: checked ? "#16a34a" : "white",
          border: `2px solid ${checked ? "#16a34a" : "#cbd5e1"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s",
          marginRight: 12,
        }}
      >
        {checked && <Check size={12} color="white" strokeWidth={3} />}
      </div>
      <span
        style={{
          flex: 1,
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14,
          color: checked ? "#0f172a" : "#94a3b8",
          transition: "color 0.2s",
        }}
      >
        {item.name}
      </span>
      <div style={{ textAlign: "right" }}>
        {isFree ? (
          <>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: "#16a34a",
              }}
            >
              FREE
            </span>
            <div
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 10,
                color: "#94a3b8",
                textDecoration: "line-through",
                marginTop: 1,
              }}
            >
              ${item.price.toFixed(2)}
            </div>
          </>
        ) : isPartial ? (
          <>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#d97706",
              }}
            >
              ${effectivePrice.toFixed(2)}
            </span>
            <div
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 10,
                color: "#fbbf24",
                marginTop: 1,
              }}
            >
              −${discount.toFixed(2)} off
            </div>
          </>
        ) : (
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            ${item.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── DialogItemList ───────────────────────────────────────────────────────────

function DialogItemList({
  combo,
  checked,
  itemDiscount,
  onToggle,
  onToggleAll,
}: {
  combo: { name: string; price: number }[];
  checked: boolean[];
  itemDiscount: number[];
  onToggle: (i: number) => void;
  onToggleAll: () => void;
}) {
  const allChecked = checked.every(Boolean);

  return (
    <div style={{ overflowY: "auto", flex: 1, padding: "12px 24px 0" }}>
      {/* Select all */}
      <div
        onClick={onToggleAll}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#f8fafc",
          borderRadius: 10,
          marginBottom: 8,
          cursor: "pointer",
          border: "1px solid #e2e8f0",
        }}
      >
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#334155",
          }}
        >
          Select all items
        </span>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: allChecked ? "#16a34a" : "white",
            border: `2px solid ${allChecked ? "#16a34a" : "#cbd5e1"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          {allChecked && <Check size={12} color="white" strokeWidth={3} />}
        </div>
      </div>

      {combo.map((item, i) => (
        <DialogItemRow
          key={i}
          item={item}
          checked={checked[i]}
          discount={itemDiscount[i]}
          onToggle={() => onToggle(i)}
        />
      ))}

      {/* Browse all subsidized products */}
      <Link
        href="/customer/budget-packs/subsidy-items"
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            margin: "8px 0 4px",
            padding: "11px 14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={14} color="#16a34a" />
            <div>
              <div
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#15803d",
                }}
              >
                Browse all subsidized products
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 1,
                }}
              >
                See the full list of items you can use gift credit on
              </div>
            </div>
          </div>
          <ChevronRight size={15} color="#16a34a" />
        </div>
      </Link>
      <div style={{ height: 12 }} />
    </div>
  );
}

// ─── DialogSummaryFooter ──────────────────────────────────────────────────────

function DialogSummaryFooter({
  subsidyUsed,
  unusedSubsidy,
  youPay,
  allUnchecked,
  onClose,
  onConfirm,
}: {
  subsidyUsed: number;
  unusedSubsidy: number;
  youPay: number;
  allUnchecked: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      style={{
        padding: "16px 24px 22px",
        borderTop: "1px solid #f1f5f9",
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: unusedSubsidy > 0 ? 3 : 10,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          Gift credit used
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: "#16a34a",
            fontWeight: 600,
          }}
        >
          −${subsidyUsed.toFixed(2)}
        </span>
      </div>
      {unusedSubsidy > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            Saved to Gift Wallet
          </span>
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13,
              color: "#d97706",
              fontWeight: 600,
            }}
          >
            ${unusedSubsidy.toFixed(2)}
          </span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f0fdf4",
          borderRadius: 10,
          padding: "10px 14px",
          margin: "0 0 14px",
        }}
      >
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#0f172a",
          }}
        >
          You pay for these items
        </span>
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#16a34a",
            letterSpacing: -0.5,
          }}
        >
          ${youPay.toFixed(2)}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "13px 0",
            background: "white",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            fontFamily: "'Sora',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 2,
            padding: "13px 0",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            border: "none",
            borderRadius: 12,
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
            transition: "all 0.2s",
          }}
        >
          <Check size={15} strokeWidth={2.5} />
          {allUnchecked ? "Save all to Gift Wallet" : "Confirm Selection"}
        </button>
      </div>
    </div>
  );
}

// ─── SubsidyDialog ────────────────────────────────────────────────────────────

function SubsidyDialog({
  pkg,
  onClose,
  onConfirm,
  initialChecked,
}: {
  pkg: (typeof packages)[0];
  onClose: () => void;
  onConfirm: (selection: ConfirmedSelection) => void;
  initialChecked?: boolean[];
}) {
  const packTotal = pkg.combo.reduce((s, i) => s + i.price, 0);
  const subsidyBudget = +(packTotal * SUBSIDY_RATE).toFixed(2);
  const [checked, setChecked] = useState<boolean[]>(
    initialChecked ?? pkg.combo.map(() => false),
  );

  const { subsidyUsed, unusedSubsidy, youPay, itemDiscount } = allocateSubsidy(
    pkg.combo,
    checked,
    subsidyBudget,
  );

  const toggle = (i: number) =>
    setChecked((prev) => {
      const n = [...prev];
      n[i] = !n[i];
      return n;
    });

  const toggleAll = () => {
    const allOn = checked.every(Boolean);
    setChecked(pkg.combo.map(() => !allOn));
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    const items = pkg.combo
      .map((item, i) => ({
        name: item.name,
        price: item.price,
        discount: itemDiscount[i],
      }))
      .filter((_, i) => checked[i]);
    // effectiveBudget intentionally omitted — customer always pays pkg.maxPrice
    onConfirm({ items, subsidyUsed, unusedSubsidy, youPay });
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22),0 4px 16px rgba(0,0,0,0.08)",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
        }}
      >
        <DialogHeader
          pkgName={pkg.name}
          subsidyBudget={subsidyBudget}
          onClose={onClose}
        />
        <DialogInfoBanner subsidyBudget={subsidyBudget} />
        <DialogBudgetBar
          subsidyUsed={subsidyUsed}
          subsidyBudget={subsidyBudget}
          unusedSubsidy={unusedSubsidy}
        />
        <DialogItemList
          combo={pkg.combo}
          checked={checked}
          itemDiscount={itemDiscount}
          onToggle={toggle}
          onToggleAll={toggleAll}
        />
        <DialogSummaryFooter
          subsidyUsed={subsidyUsed}
          unusedSubsidy={unusedSubsidy}
          youPay={youPay}
          allUnchecked={checked.every((v) => !v)}
          onClose={onClose}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}

// ─── CardItemsSection (unconfirmed state) ─────────────────────────────────────

function CardItemsDefault({
  pkg,
  subsidyBudget,
}: {
  pkg: (typeof packages)[0];
  subsidyBudget: number;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Gift size={14} color="#16a34a" />
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#15803d",
          }}
        >
          Items you can use your gift credit on
        </span>
      </div>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 13,
          color: "#64748b",
          margin: "0 0 10px",
          lineHeight: 1.6,
        }}
      >
        Tap <strong style={{ color: "#0f172a" }}>"Pick Items"</strong> and
        choose which ones you want covered by your{" "}
        <strong style={{ color: "#15803d" }}>
          ${subsidyBudget} gift credit
        </strong>
        . Whatever you don't use is saved to your Gift Wallet.
      </p>
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #f1f5f9",
        }}
      >
        {pkg.combo.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "9px 13px",
              background: i % 2 === 0 ? "#fafafa" : "white",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
              color: "#374151",
              borderBottom:
                i < pkg.combo.length - 1 ? "1px solid #f1f5f9" : "none",
            }}
          >
            <span>{item.name}</span>
            <span style={{ color: "#16a34a", fontWeight: 600 }}>
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <Link
        href="/customer/budget-packs/subsidy-items"
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Tag size={13} color="#16a34a" />
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#15803d",
              }}
            >
              Browse all subsidized products
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              color: "#16a34a",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              See full list
            </span>
            <ChevronRight size={13} />
          </div>
        </div>
      </Link>
    </>
  );
}

// ─── CardItemsConfirmed ───────────────────────────────────────────────────────

function CardItemsConfirmed({
  confirmed,
  onEdit,
}: {
  confirmed: ConfirmedSelection;
  onEdit: () => void;
}) {
  const { items, unusedSubsidy } = confirmed;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Check size={14} color="#16a34a" />
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#15803d",
            }}
          >
            Items paid by gift credit ({items.length})
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          <Pencil size={11} />
          Edit
        </button>
      </div>

      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #f1f5f9",
        }}
      >
        {items.map((item, i) => {
          const isFree = item.discount >= item.price - 0.001;
          const isPartial = item.discount > 0 && !isFree;
          const effPrice = +(item.price - item.discount).toFixed(2);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 13px",
                background: isFree
                  ? "#f0fdf4"
                  : isPartial
                    ? "#fffbeb"
                    : i % 2 === 0
                      ? "#fafafa"
                      : "white",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  color: "#374151",
                  flex: 1,
                }}
              >
                {item.name}
              </span>
              <div style={{ textAlign: "right" }}>
                {isFree ? (
                  <>
                    <span
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontWeight: 800,
                        fontSize: 12,
                        color: "#16a34a",
                      }}
                    >
                      FREE
                    </span>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 10,
                        color: "#94a3b8",
                        textDecoration: "line-through",
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </div>
                  </>
                ) : isPartial ? (
                  <>
                    <span
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#d97706",
                      }}
                    >
                      ${effPrice.toFixed(2)}
                    </span>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 10,
                        color: "#fbbf24",
                      }}
                    >
                      −${item.discount.toFixed(2)} off
                    </div>
                  </>
                ) : (
                  <span
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 13,
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {unusedSubsidy > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 13px",
              background: "#fffbeb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={13} color="#d97706" />
              <div>
                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#92400e",
                  }}
                >
                  Saved to Gift Wallet
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 11,
                    color: "#b45309",
                  }}
                >
                  Use it on your next order
                </div>
              </div>
            </div>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: "#d97706",
              }}
            >
              +${unusedSubsidy.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CardPricingFooter ────────────────────────────────────────────────────────

function CardPricingFooter({
  pkg,
  confirmed,
  subsidyBudget,
}: {
  pkg: (typeof packages)[0];
  confirmed: ConfirmedSelection | null;
  subsidyBudget: number;
}) {
  if (!confirmed) {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            You pay at the store
          </span>
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#0f172a",
              letterSpacing: -0.5,
            }}
          >
            ${pkg.maxPrice}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Gift size={15} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <div
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#15803d",
                }}
              >
                Gift credit added to your wallet
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 2,
                }}
              >
                Use it to get free items now or save for later
              </div>
            </div>
          </div>
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#16a34a",
              letterSpacing: -0.5,
            }}
          >
            +${subsidyBudget}
          </span>
        </div>
      </>
    );
  }

  // ── Confirmed state ──
  // Customer ALWAYS pays pkg.maxPrice. Gift wallet savings are separate.
  const { subsidyUsed, unusedSubsidy } = confirmed;
  const hasRemainder = unusedSubsidy > 0;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#94a3b8",
          }}
        >
          Items you picked
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#475569",
          }}
        >
          ${confirmed.items.reduce((s, i) => s + i.price, 0).toFixed(2)}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: hasRemainder ? 5 : 10,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#94a3b8",
          }}
        >
          Gift credit used
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#16a34a",
            fontWeight: 700,
          }}
        >
          −${subsidyUsed.toFixed(2)}
        </span>
      </div>
      {hasRemainder && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            padding: "7px 11px",
            background: "#fffbeb",
            borderRadius: 8,
            border: "1px solid #fde68a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Zap size={12} color="#d97706" />
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                color: "#92400e",
                fontWeight: 600,
              }}
            >
              Saved to Gift Wallet
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 13,
              color: "#d97706",
              fontWeight: 700,
            }}
          >
            +${unusedSubsidy.toFixed(2)}
          </span>
        </div>
      )}

      {/* You Pay — always pkg.maxPrice */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f0fdf4",
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#0f172a",
            }}
          >
            You Pay
          </div>
          <div
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 11,
              color: "#94a3b8",
              marginTop: 1,
            }}
          >
            {subsidyUsed > 0
              ? `Gift credit covers $${subsidyUsed.toFixed(2)} of your items ✓`
              : hasRemainder
                ? `$${unusedSubsidy.toFixed(2)} gift credit saved to wallet`
                : "All gift credit used ✓"}
          </div>
        </div>
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#16a34a",
            letterSpacing: -0.5,
          }}
        >
          ${pkg.maxPrice}
        </span>
      </div>
    </>
  );
}

// ─── PackageCard ──────────────────────────────────────────────────────────────

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
  const packTotal = pkg.combo.reduce((s, i) => s + i.price, 0);
  const subsidyBudget = +(packTotal * SUBSIDY_RATE).toFixed(2);

  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedSelection | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 * index);
    return () => clearTimeout(t);
  }, [index]);

  const handleDeselect = () => {
    setConfirmed(null);
    onSelect(pkg.id);
  };

  const handleConfirm = (sel: ConfirmedSelection) => {
    setConfirmed(sel);
    setDialogOpen(false);
    if (!isSelected) onSelect(pkg.id);
  };

  return (
    <>
      {dialogOpen && (
        <SubsidyDialog
          pkg={pkg}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleConfirm}
          initialChecked={
            confirmed
              ? pkg.combo.map((item) =>
                  confirmed.items.some((ci) => ci.name === item.name),
                )
              : undefined
          }
        />
      )}

      <div
        className="pack-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "white",
          borderRadius: 20,
          border: isSelected
            ? "2px solid #16a34a"
            : hovered
              ? "2px solid #bbf7d0"
              : "2px solid #f0fdf4",
          boxShadow: isSelected
            ? "0 12px 40px rgba(22,163,74,0.18),0 2px 8px rgba(0,0,0,0.06)"
            : hovered
              ? "0 16px 48px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.04)"
              : "0 2px 16px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
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
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: isSelected
              ? "linear-gradient(90deg,#16a34a,#4ade80)"
              : "linear-gradient(90deg,#dcfce7,#bbf7d0)",
            transition: "background 0.4s",
          }}
        />

        {/* Selected checkmark */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 24,
              height: 24,
              background: "#16a34a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(22,163,74,0.4)",
              animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <Check size={13} color="white" strokeWidth={3} />
          </div>
        )}

        <div style={{ padding: "24px 22px 0" }}>
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 6,
              paddingRight: isSelected ? 36 : 0,
              transition: "padding 0.3s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: isSelected ? "#dcfce7" : "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.3s",
                }}
              >
                <Package size={18} color={isSelected ? "#16a34a" : "#4ade80"} />
              </div>
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  color: "#0f172a",
                }}
              >
                {pkg.name}
              </span>
            </div>
            {/* Price always shows pkg.maxPrice — customer never pays more */}
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: -0.5,
                color: "#16a34a",
              }}
            >
              ${pkg.maxPrice}
            </span>
          </div>

          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "#64748b",
              fontSize: 13,
              margin: "0 0 14px",
              lineHeight: 1.6,
              minHeight: 42,
            }}
          >
            {pkg.description}
          </p>

          {/* Gift credit pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#f0fdf4",
              border: "1.5px solid #86efac",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <Gift size={15} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#16a34a",
                }}
              >
                +${subsidyBudget} gift credit
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 12,
                  color: "#64748b",
                  marginLeft: 6,
                }}
              >
                — use it to get items for free
              </span>
            </div>
          </div>

          {/* Items section */}
          {confirmed ? (
            <CardItemsConfirmed
              confirmed={confirmed}
              onEdit={() => setDialogOpen(true)}
            />
          ) : (
            <CardItemsDefault pkg={pkg} subsidyBudget={subsidyBudget} />
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Pricing footer */}
        <div
          style={{
            padding: "14px 22px 0",
            borderTop: "1px solid #f1f5f9",
            marginTop: 14,
          }}
        >
          <CardPricingFooter
            pkg={pkg}
            confirmed={confirmed}
            subsidyBudget={subsidyBudget}
          />
        </div>

        {/* CTA */}
        <div style={{ padding: "14px 22px 22px" }}>
          <button
            onClick={() =>
              isSelected ? handleDeselect() : setDialogOpen(true)
            }
            style={{
              width: "100%",
              background: isSelected
                ? "#f1f5f9"
                : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: isSelected ? "#64748b" : "white",
              border: isSelected ? "1.5px solid #e2e8f0" : "none",
              borderRadius: 12,
              padding: "15px 0",
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: isSelected ? "none" : "0 2px 8px rgba(34,197,94,0.25)",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = isSelected
                ? "scale(1)"
                : "scale(1.02)";
            }}
          >
            {isSelected ? (
              "Remove This Pack"
            ) : (
              <>
                <Gift size={17} /> Pick Items — ${subsidyBudget} gift credit
                included
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetPacks() {
  const [headerVisible, setHeaderVisible] = useState(false);
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
        .back-btn:hover .back-icon{transform:translateX(-3px);}
        .back-icon{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);}
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 20%,rgba(220,252,231,0.6) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(187,247,208,0.4) 0%,transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <main
        style={{
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 16px 48px",
        }}
      >
        {/* Back button */}
        <div
          style={{
            width: "100%",
            maxWidth: 1380,
            display: "flex",
            alignItems: "center",
            marginBottom: 32,
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(-12px)",
            transition: "all 0.5s cubic-bezier(0.34,1.2,0.64,1)",
          }}
        >
          <Link href="/customer" style={{ textDecoration: "none" }}>
            <button
              className="back-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: "9px 16px",
                fontFamily: "'Sora',sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#334155",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#bbf7d0";
                e.currentTarget.style.color = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#334155";
              }}
            >
              <ArrowLeft size={15} className="back-icon" />
              Back
            </button>
          </Link>
        </div>

        {/* Hero */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.55s cubic-bezier(0.34,1.2,0.64,1) 0.1s",
          }}
        >
          <h1
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(26px,4vw,38px)",
              color: "#0f172a",
              margin: "0 0 10px",
              letterSpacing: -0.8,
              lineHeight: 1.15,
            }}
          >
            Budget Grocery Packs
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "#64748b",
              fontSize: "clamp(14px,2vw,17px)",
              margin: "0 auto",
              maxWidth: 520,
              lineHeight: 1.7,
            }}
          >
            Shop for groceries and get{" "}
            <strong style={{ color: "#16a34a" }}>free gift credit</strong> back.
            Use that credit to pay for subsidized items — milk, eggs, vegetables
            and more.
          </p>
        </div>

        {/* How It Works Explainer */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.55s cubic-bezier(0.34,1.2,0.64,1) 0.15s",
          }}
        >
          <HowItWorksExplainer />
        </div>

        {/* Pack grid header */}
        <div
          style={{
            width: "100%",
            maxWidth: 1380,
            marginBottom: 12,
            opacity: headerVisible ? 1 : 0,
            transition: "opacity 0.4s ease 0.25s",
          }}
        >
          <p
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#0f172a",
              margin: "0 0 4px",
            }}
          >
            Choose how much you want to shop for
          </p>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13,
              color: "#64748b",
              margin: "0 0 16px",
            }}
          >
            Minimum $21. The more you spend, the more gift credit you get back.
          </p>
        </div>

        <div className="pack-grid">
          {packages.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              isSelected={selectedPackId === pkg.id}
              onSelect={(id) =>
                setSelectedPackId((prev) => (prev === id ? null : id))
              }
            />
          ))}
        </div>
      </main>
    </>
  );
}
