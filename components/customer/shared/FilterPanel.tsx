"use client";
// components/customer/shared/FilterPanel.tsx

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import {
  ALL_CATEGORIES,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";

export interface FilterState {
  categories: string[];
  inStockOnly: boolean;
  subsidisedOnly: boolean;
  sortBy: "default" | "price_asc" | "price_desc" | "name_asc";
}

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  inStockOnly: false,
  subsidisedOnly: false,
  sortBy: "default",
};

// export function getActiveFilterCount(filters: FilterState) {
//   return (
//     filters.categories.length +
//     (filters.inStockOnly ? 1 : 0) +
//     (filters.subsidisedOnly ? 1 : 0) +
//     (filters.sortBy !== "default" ? 1 : 0)
//   );
// }

const CATEGORY_GROUPS: string[][] = [
  ["Fruits", "Vegetables", "Produce"],
];

export function getActiveFilterCount(filters: FilterState) {
  // Count grouped categories as 1
  const counted = new Set<string>();
  let categoryCount = 0;
  for (const cat of filters.categories) {
    const group = CATEGORY_GROUPS.find((g) => g.includes(cat));
    const key = group ? group.join(",") : cat;
    if (!counted.has(key)) {
      counted.add(key);
      categoryCount++;
    }
  }
  return (
    categoryCount +
    (filters.inStockOnly ? 1 : 0) +
    (filters.subsidisedOnly ? 1 : 0) +
    (filters.sortBy !== "default" ? 1 : 0)
  );
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
  showApplyButton?: boolean;
  onApply?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2.5">
      {children}
    </h4>
  );
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  showApplyButton = false,
  onApply,
}: FilterPanelProps) {
  const searchParams = useSearchParams();
  const activeCount  = getActiveFilterCount(filters);

  // On mount: reset to defaults then apply only what the URL specifies,
  // so selecting one filter from the footer never stacks on prior filters.
  //   ?subsidisedOnly=true     - from the subsidy popup "View all" button
  //   ?category=Fresh+Produce  - from footer category links
  useEffect(() => {
    const subsidisedParam = searchParams.get("subsidisedOnly") === "true";
    const cat             = searchParams.get("category");
    const validCat        = cat && ALL_CATEGORIES.includes(cat) ? cat : null;

    if (!subsidisedParam && !validCat) return;

    onChange({
      ...DEFAULT_FILTERS,
      subsidisedOnly: subsidisedParam,
      categories:     validCat ? [validCat] : [],
    });
  }, [searchParams]);

  // const toggleCategory = (cat: string) => {
  //   const next = filters.categories.includes(cat)
  //     ? filters.categories.filter((c) => c !== cat)
  //     : [...filters.categories, cat];
  //   onChange({ categories: next });
  // };

  const CATEGORY_GROUPS: string[][] = [
  ["Fruits", "Vegetables", "Produce"],
];

const toggleCategory = (cat: string) => {
  const group = CATEGORY_GROUPS.find((g) => g.includes(cat));
  const toToggle = group ?? [cat];
  const isActive = toToggle.some((c) => filters.categories.includes(c));
  const next = isActive
    ? filters.categories.filter((c) => !toToggle.includes(c))
    : [...new Set([...filters.categories, ...toToggle])];
  onChange({ categories: next });
};

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 overflow-y-auto pr-2 ${showApplyButton ? "pb-20" : ""}`}>

        {/* Clear all */}
        <button
          onClick={onReset}
          className={`flex items-center gap-1.5 text-xs font-semibold text-destructive transition-colors mb-5 ${
            activeCount > 0 ? "visible" : "invisible"
          }`}
        >
          <X className="h-3 w-3" />
          Clear all filters
        </button>

        <div className="space-y-6">

          {/* ── Categories ── */}
          <div>
            <SectionLabel>Category</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const cfg    = getCategoryConfig(cat);
                const active = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-0 rounded-full border transition-all duration-150 text-left pr-3 ${
                      active
                        ? `${cfg.bg} ${cfg.border} shadow-sm`
                        : "bg-card border-border/60 hover:border-border hover:bg-secondary/60"
                    }`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm m-0.5 shrink-0 transition-colors ${
                      active ? "bg-white/30" : "bg-secondary"
                    }`}>
                      {cfg.emoji}
                    </span>
                    <span className={`text-sm font-semibold pl-2 flex-1 ${
                      active ? cfg.text : "text-muted-foreground"
                    }`}>
                      {cat}
                    </span>
                    {active && <X className="h-3 w-3 opacity-50 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Availability ── */}
          <div>
            <SectionLabel>Availability</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {[
                { key: "inStockOnly"    as const, label: "In stock only",   emoji: "✅" },
                { key: "subsidisedOnly" as const, label: "Subsidised only", emoji: "✨" },
              ].map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => onChange({ [key]: !filters[key] })}
                  className={`flex items-center gap-0 rounded-full border transition-all duration-150 text-left pr-3 ${
                    filters[key]
                      ? "bg-green-500/10 border-green-300 shadow-sm"
                      : "bg-card border-border/60 hover:border-border hover:bg-secondary/60"
                  }`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm m-0.5 shrink-0 transition-colors ${
                    filters[key] ? "bg-white/40" : "bg-secondary"
                  }`}>
                    {emoji}
                  </span>
                  <span className={`text-sm font-semibold pl-2 flex-1 ${
                    filters[key] ? "text-green-700" : "text-muted-foreground"
                  }`}>
                    {label}
                  </span>
                  {filters[key] && <X className="h-3 w-3 opacity-50 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sort ── */}
          <div>
            <SectionLabel>Sort By</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {[
                { value: "default",    label: "Recommended"       },
                { value: "price_asc",  label: "Price: Low → High" },
                { value: "price_desc", label: "Price: High → Low" },
                { value: "name_asc",   label: "Name A → Z"        },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ sortBy: opt.value as FilterState["sortBy"] })}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold border text-left transition-all duration-150 ${
                    filters.sortBy === opt.value
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-card text-muted-foreground border-border/60 hover:border-border hover:bg-secondary/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Apply button */}
      {showApplyButton && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border/40">
          <button
            onClick={onApply}
            className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
          >
            Apply Filters
            {activeCount > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeCount} active
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function FilterTriggerButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150"
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
          {activeCount}
        </span>
      )}
    </button>
  );
}