"use client";
// components/customer/landing/CategoryPillsBar.tsx

import {
  ALL_CATEGORIES,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";

interface CategoryPillsBarProps {
  activeCategory: string | null;
  onSelect: (cat: string | null) => void;
}

export function CategoryPillsBar({
  activeCategory,
  onSelect,
}: CategoryPillsBarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelect(null)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-200 shrink-0 ${
              activeCategory === null
                ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-100"
                : "bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-700"
            }`}
          >
            🛒 All Items
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const cfg = getCategoryConfig(cat);
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelect(active ? null : cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-200 shrink-0 ${
                  active
                    ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-md`
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{cfg.emoji}</span>
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
