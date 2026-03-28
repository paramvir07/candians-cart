"use client";
import { Trash2 } from "lucide-react";
import { RemoveItem } from "@/actions/customer/ProductAndStore/Cart.Action";

interface Props {
  productId: string;
  customerId?: string;
  variant?: "mobile" | "desktop";
}

export const RemoveButton = ({ productId, customerId, variant = "desktop" }: Props) => {
  const remove = () => {
    const fd = new FormData();
    fd.append("productId", productId);
    RemoveItem(customerId, fd);
  };

  if (variant === "mobile") return (
    <button onClick={remove} className="flex items-center gap-1 text-[11px] font-medium transition-colors"
      style={{ color: "var(--muted-foreground)" }}>
      <Trash2 size={11} /><span>Remove</span>
    </button>
  );

  return (
    <button onClick={remove} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400 ml-1"
      style={{ color: "var(--muted-foreground)" }} aria-label="Remove item">
      <Trash2 size={13} />
    </button>
  );
};