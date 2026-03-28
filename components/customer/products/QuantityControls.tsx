"use client";
import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { UpdateItemQuantity, RemoveItem } from "@/actions/customer/ProductAndStore/Cart.Action";

interface Props {
  productId: string;
  customerId?: string;
  initialQuantity: number;
  variant?: "mobile" | "desktop";
}

export const QuantityControl = ({ productId, customerId, initialQuantity, variant = "desktop" }: Props) => {
  const [qty, setQty] = useState(initialQuantity);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const fd = new FormData();
    fd.append("productId", productId);
    RemoveItem(customerId, fd);
  };

  const increment = () => {
    if (qty >= 99) return;
    const next = qty + 1;
    setQty(next);
    sync(next);
  };

  const decrement = () => {
    if (qty <= 1) { remove(); return; }
    const next = qty - 1;
    setQty(next);
    sync(next);
  };

  const isMobile = variant === "mobile";
  const size = isMobile ? 11 : 12;
  const btnBase = `${isMobile ? "w-7 h-7" : "w-8 h-8"} rounded-full flex items-center justify-center border transition-colors`;

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={decrement} className={btnBase}
        style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
        <Minus size={size} strokeWidth={2.5} />
      </button>
      <span className={`text-sm font-black ${isMobile ? "w-5" : "w-6"} text-center tabular-nums`}
        style={{ color: "var(--foreground)" }}>
        {qty}
      </span>
      <button onClick={increment} className={`${isMobile ? "w-7 h-7" : "w-8 h-8"} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
        style={{ background: "var(--primary)" }}>
        <Plus size={size} strokeWidth={2.5} className="text-white" />
      </button>
    </div>
  );
};