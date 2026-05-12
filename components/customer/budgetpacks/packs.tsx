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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

// ─── SubsidyTierTable ─────────────────────────────────────────────────────────

function SubsidyTierTable() {
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-b border-green-200">
        <span className="text-sm font-bold text-green-700 font-sora">
          How much gift subsidy do I get?
        </span>
        <span className="text-xs text-muted-foreground">You keep ~21% of what you spend</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-y divide-green-200">
        {subsidyTiers.map((tier, i) => (
          <div
            key={i}
            className="bg-green-50 p-3 flex flex-col items-center text-center gap-1"
          >
            <span className="text-[11px] text-muted-foreground">You spend</span>
            <span className="text-base font-extrabold text-foreground font-sora">${tier.spend}</span>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 text-[11px] font-bold border-0 px-2 py-0.5">
              <Gift size={9} />
              +${tier.subsidy.toFixed(2)} free
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-green-200 bg-amber-50/60">
        <Zap size={13} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Gift subsidy you don't use is saved to your Gift Wallet — it never disappears.
        </p>
      </div>
    </div>
  );
}

// ─── HowItWorksExplainer ──────────────────────────────────────────────────────

function HowItWorksExplainer() {
  const steps = [
    {
      icon: <ShoppingCart size={18} className="text-green-600" />,
      title: "Shop for $21 or more",
      body: "Buy any regular grocery items worth at least $21. The more you buy, the bigger your gift subsidy.",
    },
    {
      icon: <Gift size={18} className="text-green-600" />,
      title: "Get free gift subsidy",
      body: "The app gives you back about 21% of what you spent as gift subsidy. Spend $21 → get $4.41 free. Spend more → get more.",
    },
    {
      icon: <Tag size={18} className="text-green-600" />,
      title: "Use it on subsidized items",
      body: "Pick items like milk, eggs, flour, vegetables and more — the app pays for them using your gift subsidy. Leftover subsidy saves to your Gift Wallet.",
    },
  ];

  return (
    <Card className="w-full max-w-5xl mb-6 border-2 border-green-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-green-600" />
          <h2 className="text-lg font-extrabold text-foreground font-sora tracking-tight">
            How Budget Packs work
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          It's simple — shop for groceries, get free money back, and use it to pay less.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="bg-muted/40 rounded-xl border border-border/60 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[11px] font-extrabold font-sora shrink-0">
                  {i + 1}
                </div>
              </div>
              <p className="text-sm font-bold text-foreground font-sora leading-tight">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <SubsidyTierTable />
      </CardContent>
    </Card>
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
    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border relative flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        <Gift size={18} className="text-green-600" />
      </div>
      <div className="flex-1 min-w-0 pr-8">
        <h2 className="text-base font-extrabold text-foreground font-sora leading-tight">
          Pick items to use your gift subsidy on
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {pkgName} · Your gift subsidy:{" "}
          <strong className="text-green-600">${subsidyBudget}</strong>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 w-7 h-7 rounded-lg"
      >
        <X size={15} />
      </Button>
    </div>
  );
}

// ─── DialogInfoBanner ─────────────────────────────────────────────────────────

function DialogInfoBanner({ subsidyBudget }: { subsidyBudget: number }) {
  return (
    <div className="px-4 sm:px-5 py-2 sm:py-3 bg-green-50 border-b border-green-100 flex gap-2 items-center">
      <Info size={13} className="text-green-600 shrink-0" />
      <p className="text-xs text-green-700 leading-snug">
        <strong>${subsidyBudget} gift subsidy</strong> — tick items to use it. Unused subsidy saves to your <strong>Gift Wallet</strong>.
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
  const pct = Math.min(100, (subsidyUsed / subsidyBudget) * 100);

  return (
    <div className="px-4 sm:px-5 py-2.5 sm:py-4 bg-muted/30 border-b border-border">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-muted-foreground font-medium">Gift subsidy used so far</span>
        <span className="text-sm font-bold text-green-600 font-sora">
          ${subsidyUsed}{" "}
          <span className="text-muted-foreground font-normal">of ${subsidyBudget}</span>
        </span>
      </div>
      <Progress value={pct} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />

      {(unusedSubsidy > 0 || youPay > 0) ? (
        <div
          className={cn(
            "mt-2 p-2 sm:p-3 rounded-xl flex items-start gap-2 border text-xs font-medium leading-snug",
            bracketUpgrade
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-800",
          )}
        >
          {bracketUpgrade
            ? <Sparkles size={13} className="text-green-600 mt-0.5 shrink-0" />
            : <Zap size={13} className="text-amber-500 mt-0.5 shrink-0" />}
          <p>
            {bracketUpgrade ? (
              <>
                <strong>${(unusedSubsidy + youPay).toFixed(2)} extra</strong> rolls into your spend →{" "}
                effective spend becomes{" "}
                <strong>${(baseSpend + unusedSubsidy + youPay).toFixed(2)}</strong>, unlocking{" "}
                <strong className="text-green-700">${resolvedBudget} gift subsidy</strong> on confirm.
              </>
            ) : (
              <>
                <strong>${(unusedSubsidy + youPay).toFixed(2)} extra.</strong>{" "}
                {youPay > 0 && <>${youPay.toFixed(2)} out-of-pocket + </>}
                ${unusedSubsidy.toFixed(2)} unused — pick more items to use it, or save to your Gift Wallet.
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-xs text-green-600 font-semibold mt-1.5">All gift subsidy used ✓</p>
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
      className={cn(
        "flex items-center p-3 rounded-xl mb-1 cursor-pointer transition-all duration-150 border",
        isFree ? "bg-green-50 border-green-200"
          : isPartial ? "bg-amber-50 border-amber-200"
          : checked ? "bg-green-50 border-green-200"
          : "bg-background border-border hover:border-green-200 hover:bg-green-50/40",
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mr-3 transition-all duration-150",
          checked ? "bg-green-600 border-green-600" : "bg-background border-border",
        )}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>

      <span className={cn("flex-1 text-sm", checked ? "text-foreground" : "text-muted-foreground")}>
        {item.name}
      </span>

      <div className="text-right">
        {isFree ? (
          <>
            <span className="text-xs font-extrabold text-green-600 font-sora">FREE</span>
            <div className="text-[10px] text-muted-foreground line-through mt-0.5">
              ${item.price.toFixed(2)}
            </div>
          </>
        ) : isPartial ? (
          <>
            <span className="text-xs font-bold text-amber-600 font-sora">
              ${effectivePrice.toFixed(2)}
            </span>
            <div className="text-[10px] text-amber-400 mt-0.5">−${discount.toFixed(2)} off</div>
          </>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
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
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div className="px-4 sm:px-5 pt-2.5 sm:pt-3 pb-2">
        {/* Select all */}
        <div
          onClick={onToggleAll}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-xl mb-2 cursor-pointer border border-border hover:border-green-200 transition-colors"
        >
          <span className="text-sm font-bold text-foreground font-sora">Select all items</span>
          <div
            className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150",
              allChecked ? "bg-green-600 border-green-600" : "bg-background border-border",
            )}
          >
            {allChecked && <Check size={11} className="text-white" strokeWidth={3} />}
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

        <button
          onClick={onBrowseAll}
          className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-green-600" />
            <div className="text-left">
              <div className="text-xs font-bold text-green-700 font-sora">Browse all subsidized products</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">See the full list of items you can use gift subsidy on</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-green-600 shrink-0" />
        </button>
        <div className="h-3" />
      </div>
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
    <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 border-t border-border bg-background shrink-0">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-muted-foreground">Gift subsidy used</span>
        <span className="text-sm text-green-600 font-semibold">−${subsidyUsed.toFixed(2)}</span>
      </div>
      {unusedSubsidy > 0 && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-muted-foreground">Saved to Gift Wallet</span>
          <span className="text-sm text-amber-600 font-semibold">${unusedSubsidy.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5 mb-3">
        <span className="text-sm font-bold text-foreground font-sora">You pay for these items</span>
        <span className="text-xl sm:text-2xl font-extrabold text-green-600 font-sora tracking-tight">
          ${youPay.toFixed(2)}
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-10 sm:h-11 font-sora font-semibold text-sm">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-[2] rounded-xl h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white font-sora font-bold text-sm gap-1.5 shadow-lg shadow-green-200"
        >
          <Check size={15} strokeWidth={2.5} />
          {allUnchecked ? "Save all to Gift Wallet" : "Confirm Selection"}
        </Button>
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
    setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });

  const toggleAll = () => {
    const allOn = checked.every(Boolean);
    setChecked(pkg.combo.map(() => !allOn));
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    const items = pkg.combo
      .map((item, i) => ({ name: item.name, price: item.price, discount: itemDiscount[i] }))
      .filter((_, i) => checked[i]);
    const resolved = resolveSubsidyBudget(pkg.maxPrice, unusedSubsidy, youPay);
    onConfirm({ items, subsidyUsed, unusedSubsidy, youPay, resolvedSubsidyBudget: resolved });
  };

  return (
    <div
      onClick={handleBackdrop}
      className="
        fixed inset-x-0 z-[9999]
        bg-black/50 backdrop-blur-sm
        animate-in fade-in duration-200
        flex items-end sm:items-center justify-center
        p-0 sm:p-4
        top-[64px] bottom-[64px]
        sm:inset-0 sm:top-0 sm:bottom-0
      "
    >
      <div
        className="
          dialog-inner
          bg-background w-full flex flex-col
          shadow-2xl overflow-hidden border border-border
          rounded-t-3xl sm:rounded-3xl
          sm:max-w-lg sm:max-h-[88vh]
          animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-300
          h-full sm:h-auto
        "
      >
        <DialogHeader pkgName={pkg.name} subsidyBudget={subsidyBudget} onClose={onClose} />
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

// ─── CardItemsDefault ─────────────────────────────────────────────────────────

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
        <Gift size={13} className="text-green-600" />
        <span className="text-xs font-bold text-green-700 font-sora">
          Items you can use your gift subsidy on
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        Tap <strong className="text-foreground">"Pick Items"</strong> and choose which ones you want
        covered by your <strong className="text-green-600">${subsidyBudget} gift subsidy</strong>.
        Whatever you don't use is saved to your Gift Wallet.
      </p>
      <div className="rounded-xl overflow-hidden border border-border">
        {pkg.combo.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex justify-between px-3 py-2.5 text-sm border-b border-border last:border-b-0",
              i % 2 === 0 ? "bg-muted/30" : "bg-background",
            )}
          >
            <span className="text-foreground">{item.name}</span>
            <span className="text-green-600 font-semibold">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSwitchToCustomView}
        className="w-full text-left mt-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Tag size={13} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">Browse all subsidized products</span>
        </div>
        <div className="flex items-center gap-0.5 text-green-600">
          <span className="text-xs font-medium">See full list</span>
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
          <Check size={13} className="text-green-600" />
          <span className="text-xs font-bold text-green-700 font-sora">
            Items paid by gift subsidy ({items.length})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="h-7 px-2.5 text-xs gap-1 rounded-lg"
        >
          <Pencil size={10} />
          Edit
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border">
        {items.map((item, i) => {
          const isFree = item.discount >= item.price - 0.001;
          const isPartial = item.discount > 0 && !isFree;
          const effPrice = +(item.price - item.discount).toFixed(2);

          return (
            <div
              key={i}
              className={cn(
                "flex justify-between items-center px-3 py-2.5 border-b border-border last:border-b-0",
                isFree ? "bg-green-50" : isPartial ? "bg-amber-50" : i % 2 === 0 ? "bg-muted/30" : "bg-background",
              )}
            >
              <span className="text-sm text-foreground flex-1 mr-2">{item.name}</span>
              <div className="text-right shrink-0">
                {isFree ? (
                  <>
                    <span className="text-xs font-extrabold text-green-600 font-sora">FREE</span>
                    <div className="text-[10px] text-muted-foreground line-through">${item.price.toFixed(2)}</div>
                  </>
                ) : isPartial ? (
                  <>
                    <span className="text-xs font-bold text-amber-600 font-sora">${effPrice.toFixed(2)}</span>
                    <div className="text-[10px] text-amber-400">−${item.discount.toFixed(2)} off</div>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-foreground">${item.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          );
        })}

        {unusedSubsidy > 0 && (
          <div
            className={cn(
              "flex justify-between items-center px-3 py-3",
              bracketUpgrade ? "bg-green-50" : "bg-amber-50",
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {bracketUpgrade
                ? <Sparkles size={13} className="text-green-600 shrink-0" />
                : <Zap size={13} className="text-amber-500 shrink-0" />}
              <div className="min-w-0">
                <div className={cn("text-xs font-bold font-sora truncate", bracketUpgrade ? "text-green-700" : "text-amber-800")}>
                  {bracketUpgrade ? `Bracket upgrade → $${resolvedSubsidyBudget} next time` : "Saved to Gift Wallet"}
                </div>
                <div className={cn("text-[11px]", bracketUpgrade ? "text-green-600" : "text-amber-600")}>
                  {bracketUpgrade ? `Unused $${unusedSubsidy.toFixed(2)} rolled in` : "Use it on your next order"}
                </div>
              </div>
            </div>
            <span className={cn("text-sm font-extrabold font-sora shrink-0 ml-2", bracketUpgrade ? "text-green-600" : "text-amber-500")}>
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
          <span className="text-sm text-muted-foreground">You pay at the store</span>
          <span className="text-xl font-extrabold text-foreground font-sora tracking-tight">${pkg.maxPrice}</span>
        </div>
        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Gift size={14} className="text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-bold text-green-700 font-sora">Gift subsidy added to wallet</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Use now or save for later</div>
            </div>
          </div>
          <span className="text-xl font-extrabold text-green-600 font-sora tracking-tight ml-2 shrink-0">
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
        <span className="text-sm text-muted-foreground">Regular items (pack)</span>
        <span className="text-sm text-foreground">${pkg.maxPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-muted-foreground">Subsidized items picked</span>
        <span className="text-sm text-foreground">
          ${confirmed.items.reduce((s, i) => s + i.price, 0).toFixed(2)}
        </span>
      </div>
      <div className={cn("flex justify-between", hasExtra ? "mb-2" : "mb-3")}>
        <span className="text-sm text-muted-foreground">Gift subsidy used</span>
        <span className="text-sm text-green-600 font-bold">−${subsidyUsed.toFixed(2)}</span>
      </div>

      {hasExtra && (
        <div
          className={cn(
            "flex justify-between items-center mb-3 px-3 py-2.5 rounded-xl border text-xs",
            bracketUpgrade ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200",
          )}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {bracketUpgrade
              ? <Sparkles size={12} className="text-green-600 shrink-0" />
              : <Zap size={12} className="text-amber-500 shrink-0" />}
            <div className="min-w-0">
              <span className={cn("block font-semibold truncate", bracketUpgrade ? "text-green-700" : "text-amber-800")}>
                {bracketUpgrade ? `Bracket upgrade → $${resolvedSubsidyBudget}` : "Extra / Saved"}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {youPay > 0 && <>+${youPay.toFixed(2)} out-of-pocket </>}
                {unusedSubsidy > 0 && <>+${unusedSubsidy.toFixed(2)} saved</>}
              </span>
            </div>
          </div>
          <span className={cn("font-bold ml-2 shrink-0", bracketUpgrade ? "text-green-600" : "text-amber-500")}>
            +${(unusedSubsidy + youPay).toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div>
          <div className="text-sm font-bold text-foreground font-sora">Total store spend</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {subsidyUsed > 0
              ? `Gift subsidy covers $${subsidyUsed.toFixed(2)} ✓`
              : hasExtra
              ? `$${(unusedSubsidy + youPay).toFixed(2)} extra / saved`
              : "All gift subsidy used ✓"}
          </div>
        </div>
        <span className="text-2xl font-extrabold text-green-600 font-sora tracking-tight ml-2 shrink-0">
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

  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedSelection | null>(null);

  const activeSubsidyBudget = confirmed?.resolvedSubsidyBudget ?? baseSubsidyBudget;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 * index);
    return () => clearTimeout(t);
  }, [index]);

  const handleDeselect = () => { setConfirmed(null); onSelect(pkg.id); };

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
              ? pkg.combo.map((item) => confirmed.items.some((ci) => ci.name === item.name))
              : undefined
          }
          onBrowseAll={() => { setDialogOpen(false); onSwitchToCustomView(); }}
        />
      )}

      <Card
        className={cn(
          "relative flex flex-col h-full overflow-hidden transition-all duration-300 ease-out border-2",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
          isSelected
            ? "border-green-500 shadow-xl shadow-green-100"
            : "border-border hover:border-green-200 hover:shadow-lg hover:-translate-y-0.5",
        )}
      >
        {/* Top accent */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 h-0.5 transition-all duration-300",
            isSelected
              ? "bg-gradient-to-r from-green-500 to-green-400"
              : "bg-gradient-to-r from-green-100 to-green-200",
          )}
        />

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-3.5 right-3.5 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-md shadow-green-200 animate-in zoom-in-75 duration-200">
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
        )}

        <CardHeader className="pt-6 px-5 pb-0">
          <div className={cn("flex items-start justify-between mb-1", isSelected && "pr-9")}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-green-100" : "bg-muted")}>
                <Package size={18} className={isSelected ? "text-green-600" : "text-green-400"} />
              </div>
              <span className="text-base font-bold text-foreground font-sora truncate">{pkg.name}</span>
            </div>
            <span className="text-2xl font-extrabold text-green-600 font-sora tracking-tight shrink-0 ml-2">
              ${pkg.maxPrice}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px] mb-3">
            {pkg.description}
          </p>

          {/* Gift subsidy pill */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5 mb-4">
            <Gift size={14} className="text-green-600 shrink-0" />
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-sm font-extrabold text-green-600 font-sora">
                +${activeSubsidyBudget} gift subsidy
              </span>
              {confirmed && activeSubsidyBudget > baseSubsidyBudget && (
                <span className="text-[11px] text-green-600 font-semibold">
                  ↑ upgraded from ${baseSubsidyBudget}
                </span>
              )}
              {!confirmed && (
                <span className="text-[11px] text-muted-foreground">— use it to get items free</span>
              )}
            </div>
          </div>

          {/* Items section */}
          {confirmed ? (
            <CardItemsConfirmed confirmed={confirmed} onEdit={() => setDialogOpen(true)} />
          ) : (
            <CardItemsDefault pkg={pkg} subsidyBudget={activeSubsidyBudget} onSwitchToCustomView={onSwitchToCustomView} />
          )}
        </CardHeader>

        <div className="flex-1" />

        {/* Pricing footer */}
        <div className="px-5 pt-4 border-t border-border mt-3">
          <CardPricingFooter pkg={pkg} confirmed={confirmed} subsidyBudget={activeSubsidyBudget} />
        </div>

        {/* CTA */}
        <CardFooter className="px-5 pb-5 pt-3">
          <Button
            onClick={() => isSelected ? handleDeselect() : setDialogOpen(true)}
            className={cn(
              "w-full h-11 rounded-xl font-sora font-bold text-sm gap-2",
              isSelected
                ? "bg-muted text-muted-foreground hover:bg-muted/80 border border-border shadow-none"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200",
            )}
          >
            {isSelected ? (
              "Remove This Pack"
            ) : (
              <>
                <Gift size={15} />
                Pick Items — ${activeSubsidyBudget} gift subsidy
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

// ─── ViewSwitcher ─────────────────────────────────────────────────────────────

type ViewMode = "packs" | "custom";

function ViewSwitcher({ active, onChange }: { active: ViewMode; onChange: (v: ViewMode) => void }) {
  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "packs", label: "Budget Packs", icon: <LayoutGrid size={14} /> },
    { id: "custom", label: "Subsidy Items", icon: <ListFilter size={14} /> },
  ];

  return (
    <div className="inline-flex bg-muted rounded-2xl p-1 gap-0.5">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sora transition-all duration-200 whitespace-nowrap cursor-pointer border-0",
              isActive
                ? "bg-background text-foreground font-bold shadow-sm"
                : "bg-transparent text-muted-foreground font-medium",
            )}
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
    <TooltipProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.03) 0%, transparent 50%)",
      }} />

      <main className="min-h-screen relative z-10 flex flex-col items-center py-6 sm:py-8 px-4">

        {/* Back button */}
        <div className={cn(
          "w-full max-w-5xl flex items-center mb-6 transition-all duration-500",
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        )}>
          <Link href="/customer" className="no-underline">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9 font-sora font-semibold text-xs hover:border-green-300 hover:text-green-700">
              <ArrowLeft size={14} />
              Back
            </Button>
          </Link>
        </div>

        {/* Hero */}
        <div className={cn(
          "text-center mb-6 transition-all duration-500 delay-100",
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        )}>
          <h1 className="font-sora font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight leading-tight mb-2.5">
            Budget Grocery Packs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Shop for groceries and get{" "}
            <strong className="text-green-600">free gift subsidy</strong> back.
            Use that subsidy to pay for subsidized items — milk, eggs, vegetables and more.
          </p>
        </div>

        {/* How It Works */}
        <div className={cn(
          "w-full flex justify-center transition-all duration-500 delay-150",
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        )}>
          <HowItWorksExplainer />
        </div>

        {/* View switcher header */}
        <div className={cn(
          "w-full max-w-5xl mb-4 transition-opacity duration-400 delay-200",
          headerVisible ? "opacity-100" : "opacity-0",
        )}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <ViewSwitcher active={viewMode} onChange={setViewMode} />
          </div>

          {viewMode === "packs" && (
            <>
              <p className="text-base font-bold text-foreground font-sora mb-0.5">
                Choose how much you want to shop for
              </p>
              <p className="text-xs text-muted-foreground">
                Minimum $21. The more you spend, the more gift subsidy you get back.
              </p>
            </>
          )}
        </div>

        {/* Content */}
        {viewMode === "packs" ? (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                index={i}
                isSelected={selectedPackId === pkg.id}
                onSelect={(id) => setSelectedPackId((prev) => (prev === id ? null : id))}
                onSwitchToCustomView={() => setViewMode("custom")}
              />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-5xl flex justify-center">
            <CustomOrderView items={subsidyItems} />
          </div>
        )}
      </main>
    </TooltipProvider>
  );
}