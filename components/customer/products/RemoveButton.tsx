"use client";
import { Trash2 } from "lucide-react";
import { RemoveItem } from "@/actions/customer/ProductAndStore/Cart.Action";
import { useRef, useState } from "react";

interface Props {
  productId: string;
  customerId?: string;
  variant?: "mobile" | "desktop";
}

export const RemoveButton = ({
  productId,
  customerId,
  variant = "desktop",
}: Props) => {
  const [removed, setRemoved] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null); // ← add this

  const remove = () => {
    const row = btnRef.current?.closest(
      "[data-cart-item]",
    ) as HTMLElement | null;
    if (row) row.style.display = "none";
    const fd = new FormData();
    fd.append("productId", productId);
    RemoveItem(customerId, fd).catch(() => {
      if (row) row.style.display = "";
    });
  };

  if (removed) return null;

  if (variant === "mobile")
    return (
      <button
        ref={btnRef}
        onClick={remove}
        className="flex items-center gap-1 text-[11px] font-medium transition-colors"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Trash2 size={11} />
        <span>Remove</span>
      </button>
    );

  return (
    <button
      ref={btnRef}
      onClick={remove}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400 ml-1"
      style={{ color: "var(--muted-foreground)" }}
      aria-label="Remove item"
    >
      <Trash2 size={13} />
    </button>
  );
};
