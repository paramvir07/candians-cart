"use client";
import { useRef, useState, useTransition, useCallback, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import {
  UpdateItemQuantity,
  RemoveItem,
} from "@/actions/customer/ProductAndStore/Cart.Action";

interface Props {
  productId: string;
  customerId?: string;
  initialQuantity: number;
  variant?: "mobile" | "desktop";
  onRemoved?: () => void;
  isMeasuredInWeight?: boolean;
  name?: string;
}

export const QuantityControl = ({
  productId,
  customerId,
  initialQuantity,
  variant = "desktop",
  onRemoved,
  isMeasuredInWeight,
  name,
}: Props) => {
  // const [qty, setQty] = useState(initialQuantity);
  const [qty, setQty] = useState(initialQuantity);
  const [inputValue, setInputValue] = useState(String(initialQuantity));
  const [isQtyDirty, setIsQtyDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
  setQty(initialQuantity);
  setInputValue(formatQtyForInput(initialQuantity));
}, [initialQuantity]);

  const formatQtyForInput = useCallback(
    (value: number) => {
      if (isMeasuredInWeight) return String(value);
      return String(Math.trunc(value));
    },
    [isMeasuredInWeight],
  );

  const normalizeQuantity = useCallback(
    (rawValue: string) => {
      const trimmed = rawValue.trim();
      if (trimmed === "") return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) return null;
      const bounded = Math.max(0, Math.min(99, parsed));
      if (isMeasuredInWeight) return Math.round(bounded * 100) / 100;
      return Math.trunc(bounded);
    },
    [isMeasuredInWeight],
  );

  const sync = (newQty: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const fd = new FormData();
      fd.append("productId", productId);
      fd.append("quantity", String(newQty));
      await UpdateItemQuantity(customerId, fd);
    }, 400);
  };

  const remove = () => {
    const row = containerRef.current?.closest(
      "[data-cart-item]",
    ) as HTMLElement | null;
    if (row) row.style.display = "none";
    const fd = new FormData();
    fd.append("productId", productId);
    RemoveItem(customerId, fd).catch(() => {
      if (row) row.style.display = "";
    });
  };

  const increment = () => {
    if (qty >= 99) return;
    const next = qty + 1;
    setQty(next);
    setInputValue(formatQtyForInput(next));
setIsQtyDirty(false);
    sync(next);
  };

  const decrement = () => {
    if (qty <= 1) {
      remove();
      return;
    }
    const next = qty - 1;
    setQty(next);
    setInputValue(formatQtyForInput(next));
setIsQtyDirty(false);
    sync(next);
  };

  const isMobile = variant === "mobile";
  const size = isMobile ? 11 : 12;
  const btnBase = `${isMobile ? "w-7 h-7" : "w-8 h-8"} rounded-full flex items-center justify-center border transition-colors`;

  const handleQuantityInputCommit = useCallback(() => {
    const newQty = normalizeQuantity(inputValue);
    if (newQty === null) {
      setInputValue(formatQtyForInput(qty));
      setIsQtyDirty(false);
      return;
    }
    if (newQty === qty) {
      setInputValue(formatQtyForInput(qty));
      setIsQtyDirty(false);
      return;
    }
    if (newQty === 0) {
      remove();
      return;
    }
    setQty(newQty);
    setInputValue(formatQtyForInput(newQty));
    setIsQtyDirty(false);
    sync(newQty);
  }, [inputValue, qty, normalizeQuantity, formatQtyForInput]);

  const normalizedInputQty = normalizeQuantity(inputValue);
  const showConfirm =
    isQtyDirty && normalizedInputQty !== null && normalizedInputQty !== qty;

  return (
    <div ref={containerRef} className="flex items-center gap-1.5">
      <button
        onClick={decrement}
        className={btnBase}
        style={{ background: "var(--secondary)", borderColor: "var(--border)" }}
      >
        <Minus size={size} strokeWidth={2.5} />
      </button>
      {/* <span className={`text-sm font-black ${isMobile ? "w-5" : "w-6"} text-center tabular-nums`}
        style={{ color: "var(--foreground)" }}>
        {qty}
      </span> */}
      <input
        type="number"
        min={0}
        max={99}
        step={isMeasuredInWeight ? "0.01" : "1"}
        inputMode={isMeasuredInWeight ? "decimal" : "numeric"}
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "") {
            setInputValue(value);
            setIsQtyDirty(true);
            return;
          }
          if (!isMeasuredInWeight) {
            if (!/^\d+$/.test(value)) return;
          } else {
            if (!/^\d*([.]\d{0,2})?$/.test(value)) return;
          }
          setInputValue(value);
          setIsQtyDirty(true);
        }}
        onBlur={handleQuantityInputCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        disabled={isPending}
        className={`rounded-md border text-center font-bold tabular-nums outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isMobile ? "h-6 w-10 text-sm" : "h-7 w-12 text-sm"}`}
        style={{
          borderColor: "var(--border)",
          background: "var(--secondary)",
          color: "var(--foreground)",
        }}
      />
      {/* {showConfirm && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleQuantityInputCommit}
          disabled={isPending}
          className={`flex shrink-0 items-center justify-center rounded-full bg-primary hover:opacity-90 disabled:opacity-50 ${isMobile ? "h-6 w-6" : "h-7 w-7"}`}
        >
          <Check
            size={11}
            strokeWidth={3}
            className="text-primary-foreground"
          />
        </button>
      )} */}
      <button
        onClick={increment}
        className={`${isMobile ? "w-7 h-7" : "w-8 h-8"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
        style={{ background: "var(--primary)" }}
      >
        <Plus size={size} strokeWidth={2.5} className="text-white" />
      </button>
    </div>
  );
};
