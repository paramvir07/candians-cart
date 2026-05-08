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
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import Link from "next/link";
import SubsidyItemsClient from "@/components/customer/budgetpacks/subsidyItemsClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubsidyItem {
  _id: string;
  name: string;
  category: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBSIDY_RATE = 0.21;
const FIB_BRACKETS = [21, 34, 55, 89, 144, 233];

function getFibBracket(spend: number): number {
  let bracket = 0;
  for (const b of FIB_BRACKETS) {
    if (spend >= b) bracket = b;
    else break;
  }
  return bracket;
}

/**
 * Given a base pack spend, unused subsidy, and the out-of-pocket amount for
 * subsidized items, rolls everything into effective spend and returns the
 * subsidy budget for the (potentially higher) Fibonacci bracket.
 */
function resolveSubsidyBudget(
  baseSpend: number,
  unusedSubsidy: number,
  youPay: number,
): number {
  const effectiveSpend = baseSpend + unusedSubsidy + youPay;
  const bracket = getFibBracket(effectiveSpend);
  return bracket > 0 ? +(bracket * SUBSIDY_RATE).toFixed(2) : 0;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const packages = [
  {
    id: 1,
    name: "Budget Pack 1",
    maxPrice: 21,
    description:
      "Buy $21 of groceries, get $4.41 in free gift subsidy to use on subsidized items.",
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
      "Buy $34 of groceries, get $7.14 in free gift subsidy — more you spend, more you save.",
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

const subsidyTiers = [
  { spend: 21, subsidy: 4.41 },
  { spend: 34, subsidy: 7.14 },
  { spend: 55, subsidy: 11.55 },
  { spend: 89, subsidy: 18.69 },
  { spend: 144, subsidy: 30.24 },
  { spend: 233, subsidy: 48.93 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmedSelection {
  items: { name: string; price: number; discount: number }[];
  subsidyUsed: number;
  unusedSubsidy: number;
  youPay: number;
  resolvedSubsidyBudget: number;
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

// ─── subsidyTierTable ──────────────────────────────────────────────────────────

function SubsidyTierTable() {
  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center px-4.5 py-3 border-b border-[#bbf7d0]">
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#15803d",
          }}
        >
          How much gift subsidy do I get?
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-px bg-[#bbf7d0]">
        {subsidyTiers.map((tier, i) => (
          <div
            key={i}
            className="bg-[#f0fdf4] p-[14px_14px] flex flex-col items-center text-center gap-0.75"
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
            <div className="flex items-center gap-1 bg-[#dcfce7] rounded-full px-2.5 py-0.75 mt-0.5">
              <Gift size={10} color="#16a34a" />
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#16a34a",
                }}
              >
                +${tier.subsidy.toFixed(2)} free
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-4.5 py-2.5 border-t border-[#bbf7d0]">
        <Zap size={13} color="#d97706" />
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            color: "#92400e",
            fontWeight: 500,
          }}
        >
          Gift subsidy you don't use is saved to your Gift Wallet — it never
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
      body: "Buy any regular grocery items worth at least $21. The more you buy, the bigger your gift subsidy.",
    },
    {
      icon: <Gift size={20} color="#16a34a" />,
      title: "Get free gift subsidy",
      body: "The app gives you back about 21% of what you spent as gift subsidy. Spend $21 → get $4.41 free. Spend more → get more.",
    },
    {
      icon: <Tag size={20} color="#16a34a" />,
      title: "Use it on subsidized items",
      body: "Pick items like milk, eggs, flour, vegetables and more — the app pays for them using your gift subsidy. Any leftover subsidy is saved in your Gift Wallet for next time.",
    },
  ];

  return (
    <div className="w-full max-w-345 bg-white rounded-[20px] border-2 border-[#dcfce7] p-[28px_28px_24px] mb-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2 mb-1.5">
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
        className="mb-5.5"
      >
        It's simple — shop for groceries, get free money back, and use it to pay
        less.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bg-[#f8fafc] rounded-2xl border border-[#f1f5f9] p-[16px_18px] flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="w-5.5 h-5.5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0"
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 800,
                  fontSize: 11,
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

      <SubsidyTierTable/>
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
    <div className="p-[22px_24px_18px] border-b border-[#f1f5f9] relative">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
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
            Pick items to use your gift subsidy on
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              color: "#64748b",
              margin: "2px 0 0",
            }}
          >
            {pkgName} · Your gift subsidy:{" "}
            <strong style={{ color: "#16a34a" }}>${subsidyBudget}</strong>
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-4.5 right-4.5 bg-[#f1f5f9] border-none rounded-lg w-7.5 h-7.5 cursor-pointer flex items-center justify-center text-[#64748b]"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── DialogInfoBanner ─────────────────────────────────────────────────────────

function DialogInfoBanner({ subsidyBudget }: { subsidyBudget: number }) {
  return (
    <div className="px-6 py-3 bg-[#f0fdf4] border-b border-[#dcfce7] flex gap-2 items-start">
      <Info size={14} color="#16a34a" className="mt-0.5 shrink-0" />
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 13,
          color: "#15803d",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        You have <strong>${subsidyBudget} gift subsidy</strong>. Tick the items
        below that you want — we will pay for them using your subsidy. Any subsidy
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
  baseSpend,
  youPay,
}: {
  subsidyUsed: number;
  subsidyBudget: number;
  unusedSubsidy: number;
  baseSpend: number;
  youPay: number;
}) {
  const resolvedBudget = resolveSubsidyBudget(baseSpend, unusedSubsidy, youPay);
  const bracketUpgrade = resolvedBudget > subsidyBudget;

  return (
    <div className="px-6 py-3.5 bg-[#fafafa] border-b border-[#f1f5f9]">
      <div className="flex justify-between mb-1.75">
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Gift subsidy used so far
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
      <div className="h-1.75 rounded-full bg-[#e2e8f0] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-350 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
          style={{
            width: `${Math.min(100, (subsidyUsed / subsidyBudget) * 100)}%`,
            background: "linear-gradient(90deg,#4ade80,#16a34a)",
          }}
        />
      </div>

      {unusedSubsidy > 0 || youPay > 0 ? (
        <div
          className={`mt-2 p-[8px_12px] rounded-lg flex items-start gap-1.75 border ${
            bracketUpgrade
              ? "bg-[#f0fdf4] border-[#86efac]"
              : "bg-[#fffbeb] border-[#fde68a]"
          }`}
        >
          {bracketUpgrade ? (
            <Sparkles size={13} color="#16a34a" className="mt-0.5 shrink-0" />
          ) : (
            <Zap size={13} color="#d97706" className="mt-0.5 shrink-0" />
          )}
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 12,
              margin: 0,
              lineHeight: 1.6,
              fontWeight: 500,
            }}
            className={bracketUpgrade ? "text-[#15803d]" : "text-[#92400e]"}
          >
            {bracketUpgrade ? (
              <>
                <strong>${(unusedSubsidy + youPay).toFixed(2)} extra</strong> rolls into your spend →{" "}
                effective spend becomes{" "}
                <strong>${(baseSpend + unusedSubsidy + youPay).toFixed(2)}</strong>, unlocking{" "}
                <strong style={{ color: "#16a34a" }}>${resolvedBudget} gift subsidy</strong> on confirm.
              </>
            ) : (
              <>
                <strong>${(unusedSubsidy + youPay).toFixed(2)} extra.</strong>{" "}
                {youPay > 0 && (
                  <>
                    ${youPay.toFixed(2)} out-of-pocket +{" "}
                  </>
                )}
                ${unusedSubsidy.toFixed(2)} unused — pick more
                items to use it, or save to your Gift Wallet.
              </>
            )}
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
          All gift subsidy used ✓
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
      className={`flex items-center p-[11px_14px] rounded-xl mb-1 cursor-pointer transition-all duration-180 ease-in-out border-[1.5px] ${
        isFree
          ? "bg-[#f0fdf4] border-[#bbf7d0]"
          : isPartial
          ? "bg-[#fffbeb] border-[#fde68a]"
          : checked
          ? "bg-[#f0fdf4] border-[#bbf7d0]"
          : "bg-white border-[#f1f5f9]"
      }`}
    >
      <div
        className={`w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center shrink-0 mr-3 transition-all duration-200 ${
          checked
            ? "bg-[#16a34a] border-[#16a34a]"
            : "bg-white border-[#cbd5e1]"
        }`}
      >
        {checked && <Check size={12} color="white" strokeWidth={3} />}
      </div>
      <span
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14,
        }}
        className={`flex-1 transition-colors duration-200 ${
          checked ? "text-[#0f172a]" : "text-[#94a3b8]"
        }`}
      >
        {item.name}
      </span>
      <div className="text-right">
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
  onBrowseAll,
}: {
  combo: { name: string; price: number }[];
  checked: boolean[];
  itemDiscount: number[];
  onToggle: (i: number) => void;
  onToggleAll: () => void;
  onBrowseAll: () => void;
}) {
  const allChecked = checked.every(Boolean);

  return (
    <div className="overflow-y-auto flex-1 pt-3 px-6">
      {/* Select all */}
      <div
        onClick={onToggleAll}
        className="flex items-center justify-between p-[10px_14px] bg-[#f8fafc] rounded-xl mb-2 cursor-pointer border border-[#e2e8f0]"
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
          className={`w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            allChecked ? "bg-[#16a34a] border-[#16a34a]" : "bg-white border-[#cbd5e1]"
          }`}
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

      {/* Browse all subsidized products - now switches to custom view */}
      <button
        onClick={onBrowseAll}
        className="w-full text-left no-underline my-2 p-[11px_14px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
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
              See the full list of items you can use gift subsidy on
            </div>
          </div>
        </div>
        <ChevronRight size={15} color="#16a34a" />
      </button>
      <div className="h-3" />
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
    <div className="p-[16px_24px_22px] border-t border-[#f1f5f9] bg-white">
      <div className={`flex justify-between ${unusedSubsidy > 0 ? "mb-0.75" : "mb-2.5"}`}>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          Gift subsidy used
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
        <div className="flex justify-between mb-2.5">
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
      <div className="flex justify-between items-center bg-[#f0fdf4] rounded-xl p-[10px_14px] mb-3.5">
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

      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "#64748b",
          }}
          className="flex-1 py-3.25 bg-white border-[1.5px] border-[#e2e8f0] rounded-xl cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "white",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
          }}
          className="flex-[2] py-3.25 border-none rounded-xl cursor-pointer flex items-center justify-center gap-1.75 transition-all duration-200"
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
  overrideSubsidyBudget,
  onBrowseAll,
}: {
  pkg: (typeof packages)[0];
  onClose: () => void;
  onConfirm: (selection: ConfirmedSelection) => void;
  initialChecked?: boolean[];
  overrideSubsidyBudget?: number;
  onBrowseAll: () => void;
}) {
  const packTotal = pkg.combo.reduce((s, i) => s + i.price, 0);
  const baseSubsidyBudget = +(packTotal * SUBSIDY_RATE).toFixed(2);
  const subsidyBudget = overrideSubsidyBudget ?? baseSubsidyBudget;

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

    const resolved = resolveSubsidyBudget(pkg.maxPrice, unusedSubsidy, youPay);

    onConfirm({
      items,
      subsidyUsed,
      unusedSubsidy,
      youPay,
      resolvedSubsidyBudget: resolved,
    });
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[9999] bg-[rgba(15,23,42,0.55)] backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-130 max-h-[90vh] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.08)] animate-[slideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
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
          baseSpend={pkg.maxPrice}
          youPay={youPay}
        />
        <DialogItemList
          combo={pkg.combo}
          checked={checked}
          itemDiscount={itemDiscount}
          onToggle={toggle}
          onToggleAll={toggleAll}
          onBrowseAll={onBrowseAll}
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

// ─── CardItemsDefault (unconfirmed state) ─────────────────────────────────────

function CardItemsDefault({
  pkg,
  subsidyBudget,
  onSwitchToCustomView,
}: {
  pkg: (typeof packages)[0];
  subsidyBudget: number;
  onSwitchToCustomView: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Gift size={14} color="#16a34a" />
        <span
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#15803d",
          }}
        >
          Items you can use your gift subsidy on
        </span>
      </div>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.6,
        }}
        className="mb-2.5"
      >
        Tap <strong style={{ color: "#0f172a" }}>"Pick Items"</strong> and
        choose which ones you want covered by your{" "}
        <strong style={{ color: "#15803d" }}>
          ${subsidyBudget} gift subsidy
        </strong>
        . Whatever you don't use is saved to your Gift Wallet.
      </p>
      <div className="rounded-xl overflow-hidden border border-[#f1f5f9]">
        {pkg.combo.map((item, i) => (
          <div
            key={i}
            className={`flex justify-between p-[9px_13px] ${
              i % 2 === 0 ? "bg-[#fafafa]" : "bg-white"
            } border-b border-[#f1f5f9] last:border-b-0`}
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
            }}
          >
            <span className="text-[#374151]">{item.name}</span>
            <span className="text-[#16a34a] font-semibold">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      {/* Browse all subsidized products - now a button to switch view */}
      <button
        onClick={onSwitchToCustomView}
        className="w-full text-left no-underline mt-2 p-[10px_14px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
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
        <div className="flex items-center gap-0.75 text-[#16a34a]">
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
      </button>
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
  const { items, unusedSubsidy, resolvedSubsidyBudget } = confirmed;
  const baseSubsidyBudget = confirmed.subsidyUsed + unusedSubsidy;
  const bracketUpgrade = resolvedSubsidyBudget > baseSubsidyBudget;

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Check size={14} color="#16a34a" />
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#15803d",
            }}
          >
            Items paid by gift subsidy ({items.length})
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-lg py-1 px-2.5 cursor-pointer"
          style={{
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

      <div className="rounded-xl overflow-hidden border border-[#f1f5f9]">
        {items.map((item, i) => {
          const isFree = item.discount >= item.price - 0.001;
          const isPartial = item.discount > 0 && !isFree;
          const effPrice = +(item.price - item.discount).toFixed(2);

          return (
            <div
              key={i}
              className={`flex justify-between items-center p-[9px_13px] border-b border-[#f1f5f9] ${
                isFree
                  ? "bg-[#f0fdf4]"
                  : isPartial
                  ? "bg-[#fffbeb]"
                  : i % 2 === 0
                  ? "bg-[#fafafa]"
                  : "bg-white"
              }`}
            >
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  color: "#374151",
                }}
                className="flex-1"
              >
                {item.name}
              </span>
              <div className="text-right">
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
            className={`flex justify-between items-center p-[10px_13px] ${
              bracketUpgrade ? "bg-[#f0fdf4]" : "bg-[#fffbeb]"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {bracketUpgrade ? (
                <Sparkles size={13} color="#16a34a" />
              ) : (
                <Zap size={13} color="#d97706" />
              )}
              <div>
                <div
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    color: bracketUpgrade ? "#15803d" : "#92400e",
                  }}
                >
                  {bracketUpgrade
                    ? `Bracket upgrade → $${resolvedSubsidyBudget} next time`
                    : "Saved to Gift Wallet"}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 11,
                    color: bracketUpgrade ? "#16a34a" : "#b45309",
                  }}
                >
                  {bracketUpgrade
                    ? `Unused $${unusedSubsidy.toFixed(2)} rolled into your spend`
                    : "Use it on your next order"}
                </div>
              </div>
            </div>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: bracketUpgrade ? "#16a34a" : "#d97706",
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
        <div className="flex justify-between items-center mb-2">
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
        <div className="flex justify-between items-center bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-[12px_14px]">
          <div className="flex items-center gap-2">
            <Gift size={15} color="#16a34a" className="shrink-0" />
            <div>
              <div
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#15803d",
                }}
              >
                Gift subsidy added to your wallet
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

  const { subsidyUsed, unusedSubsidy, resolvedSubsidyBudget, youPay } = confirmed;
  const baseSubsidyBudget = subsidyUsed + unusedSubsidy;
  const hasExtra = unusedSubsidy > 0 || youPay > 0;
  const bracketUpgrade = resolvedSubsidyBudget > baseSubsidyBudget;
  const totalStoreSpend = pkg.maxPrice + youPay;

  return (
    <>
      <div className="flex justify-between mb-1.5">
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#94a3b8",
          }}
        >
          Regular items (pack)
        </span>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#475569",
          }}
        >
          ${pkg.maxPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between mb-1.5">
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#94a3b8",
          }}
        >
          Subsidized items you picked
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
      <div className={`flex justify-between ${hasExtra ? "mb-1.5" : "mb-2.5"}`}>
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            color: "#94a3b8",
          }}
        >
          Gift subsidy used
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
      {hasExtra && (
        <div
          className={`flex justify-between items-center mb-2.5 p-[7px_11px] rounded-lg border ${
            bracketUpgrade
              ? "bg-[#f0fdf4] border-[#86efac]"
              : "bg-[#fffbeb] border-[#fde68a]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {bracketUpgrade ? (
              <Sparkles size={12} color="#16a34a" />
            ) : (
              <Zap size={12} color="#d97706" />
            )}
            <div>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "block",
                }}
                className={bracketUpgrade ? "text-[#15803d]" : "text-[#92400e]"}
              >
                {bracketUpgrade
                  ? `Bracket upgrade → $${resolvedSubsidyBudget} subsidy`
                  : "Extra / Saved"}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                {youPay > 0 && (
                  <>+${youPay.toFixed(2)} out-of-pocket </>
                )}
                {unusedSubsidy > 0 && (
                  <>+${unusedSubsidy.toFixed(2)} saved</>
                )}
                {bracketUpgrade && " → bumps your subsidy tier"}
              </span>
            </div>
          </div>
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 13,
              fontWeight: 700,
            }}
            className={bracketUpgrade ? "text-[#16a34a]" : "text-[#d97706]"}
          >
            +${(unusedSubsidy + youPay).toFixed(2)}
          </span>
        </div>
      )}

      {/* Total store spend – now includes youPay */}
      <div className="flex justify-between items-center bg-[#f0fdf4] rounded-xl p-[12px_14px]">
        <div>
          <div
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#0f172a",
            }}
          >
            Total store spend
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
              ? `Gift subsidy covers $${subsidyUsed.toFixed(2)} of your items ✓`
              : hasExtra
              ? `$${(unusedSubsidy + youPay).toFixed(2)} extra / saved`
              : "All gift subsidy used ✓"}
            {youPay > 0 && " · Includes $" + youPay.toFixed(2) + " for subsidized items"}
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
          ${totalStoreSpend.toFixed(2)}
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
  onSwitchToCustomView,
}: {
  pkg: (typeof packages)[0];
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onSwitchToCustomView: () => void;
}) {
  const packTotal = pkg.combo.reduce((s, i) => s + i.price, 0);
  const baseSubsidyBudget = +(packTotal * SUBSIDY_RATE).toFixed(2);

  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedSelection | null>(null);

  const activeSubsidyBudget = confirmed?.resolvedSubsidyBudget ?? baseSubsidyBudget;

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
          overrideSubsidyBudget={activeSubsidyBudget}
          initialChecked={
            confirmed
              ? pkg.combo.map((item) =>
                  confirmed.items.some((ci) => ci.name === item.name),
                )
              : undefined
          }
          onBrowseAll={() => {
            setDialogOpen(false);
            onSwitchToCustomView();
          }}
        />
      )}

      <div
        className="pack-card flex flex-col h-full overflow-hidden relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "white",
          borderRadius: 20,
          borderWidth: 2,
          borderColor: isSelected
            ? "#16a34a"
            : hovered
            ? "#bbf7d0"
            : "#f0fdf4",
          boxShadow: isSelected
            ? "0 12px 40px rgba(22,163,74,0.18),0 2px 8px rgba(0,0,0,0.06)"
            : hovered
            ? "0 16px 48px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.04)"
            : "0 2px 16px rgba(0,0,0,0.06)",
          transform: visible
            ? hovered
              ? "translateY(-4px) scale(1.01)"
              : "translateY(0) scale(1)"
            : "translateY(24px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.75 transition-[background] duration-300"
          style={{
            background: isSelected
              ? "linear-gradient(90deg,#16a34a,#4ade80)"
              : "linear-gradient(90deg,#dcfce7,#bbf7d0)",
          }}
        />

        {/* Selected checkmark */}
        {isSelected && (
          <div
            className="absolute top-3.5 right-3.5 w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(22,163,74,0.4)] animate-[popIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
          >
            <Check size={13} color="white" strokeWidth={3} />
          </div>
        )}

        <div className="px-5.5 pt-6">
          {/* Card header */}
          <div
            className={`flex items-start justify-between mb-1.5 transition-all duration-300 ${
              isSelected ? "pr-9" : "pr-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-[background] duration-300 ${
                  isSelected ? "bg-[#dcfce7]" : "bg-[#f0fdf4]"
                }`}
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
              lineHeight: 1.6,
              minHeight: 42,
            }}
            className="mb-3.5"
          >
            {pkg.description}
          </p>

          {/* Gift subsidy pill */}
          <div className="flex items-center gap-1.5 bg-[#f0fdf4] border-[1.5px] border-[#86efac] rounded-xl p-[10px_14px] mb-4">
            <Gift size={15} color="#16a34a" className="shrink-0" />
            <div>
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#16a34a",
                }}
              >
                +${activeSubsidyBudget} gift subsidy
              </span>
              {confirmed && activeSubsidyBudget > baseSubsidyBudget && (
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 11,
                    color: "#16a34a",
                    marginLeft: 6,
                    fontWeight: 600,
                  }}
                >
                  ↑ upgraded from ${baseSubsidyBudget}
                </span>
              )}
              {!confirmed && (
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
              )}
            </div>
          </div>

          {/* Items section */}
          {confirmed ? (
            <CardItemsConfirmed
              confirmed={confirmed}
              onEdit={() => setDialogOpen(true)}
            />
          ) : (
            <CardItemsDefault
              pkg={pkg}
              subsidyBudget={activeSubsidyBudget}
              onSwitchToCustomView={onSwitchToCustomView}
            />
          )}
        </div>

        <div className="flex-1" />

        {/* Pricing footer */}
        <div className="px-5.5 pt-3.5 border-t border-[#f1f5f9] mt-3.5">
          <CardPricingFooter
            pkg={pkg}
            confirmed={confirmed}
            subsidyBudget={activeSubsidyBudget}
          />
        </div>

        {/* CTA */}
        <div className="p-[14px_22px_22px]">
          <button
            onClick={() =>
              isSelected ? handleDeselect() : setDialogOpen(true)
            }
            className={`w-full font-sans font-bold text-[15px] rounded-xl py-3.75 flex items-center justify-center gap-2 transition-all duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isSelected
                ? "bg-[#f1f5f9] text-[#64748b] border-[1.5px] border-[#e2e8f0] shadow-none"
                : "bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white border-none shadow-[0_2px_8px_rgba(34,197,94,0.25)]"
            }`}
            style={{
              fontFamily: "'Sora',sans-serif",
            }}
          >
            {isSelected ? (
              "Remove This Pack"
            ) : (
              <>
                <Gift size={17} /> Pick Items — ${activeSubsidyBudget} gift subsidy
                included
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── ViewSwitcher ─────────────────────────────────────────────────────────────

type ViewMode = "packs" | "custom";

function ViewSwitcher({
  active,
  onChange,
}: {
  active: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "packs",
      label: "Budget Packs",
      icon: <LayoutGrid size={15} />,
    },
    {
      id: "custom",
      label: "Subsidy Items",
      icon: <ListFilter size={15} />,
    },
  ];

  return (
    <div className="inline-flex bg-[#f1f5f9] rounded-2xl p-1 gap-0.5">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-4.5 py-2.25 rounded-xl border-none text-[13px] cursor-pointer transition-all duration-220 ease-[cubic-bezier(0.34,1.2,0.64,1)] whitespace-nowrap ${
              isActive
                ? "bg-white text-[#0f172a] shadow-[0_1px_6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] font-bold"
                : "bg-transparent text-[#94a3b8] font-medium"
            }`}
            style={{
              fontFamily: "'Sora',sans-serif",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── CustomOrderView ──────────────────────────────────────────────────────────

function CustomOrderView({ items }: { items: SubsidyItem[] }) {
  return (
    <div className="w-full">
      <SubsidyItemsClient items={items} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetPacks({ subsidyItems }: { subsidyItems: SubsidyItem[] }) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("packs");

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @keyframes popIn{0%{opacity:0;transform:scale(0.7);}100%{opacity:1;transform:scale(1);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
        .back-btn:hover .back-icon{transform:translateX(-3px);}
        .back-icon{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);}
        .pack-grid{display:grid;gap:20px;width:100%;max-width:1380px;grid-template-columns:1fr;}
        @media(min-width:640px){.pack-grid{grid-template-columns:repeat(2,1fr);}}
        @media(min-width:1024px){.pack-grid{grid-template-columns:repeat(3,1fr);}}
      `}</style>

      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%,rgba(220,252,231,0.6) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(187,247,208,0.4) 0%,transparent 50%)",
        }}
      />

      <main className="min-h-screen relative z-10 flex flex-col items-center py-8 px-4 md:px-4">
        {/* Back button */}
        <div
          className={`w-full max-w-345 flex items-center mb-8 transition-all duration-550 ease-[cubic-bezier(0.34,1.2,0.64,1)] ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
          }`}
        >
          <Link href="/customer" className="no-underline">
            <button
              className="back-btn flex items-center gap-1.5 bg-white border-[1.5px] border-[#e2e8f0] rounded-xl py-2.25 px-4 text-[#334155] font-semibold text-[13px] cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-[#bbf7d0] hover:text-[#16a34a]"
              style={{ fontFamily: "'Sora',sans-serif" }}
            >
              <ArrowLeft size={15} className="back-icon" />
              Back
            </button>
          </Link>
        </div>

        {/* Hero */}
        <div
          className={`text-center mb-8 transition-all duration-550 ease-[cubic-bezier(0.34,1.2,0.64,1)] delay-100 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1
            className="font-sora font-extrabold text-[clamp(26px,4vw,38px)] text-[#0f172a] tracking-[-0.8px] leading-[1.15] mb-2.5"
            style={{ fontFamily: "'Sora',sans-serif" }}
          >
            Budget Grocery Packs
          </h1>
          <p
            className="font-dm-sans text-[clamp(14px,2vw,17px)] text-[#64748b] max-w-130 mx-auto leading-relaxed"
            style={{ fontFamily: "'DM Sans',sans-serif" }}
          >
            Shop for groceries and get{" "}
            <strong className="text-[#16a34a]">free gift subsidy</strong> back.
            Use that subsidy to pay for subsidized items — milk, eggs, vegetables
            and more.
          </p>
        </div>

        {/* How It Works Explainer */}
        <div
          className={`w-full flex justify-center transition-all duration-550 ease-[cubic-bezier(0.34,1.2,0.64,1)] delay-150 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <HowItWorksExplainer />
        </div>

        {/* ── View switcher + grid header ── */}
        <div
          className={`w-full max-w-345 mb-4 transition-opacity duration-400 ease-in-out delay-250 ${
            headerVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Switcher row */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <ViewSwitcher active={viewMode} onChange={setViewMode} />
          </div>

          {/* Sub-header only shown for packs tab */}
          {viewMode === "packs" && (
            <>
              <p
                className="font-sora font-bold text-[16px] text-[#0f172a] mb-1"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                Choose how much you want to shop for
              </p>
              <p
                className="font-dm-sans text-[13px] text-[#64748b] mb-4"
                style={{ fontFamily: "'DM Sans',sans-serif" }}
              >
                Minimum $21. The more you spend, the more gift subsidy you get back.
              </p>
            </>
          )}
        </div>

        {/* Content area */}
        {viewMode === "packs" ? (
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
                onSwitchToCustomView={() => setViewMode("custom")}
              />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-345 flex justify-center">
            <CustomOrderView items={subsidyItems} />
          </div>
        )}
      </main>
    </>
  );
}