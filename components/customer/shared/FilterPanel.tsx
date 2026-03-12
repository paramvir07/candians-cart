"use client";
// components/customer/shared/FilterPanel.tsx

import { X, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  ALL_CATEGORIES,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";

export interface FilterState {
  categories: string[];
  inStockOnly: boolean;
  subsidisedOnly: boolean;
  featuredOnly: boolean;
  sortBy: "default" | "price_asc" | "price_desc" | "name_asc";
}

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  inStockOnly: false,
  subsidisedOnly: false,
  featuredOnly: true, // Default: show featured products
  sortBy: "default",
};

export function getActiveFilterCount(filters: FilterState) {
  return (
    filters.categories.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.subsidisedOnly ? 1 : 0) +
    // featuredOnly is default so we don't count it as an "active" filter badge
    (filters.sortBy !== "default" ? 1 : 0)
  );
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
  /** When true (mobile sheet), shows a fixed Apply button at bottom */
  showApplyButton?: boolean;
  onApply?: () => void;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  showApplyButton = false,
  onApply,
}: FilterPanelProps) {
  const activeCount = getActiveFilterCount(filters);

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ categories: next });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div
        className={`flex-1 overflow-y-auto ${showApplyButton ? "pb-20" : ""}`}
      >
        <button
          onClick={onReset}
          className={`flex items-center gap-1.5 text-sm text-destructive font-medium transition-colors mb-4 ${
            activeCount > 0 || !filters.featuredOnly ? "visible" : "invisible"
          }`}
        >
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </button>

        <div className="space-y-6">
          {/* Featured */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Highlights
            </h4>
            <button
              onClick={() => onChange({ featuredOnly: !filters.featuredOnly })}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left w-full ${
                filters.featuredOnly
                  ? "bg-amber-50 text-amber-700 border-amber-300 shadow-sm"
                  : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="flex-1">Featured Products</span>
              {filters.featuredOnly && (
                <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
              )}
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Category
            </h4>
            <div className="flex flex-col gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const cfg = getCategoryConfig(cat);
                const active = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                      active
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                        : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base leading-none">{cfg.emoji}</span>
                    <span className="flex-1">{cat}</span>
                    {active && (
                      <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Availability
            </h4>
            <div className="flex flex-col gap-1.5">
              {[
                {
                  key: "inStockOnly" as const,
                  label: "In stock only",
                  icon: "✅",
                },
                {
                  key: "subsidisedOnly" as const,
                  label: "Subsidised only",
                  icon: "✨",
                },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => onChange({ [key]: !filters[key] })}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                    filters[key]
                      ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                      : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>{icon}</span>
                  <span className="flex-1">{label}</span>
                  {filters[key] && (
                    <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Sort By
            </h4>
            <div className="flex flex-col gap-1.5">
              {[
                { value: "default", label: "Recommended" },
                { value: "price_asc", label: "Price: Low → High" },
                { value: "price_desc", label: "Price: High → Low" },
                { value: "name_asc", label: "Name A → Z" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({ sortBy: opt.value as FilterState["sortBy"] })
                  }
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${
                    filters.sortBy === opt.value
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Apply button for mobile sheet */}
      {showApplyButton && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <button
            onClick={onApply}
            className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
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
      className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
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
