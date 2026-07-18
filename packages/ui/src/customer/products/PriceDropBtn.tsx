"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, TrendingDown } from "lucide-react";

export default function PriceDropBtn({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideTrigger = ref.current && !ref.current.contains(target);
      const outsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      if (outsideTrigger && outsideDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right + window.scrollX,
      });
    }
    setOpen((prev) => !prev);
  };

  const handlePriceDropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    window.open(`/cashier/price-drop/${productId}`,"_blank");
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        className={`
          inline-flex items-center justify-center h-7 w-7 rounded-lg
          transition-all duration-150
          ${open ? "bg-white/25 text-white shadow-inner" : "text-white/60 hover:text-white hover:bg-white/20"}
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50
        `}
      >
        <MoreVertical className="h-3.5 w-3.5" />
        <span className="sr-only">Open menu</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              transform: "translateX(-100%)",
              zIndex: 9999,
            }}
          >
            <div className="overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/10 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="p-1">
                <button
                  onClick={handlePriceDropClick}
                  className="
                    group relative flex w-full items-center gap-2.5
                    rounded-lg px-3 py-2 text-sm font-medium
                    text-foreground/80 transition-all duration-150
                    hover:bg-primary/10 hover:text-primary
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                  "
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <TrendingDown className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap">Price Drop</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}