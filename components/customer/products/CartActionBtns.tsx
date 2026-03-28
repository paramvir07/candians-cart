"use client";

import {
  DecrementSubsidyItem,
  IncrementSubsidyItem,
  movetoSubsidy,
  RemoveSubsidyItem,
} from "@/actions/customer/SubsidyItems.Action";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";

const fmt = (cents: number) => (cents / 100).toFixed(2);

const CartActionBtns = ({
  customerId,
  quantity,
  beforeSubsidy,
  subsidy,
  productId,
  variant = "desktop",
}: {
  customerId?: string;
  quantity: number;
  beforeSubsidy: number;
  subsidy: number;
  productId: string;
  variant?: "mobile" | "desktop";
}) => {
  const [qty, setQty] = useState(quantity);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<"inc" | "dec" | null>(null);

  const afterSubsidy = Math.max(beforeSubsidy * qty - subsidy, 0);

  const sync = (direction: "inc" | "dec") => {
    pendingRef.current = direction;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (pendingRef.current === "inc") IncrementSubsidyItem(productId, customerId);
      else DecrementSubsidyItem(productId, customerId);
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
      RemoveSubsidyItem(productId, customerId);
      return;
    }
    setQty((q) => q - 1);
    sync("dec");
  };

  const remove = () => RemoveSubsidyItem(productId, customerId);

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