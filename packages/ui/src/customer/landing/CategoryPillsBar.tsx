"use client";

import {
  ALL_CATEGORIES,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";

interface CategoryPillsBarProps {
  activeCategories: string[];
  onSelect: (cat: string | null) => void;
}

export function CategoryPillsBar({
  activeCategories,
  onSelect,
}: CategoryPillsBarProps) {
  return (
    <div className="bg-background/85 backdrop-blur-md border-b border-border/60 sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2.5 py-3 overflow-x-auto scrollbar-none">

          {/* All Items */}
          <button
            onClick={() => onSelect(null)}
            className={`
              group flex items-center gap-0 rounded-full border transition-all duration-200 shrink-0 pr-4
              ${activeCategories.length === 0
                ? "bg-green-600 border-green-600 shadow-sm"
                : "bg-card border-border/60 hover:border-green-200 hover:bg-green-50/40"
              }
            `}
          >
            {/* Emoji bubble */}
            <span className={`
              flex items-center justify-center w-9 h-9 rounded-full text-base m-0.5 shrink-0 transition-colors
              ${activeCategories.length === 0
                ? "bg-white/20"
                : "bg-secondary group-hover:bg-green-100"
              }
            `}>
              🛒
            </span>
            <span className={`
              text-sm font-semibold pl-2 whitespace-nowrap
              ${activeCategories.length === 0 ? "text-white" : "text-muted-foreground group-hover:text-green-700"}
            `}>
              All Items
            </span>
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const cfg = getCategoryConfig(cat);
            const active = activeCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`
                  group flex items-center gap-0 rounded-full border transition-all duration-200 shrink-0 pr-4
                  ${active
                    ? `${cfg.bg} ${cfg.border} shadow-sm`
                    : "bg-card border-border/60 hover:border-border hover:bg-secondary/60"
                  }
                `}
              >
                {/* Emoji bubble */}
                <span className={`
                  flex items-center justify-center w-9 h-9 rounded-full text-base m-0.5 shrink-0 transition-colors
                  ${active ? "bg-white/30" : "bg-secondary group-hover:bg-secondary"}
                `}>
                  {cfg.emoji}
                </span>
                <span className={`
                  text-sm font-semibold pl-2 whitespace-nowrap
                  ${active ? cfg.text : "text-muted-foreground"}
                `}>
                  {cat}
                </span>
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
}