"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { IProduct } from "@/types/store/products.types";
import { CustomerProductCard } from "@/components/customer/products/CustomerProductCard";
import {
  FilterPanel,
  FilterTriggerButton,
  FilterState,
  DEFAULT_FILTERS,
  getActiveFilterCount,
} from "@/components/customer/shared/FilterPanel";
import { SearchNav } from "@/components/customer/search/SearchNav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Filter, Loader2, PackageOpen, Search } from "lucide-react";
import { Customer } from "@/types/customer/customer";

interface SearchResultsClientProps {
  customerId?: string;
  storeId: string;
  searchAction: (
    query: string,
    storeId: string,
  ) => Promise<{
    success: boolean;
    data?: IProduct[];
    error?: string;
  }>;
  customerData: Customer;
  cartCount: number;
}

const QUICK_SUGGESTIONS = [
  "🥭 Fruits",
  "🥦 Vegetables",
  "🥛 Dairy",
  "🍗 Meat",
  "🫓 Bakery",
  "🧃 Beverages",
  "🍿 Snacks",
  "🧹 Household",
  "🌶️ Spices",
  "☕ Tea & Coffee",
  "🫘 Pulses & Lentils",
  "🍮 Sweets & Mithai",
];

export function SearchResultsClient({
  customerId,
  storeId,
  searchAction,
  customerData,
  cartCount,
}: SearchResultsClientProps) {
  const [query, setQuery] = useState("");
  const [allResults, setAllResults] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Ref to scroll to results heading when filters change
  const resultsRef = useRef<HTMLDivElement>(null);
  const isFirstFilterRender = useRef(true);

  // Scroll to results top whenever filters change (but not on initial mount)
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    if (!resultsRef.current) return;
    const rect = resultsRef.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    // 70px offset for the sticky SearchNav
    window.scrollTo({ top: absoluteTop - 70, behavior: "smooth" });
  }, [filters]);

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const activeFilterCount = getActiveFilterCount(filters);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setAllResults([]);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      const res = await searchAction(query.trim(), storeId);
      if (res.success && res.data) {
        setAllResults(res.data);
      } else {
        setAllResults([]);
      }
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, storeId]);

  // Apply filters + sort, featured always on top
  const filtered = useMemo(() => {
    let result = [...allResults];
    if (filters.categories.length > 0)
      result = result.filter((p) => filters.categories.includes(p.category));
    if (filters.inStockOnly) result = result.filter((p) => p.stock);
    if (filters.subsidisedOnly) result = result.filter((p) => p.subsidised);
    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    // Featured always floats to top
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return result;
  }, [allResults, filters]);

  return (
    <div className={!customerId ? "min-h-screen bg-[#f7f8fa]" : "min-h-screen"}>
      <SearchNav
        customerId={customerId}
        initialQuery={query}
        onQueryChange={setQuery}
        customerData={customerData}
        cartCount={cartCount}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          {/* Desktop sidebar — only when there are results */}
          {hasSearched && allResults.length > 0 && !customerId && (
            <aside className="hidden lg:flex flex-col w-60 shrink-0">
              <div
                className="sticky top-[4.5rem] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
                style={{ maxHeight: "calc(100vh - 5rem)" }}
              >
                <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-slate-50 shrink-0">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-slate-900 text-sm">
                    Refine
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <FilterPanel
                    filters={filters}
                    onChange={updateFilters}
                    onReset={resetFilters}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Results column */}
          <div className="flex-1 min-w-0">
            {/* Idle — no query yet */}
            {!query.trim() && !hasSearched && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-600 text-lg">
                    What are you looking for?
                  </p>
                  <p className="text-sm mt-1">
                    Type above to search products, or scan a barcode
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s.split(" ").slice(1).join(" "))}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-green-300 hover:text-green-700 transition-colors shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="font-medium">Searching…</span>
              </div>
            )}

            {/* Results */}
            {!isLoading && hasSearched && (
              <>
                {/* Toolbar — this is the scroll target */}
                <div
                  ref={resultsRef}
                  className="flex items-center justify-between mb-5"
                >
                  <div>
                    <p className="text-slate-900 font-semibold">
                      {filtered.length > 0
                        ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                        : "No results"}{" "}
                      <span className="text-slate-400 font-normal">
                        for &ldquo;{query}&rdquo;
                      </span>
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-xs text-green-600 font-medium hover:text-green-700 mt-0.5"
                      >
                        Clear {activeFilterCount} filter
                        {activeFilterCount !== 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                  {allResults.length > 0 && (
                    <div className="lg:hidden">
                      <FilterTriggerButton
                        activeCount={activeFilterCount}
                        onClick={() => setFilterSheetOpen(true)}
                      />
                    </div>
                  )}
                </div>

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filtered.map((product) => (
                      <CustomerProductCard
                        customerId={customerId}
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : allResults.length > 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <PackageOpen className="h-10 w-10 opacity-30" />
                    <p className="font-semibold text-slate-600">
                      No products match your filters
                    </p>
                    <button
                      onClick={resetFilters}
                      className="text-sm text-green-600 font-semibold hover:text-green-700 underline underline-offset-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="text-5xl">🔍</div>
                    <p className="font-semibold text-slate-600 text-lg">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-sm text-center max-w-xs">
                      Try a different spelling or browse by category on the home
                      page.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[80%] sm:max-w-[360px] p-0 flex flex-col overflow-hidden"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base text-slate-900">
              <Filter className="h-4 w-4 text-slate-400" />
              Refine Results
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto px-5 pt-3 pb-24">
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>

            {/* Fixed apply button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
              >
                Show {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount} filter
                    {activeFilterCount !== 1 ? "s" : ""}
                  </span>
                )}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
