// components/cashier/MiscCartActionBtns.tsx
"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import {
  IncrementMiscItem,
  DecrementMiscItem,
  RemoveMiscItem,
} from "@/actions/cashier/MiscItem";

const MiscCartActionBtns = ({
  itemId,
  initialQty,
  priceAtAdd,
  customerId,
  variant = "desktop",
}: {
  itemId: string;
  initialQty: number;
  priceAtAdd: number;
  customerId?: string;
  variant?: "mobile" | "desktop";
}) => {
  const [qty, setQty] = useState(initialQty);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<"inc" | "dec" | null>(null);

  const fmt = (cents: number) => (cents / 100).toFixed(2);

  const sync = (direction: "inc" | "dec") => {
    pendingRef.current = direction;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (pendingRef.current === "inc") IncrementMiscItem(itemId, customerId);
      else DecrementMiscItem(itemId, customerId);
      pendingRef.current = null;
    }, 400);
  };

  const increment = () => {
    if (qty >= 99) return;
    setQty((q) => q + 1);
    sync("inc");
  };

  const decrement = () => {
    if (qty <= 1) {
      setQty(0);
      RemoveMiscItem(itemId, customerId);
      return;
    }
    setQty((q) => q - 1);
    sync("dec");
  };

  const remove = () => {
    setQty(0);
    RemoveMiscItem(itemId, customerId);
  };

  if (variant === "mobile") {
    return (
      <div className="flex items-center justify-between mt-2.5">
        <button
          type="button"
          onClick={remove}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
          <span>Remove</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrement}
            className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Minus size={12} strokeWidth={2} />
          </button>

          <span className="text-sm font-semibold text-gray-900 w-5 text-center tabular-nums">
            {qty}
          </span>

          <button
            type="button"
            onClick={increment}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Plus size={12} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          type="button"
          size="icon"
          onClick={decrement}
          className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          <Minus size={13} strokeWidth={2} />
        </Button>

        <span className="text-sm font-semibold text-gray-900 w-6 text-center tabular-nums">
          {qty}
        </span>

        <Button
          type="button"
          size="icon"
          onClick={increment}
          className="w-8 h-8 rounded-full bg-primary hover:opacity-80 transition-opacity"
        >
          <Plus size={13} strokeWidth={2} className="text-white" />
        </Button>
      </div>

      <div className="w-24 text-right">
        <p className="text-sm font-bold text-gray-900 tabular-nums">
          CA${fmt(priceAtAdd * qty)}
        </p>
        <p className="text-xs text-gray-400 tabular-nums mt-0.5">
          CA${fmt(priceAtAdd)} ea.
        </p>
      </div>

      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={remove}
        className="text-gray-300 hover:text-red-400 transition-colors ml-1"
        aria-label="Remove item"
      >
        <Trash2 size={15} />
      </Button>
    </>
  );
};

export default MiscCartActionBtns;