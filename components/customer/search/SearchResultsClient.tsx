"use client";
import { getStoreProductsFiltered } from "@/actions/admin/products/getProductsFiltered.action";
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
import {
  Loader2,
  PackageOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Customer } from "@/types/customer/customer";
import { getCartQuantities } from "@/actions/customer/ProductAndStore/Cart.Action";
import { useDebounce } from "use-debounce";

interface SearchResultsClientProps {
  customerId?: string;
  storeId: string;
  searchAction: (
    query: string,
    storeId: string,
  ) => Promise<{ success: boolean; data?: IProduct[]; error?: string }>;
  customerData: Customer;
  cartCount: number;
}

const QUICK_SUGGESTIONS = [
  { emoji: "🥭", label: "Fruits" },
  { emoji: "🥦", label: "Vegetables" },
  // { emoji: "🥕", label: "Produce" },
  { emoji: "🥛", label: "Dairy" },
  { emoji: "🍗", label: "Meat" },
  { emoji: "🫓", label: "Bakery" },
  { emoji: "🧃", label: "Beverages" },
  { emoji: "🍿", label: "Snacks" },
  { emoji: "🧹", label: "Household" },
  { emoji: "🌶️", label: "Spices" },
  { emoji: "☕", label: "Tea & Coffee" },
  { emoji: "🫘", label: "Pulses & Lentils" },
  { emoji: "🍮", label: "Sweets & Mithai" },
];

export function SearchResultsClient({
  customerId,
  storeId,
  searchAction,
  customerData,
  cartCount,
}: SearchResultsClientProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [allResults, setAllResults] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [cartMap, setCartMap] = useState<Record<string, number>>({});

  // 1. Fetch Cart State
  useEffect(() => {
    const fetchInitialCart = async () => {
      try {
        const map = await getCartQuantities(customerId);
        if (map) setCartMap(map);
      } catch (error) {
        console.error("Failed to fetch cart products quantities:", error);
      }
    };
    fetchInitialCart();
  }, []);

  const resultsRef = useRef<HTMLDivElement>(null);
  const isFirstFilterRender = useRef(true);

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    if (!resultsRef.current) return;
    const rect = resultsRef.current.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top - 70,
      behavior: "smooth",
    });
  }, [filters]);

  const updateFilters = (partial: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...partial }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const activeFilterCount = getActiveFilterCount(filters);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      if (!filters.categories.length) {
        setAllResults([]);
        setHasSearched(false);
      } else {
        // Query cleared but category filter still active — re-fetch by category
        const reload = async () => {
          setIsLoading(true);
          setHasSearched(true);
          const res = await getStoreProductsFiltered(storeId, 1, 200, {
            categories: filters.categories as any,
          });
          setAllResults(res.success && res.data ? res.data : []);
          setIsLoading(false);
        };
        reload();
      }
      return;
    }
    const fetchResult = async () => {
      setIsLoading(true);
      setHasSearched(true);
      const res = await searchAction(debouncedQuery.trim(), storeId);
      setAllResults(res.success && res.data ? res.data : []);
      setIsLoading(false);
    };
    fetchResult();
  }, [debouncedQuery, storeId]);

  // Re-fetch when categories change via quick suggestions (no active search query)
  useEffect(() => {
    if (debouncedQuery.trim()) return; // search mode handles its own fetching
    if (!hasSearched) return; // nothing shown yet, no need to refetch

    const load = async () => {
      setIsLoading(true);
      if (filters.categories.length === 0) {
        // No categories selected — reset back to idle
        setAllResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }
      const res = await getStoreProductsFiltered(storeId, 1, 200, {
        categories: filters.categories as any,
      });
      setAllResults(res.success && res.data ? res.data : []);
      setIsLoading(false);
    };
    load();
  }, [filters.categories, storeId, debouncedQuery, hasSearched]);

  const displayPrice = (p: IProduct) => p.price + p.price * (p.markup / 100);

  const filtered = useMemo(() => {
    let result = [...allResults];
    if (filters.categories.length > 0)
      result = result.filter((p) => filters.categories.includes(p.category));
    if (filters.inStockOnly) result = result.filter((p) => p.stock);
    if (filters.subsidisedOnly) result = result.filter((p) => p.subsidised);
    switch (filters.sortBy) {
      // To this:
      case "price_asc":
        result.sort((a, b) => displayPrice(a) - displayPrice(b));
        break;
      case "price_desc":
        result.sort((a, b) => displayPrice(b) - displayPrice(a));
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return result;
  }, [allResults, filters]);

  return (
    <div className="min-h-screen bg-muted/30">
      <SearchNav
        customerId={customerId}
        initialQuery={query}
        onQueryChange={setQuery}
        customerData={customerData}
        cartCount={cartCount}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* ── Desktop sidebar ── */}
          {/* {hasSearched && allResults.length > 0 && !customerId && ( */}
          {hasSearched && allResults.length > 0 && !customerId && (
            <aside className="hidden lg:flex flex-col w-64 shrink-0">
              <div
                className="sticky top-18 rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col"
                style={{ maxHeight: "calc(100vh - 5rem)" }}
              >
                {/* Sidebar header */}
                <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-border/40 shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="font-bold text-foreground text-sm">
                    Refine
                  </span>
                  {activeFilterCount > 0 && (
                    <>
                      <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                        {activeFilterCount}
                      </span>
                      <button
                        onClick={resetFilters}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <FilterPanel
                    filters={filters}
                    onChange={updateFilters}
                    onReset={resetFilters}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* ── Results column ── */}
          <div className="flex-1 min-w-0">
            {/* ── Idle state ── */}
            {!query.trim() && !hasSearched && (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                {/* Icon */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-card border border-border/60 flex items-center justify-center shadow-sm">
                    <Search className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
                </div>

                <div className="text-center">
                  <p className="font-bold text-foreground text-xl tracking-tight">
                    What are you looking for?
                  </p>
                  <p className="text-muted-foreground text-sm mt-1.5 max-w-xs">
                    Type above to search products, or scan a barcode
                  </p>
                </div>

                {/* Quick suggestion pills — reference style */}
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={async () => {
                        const CATEGORY_MAP: Record<string, string[]> = {
                          // Produce: ["Fruits", "Vegetables", "Produce"],
                        };
                        const labelsToAdd = CATEGORY_MAP[s.label] ?? [s.label];
                        // const newCategories = filters.categories.includes(
                        //   s.label,
                        // )
                        //   ? filters.categories
                        //   : [...filters.categories, s.label];
                        const newCategories = filters.categories.includes(
                          s.label,
                        )
                          ? filters.categories.filter(
                              (c) => !labelsToAdd.includes(c),
                            )
                          : [
                              ...new Set([
                                ...filters.categories,
                                ...labelsToAdd,
                              ]),
                            ];

                        setFilters((prev) => ({
                          ...prev,
                          categories: newCategories,
                        }));

                        if (!query.trim()) {
                          setIsLoading(true);
                          setHasSearched(true);
                          const res = await getStoreProductsFiltered(
                            storeId,
                            1,
                            200,
                            {
                              categories: newCategories as any,
                            },
                          );
                          setAllResults(
                            res.success && res.data ? res.data : [],
                          );
                          setIsLoading(false);
                        }
                      }}
                      className="group flex items-center gap-0 rounded-full border border-border/60 bg-card hover:border-green-200 hover:bg-green-50/40 transition-all duration-200 pr-4 shrink-0"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-green-100/70 m-0.5 text-sm transition-colors">
                        {s.emoji}
                      </span>
                      <span className="text-sm font-semibold pl-2 text-muted-foreground group-hover:text-green-700 whitespace-nowrap">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Loading ── */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-card border border-border/60 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Searching…
                </p>
              </div>
            )}

            {/* ── Results ── */}
            {!isLoading && hasSearched && (
              <>
                {/* Toolbar */}
                <div
                  ref={resultsRef}
                  className="flex items-center justify-between mb-5 gap-3"
                >
                  <div>
                    <p className="font-bold text-foreground">
                      {filtered.length > 0
                        ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                        : "No results"}{" "}
                      <span className="text-muted-foreground font-normal text-sm">
                        {/* for &ldquo;{query}&rdquo; */}
                      </span>
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-xs text-green-600 font-semibold hover:text-green-700 mt-0.5 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
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

                {/* Product grid */}
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filtered.map((product) => (
                      <CustomerProductCard
                        subsidyPage={false}
                        customerId={customerId}
                        key={product._id}
                        product={product}
                        cartQuantity={cartMap[product._id as string] || 0}
                      />
                    ))}
                  </div>
                ) : allResults.length > 0 ? (
                  /* Filters returned nothing */
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center">
                      <PackageOpen className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">
                        No products match your filters
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting or clearing your filters
                      </p>
                    </div>
                    <button
                      onClick={resetFilters}
                      className="h-9 px-5 rounded-full bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  /* No results at all */
                  <>
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-card border border-border/60 flex items-center justify-center text-3xl shadow-sm">
                        🔍
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground text-lg">
                          Nothing found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                          Try a different spelling or browse by category
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setQuery("");
                          setAllResults([]);
                          setHasSearched(false);
                          setFilters(DEFAULT_FILTERS);
                        }}
                        className="h-9 px-5 rounded-full border border-border/60 bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all"
                      >
                        Clear search
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter sheet ── */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[85%] sm:max-w-90 p-0 flex flex-col overflow-hidden rounded-l-3xl"
        >
          <SheetHeader className="px-5 pt-5 pb-3.5 border-b border-border/40 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base text-foreground">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              Refine Results
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto px-5 pt-4 pb-28">
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>

            {/* Fixed apply button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border/40">
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
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
