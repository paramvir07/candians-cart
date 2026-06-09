"use client";

import {
  movebacktoCart,
  movetoSubsidy,
  RemoveSubsidyItem,
  UpdateSubsidyItemQuantity,
} from "@/actions/customer/SubsidyItems.Action";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";

const fmt = (cents: number) => (cents / 100).toFixed(2);

const CartActionBtns = ({
  customerId,
  quantity,
  beforeSubsidy,
  subsidy,
  productId,
  variant = "desktop",
  isMeasuredInWeight,
}: {
  customerId?: string;
  quantity: number;
  beforeSubsidy: number;
  subsidy: number;
  productId: string;
  variant?: "mobile" | "desktop";
  isMeasuredInWeight?: boolean;
}) => {
  const [qty, setQty] = useState(quantity);
  const [inputValue, setInputValue] = useState(String(quantity));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const afterSubsidy = Math.max(beforeSubsidy * qty - subsidy, 0);

  const formatQty = useCallback(
    (value: number) =>
      isMeasuredInWeight
        ? String(Math.round(value * 100) / 100)
        : String(Math.trunc(value)),
    [isMeasuredInWeight],
  );

  const normalizeQty = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) return null;
      const bounded = Math.max(0, Math.min(99, parsed));
      if (isMeasuredInWeight) return Math.round(bounded * 100) / 100;
      return Math.trunc(bounded);
    },
    [isMeasuredInWeight],
  );

  const syncValue = useCallback(
    (newQty: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        UpdateSubsidyItemQuantity(productId, customerId, newQty);
      }, 400);
    },
    [productId, customerId],
  );

  const remove = useCallback(
    () => RemoveSubsidyItem(productId, customerId),
    [productId, customerId],
  );

  const increment = useCallback(() => {
    if (qty >= 99) return;
    const next = isMeasuredInWeight
      ? Math.round((qty + 0.5) * 100) / 100
      : qty + 1;
    setQty(next);
    setInputValue(formatQty(next));
    syncValue(next);
  }, [qty, isMeasuredInWeight, formatQty, syncValue]);

  const decrement = useCallback(() => {
    const threshold = isMeasuredInWeight ? 0.49 : 1;
    if (qty <= threshold) {
      remove();
      return;
    }
    const next = isMeasuredInWeight
      ? Math.round((qty - 0.5) * 100) / 100
      : qty - 1;
    setQty(next);
    setInputValue(formatQty(next));
    syncValue(next);
  }, [qty, isMeasuredInWeight, formatQty, syncValue, remove]);

  const handleInputCommit = useCallback(() => {
    const newQty = normalizeQty(inputValue);
    if (newQty === null || newQty === qty) {
      setInputValue(formatQty(qty));
      return;
    }
    if (newQty === 0) {
      remove();
      return;
    }
    setQty(newQty);
    setInputValue(formatQty(newQty));
    syncValue(newQty);
  }, [inputValue, qty, normalizeQty, formatQty, syncValue, remove]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        setInputValue(value);
        return;
      }
      if (!isMeasuredInWeight) {
        if (!/^\d+$/.test(value)) return;
      } else {
        if (!/^\d*\.?\d{0,2}$/.test(value)) return;
      }
      setInputValue(value);
    },
    [isMeasuredInWeight],
  );

  useEffect(() => {
    setQty(quantity);
    setInputValue(formatQty(quantity));
  }, [quantity, formatQty]);

  const inputCls = `rounded-md border text-center font-bold tabular-nums outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
    variant === "mobile" ? "h-6 w-10 text-sm" : "h-7 w-12 text-sm"
  }`;

  const inputStyleObj = {
    borderColor: "var(--border)",
    background: "var(--secondary)",
    color: "var(--foreground)",
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

          <input
            type={isMeasuredInWeight ? "text" : "number"}
            inputMode={isMeasuredInWeight ? "decimal" : "numeric"}
            {...(!isMeasuredInWeight && { min: 0, max: 99, step: "1" })}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputCommit}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            className={inputCls}
            style={inputStyleObj}
          />

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

        <input
          type={isMeasuredInWeight ? "text" : "number"}
          inputMode={isMeasuredInWeight ? "decimal" : "numeric"}
          {...(!isMeasuredInWeight && { min: 0, max: 99, step: "1" })}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputCommit}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className={inputCls}
          style={inputStyleObj}
        />

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
          CA${fmt(afterSubsidy)}
        </p>
        <p className="text-xs text-gray-400 line-through tabular-nums mt-0.5">
          CA${fmt(beforeSubsidy * qty)}
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

export default CartActionBtns;

export const AddtoSubsidyBtn = ({
  ProductId,
  customerId,
}: {
  ProductId: string;
  customerId?: string;
}) => {
  const handleBtnClick = async () => {
    try {
      const res = await movetoSubsidy(ProductId, customerId);
      if (!res.success) {
        if (res.message === "insufficient gift Wallet Balance") {
          toast.error("Insufficient gift wallet balance");
        } else if (res.message === "User not found") {
          toast.error("User session expired. Please login again.");
        } else if (res.message === "Item not found") {
          toast.error("Item no longer exists in cart.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        return;
      }
      toast.success("Item moved to subsidy");
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <button
      onClick={handleBtnClick}
      className="cursor-pointer shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all px-2 py-0.5 rounded-md"
    >
      Use Subsidy
    </button>
  );
};

export const MovebacktoCart = ({
  ProductId,
  customerId,
}: {
  ProductId: string;
  customerId?: string;
}) => {
  const handleBtnClick = async () => {
    try {
      const res = await movebacktoCart(ProductId, customerId);
      if (!res.success) {
        if (res.message === "User not found") {
          toast.error("User session expired. Please login again.");
        } else if (res.message === "Item not found") {
          toast.error("Item no longer exists in subsidy.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        return;
      }
      toast.success("Item moved back to cart");
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <button
      onClick={handleBtnClick}
      className="cursor-pointer shrink-0 flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all px-2 py-0.5 rounded-md"
    >
      Remove Subsidy
    </button>
  );
};