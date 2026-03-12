"use client";
// components/customer/products/ProductsSection.tsx

import { useState, useMemo, useRef, useEffect } from "react";
import { IProduct } from "@/types/store/products.types";
import { CustomerProductCard } from "@/components/customer/products/CustomerProductCard";
import { getCartQuantities } from "@/actions/customer/ProductAndStore/Cart.Action";
import {
  FilterPanel,
  FilterTriggerButton,
  FilterState,
  DEFAULT_FILTERS,
  getActiveFilterCount,
} from "@/components/customer/shared/FilterPanel";
import { CategoryPillsBar } from "@/components/customer/landing/CategoryPillsBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PackageOpen, Filter } from "lucide-react";

const ITEMS_PER_PAGE = 16;

interface ProductsSectionProps {
  products: IProduct[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // State to hold a map of Product ID -> Quantity in Cart
  const [cartMap, setCartMap] = useState<Record<string, number>>({});

  // Fetch the cart on load to populate initial quantities
  useEffect(() => {
    const fetchInitialCart = async () => {
      try {
        const map = await getCartQuantities();
        if (map) setCartMap(map);
      } catch (error) {
        console.error("Failed to fetch cart quantities:", error);
      }
    };
    fetchInitialCart();
  }, []);

  // Double rAF: first frame lets React commit+paint, second measures fresh DOM
  const scrollToGrid = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;
        // 120px = navbar (~56px) + category pills (~56px) + breathing room
        window.scrollTo({ top: absoluteTop - 120, behavior: "smooth" });
      });
    });
  };

  const triggerTransition = (fn: () => void) => {
    setIsTransitioning(true);
    fn();
    setTimeout(() => setIsTransitioning(false), 350);
  };

  const updateFilters = (partial: Partial<FilterState>) => {
    triggerTransition(() => {
      setFilters((prev) => ({ ...prev, ...partial }));
      setCurrentPage(1);
    });
    scrollToGrid();
  };

  const resetFilters = () => {
    triggerTransition(() => {
      setFilters(DEFAULT_FILTERS);
      setCurrentPage(1);
    });
    scrollToGrid();
  };

  const handleCategorySelect = (cat: string | null) => {
    if (cat === null) {
      updateFilters({ categories: [] });
    } else {
      const next = filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat];
      updateFilters({ categories: next });
    }
  };

  const activeFilterCount = getActiveFilterCount(filters);

  // Apply all filters + sort, then always float featured products to the top
  const filtered = useMemo(() => {
    let result = [...products];

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

    // Featured products always float to top, preserving relative order within each group
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return result;
  }, [products, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Derive heading label
  const headingLabel =
    filters.categories.length === 1
      ? filters.categories[0]
      : filters.categories.length > 1
        ? "Multiple Categories"
        : "All Products";

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  return (
    <>
      {/* Sticky category pills */}
      <CategoryPillsBar
        activeCategories={filters.categories}
        onSelect={handleCategorySelect}
      />

      <div ref={gridRef}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* ── Desktop sidebar — sticky + internally scrollable ── */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0">
            <div
              className="sticky top-[3.75rem] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
              style={{ maxHeight: "calc(100vh - 5rem)" }}
            >
              <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-slate-50 shrink-0">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-900 text-sm">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {/* Scrollable filter body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <FilterPanel
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Scroll anchor sits HERE — at the top of the product grid */}
            <div className="scroll-mt-28">
              {/* ── Attractive heading ── */}
              <div className="flex items-end justify-between mb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none">
                      {headingLabel}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    <span className="text-slate-600 font-semibold">
                      {filtered.length}
                    </span>{" "}
                    item{filtered.length !== 1 ? "s" : ""}
                    {activeFilterCount > 0 && (
                      <>
                        {" · "}
                        <button
                          onClick={resetFilters}
                          className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                        >
                          Clear filters
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Mobile filter trigger */}
                <div className="lg:hidden">
                  <FilterTriggerButton
                    activeCount={activeFilterCount}
                    onClick={() => setFilterSheetOpen(true)}
                  />
                </div>
              </div>

              {/* Thin accent bar under heading */}
              <div className="flex items-center gap-2 mb-5">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    filters.categories.length === 1
                      ? "w-10 bg-linear-to-r from-green-400 to-emerald-500"
                      : "w-8 bg-green-500"
                  }`}
                />
                <div className="h-1 w-4 rounded-full bg-slate-100" />
              </div>

              {/* ── Product grid with fade transition ── */}
              <div
                className={`transition-opacity duration-300 ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {paginated.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {paginated.map((product, i) => (
                      <div
                        key={product._id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <CustomerProductCard
                          product={product}
                          cartQuantity={cartMap[product._id as string] || 0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <PackageOpen className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-bold text-slate-600">
                      No products found
                    </p>
                    <p className="text-sm text-center max-w-xs text-slate-400">
                      Try adjusting your filters or browse all categories.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-1 text-sm text-green-600 font-semibold hover:text-green-700 underline underline-offset-2 transition-colors"
                    >
                      Start fresh
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-slate-100">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            triggerTransition(() =>
                              setCurrentPage((p) => p - 1),
                            );
                            scrollToGrid();
                          }
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-40"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, i) => (
                      <PaginationItem key={i}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              triggerTransition(() =>
                                setCurrentPage(page as number),
                              );
                              scrollToGrid();
                            }}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            triggerTransition(() =>
                              setCurrentPage((p) => p + 1),
                            );
                            scrollToGrid();
                          }
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-40"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Sheet — scrollable content + fixed Apply button ── */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[80%] sm:max-w-[360px] p-0 flex flex-col overflow-hidden"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base text-slate-900">
              <Filter className="h-4 w-4 text-slate-400" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable filter body with relative positioning for the fixed button */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto px-5 pt-3 pb-24">
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>

            {/* Fixed Apply button inside sheet */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <button
                onClick={() => {
                  setFilterSheetOpen(false);
                  scrollToGrid();
                }}
                className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
              >
                Show {filtered.length} Result
                {filtered.length !== 1 ? "s" : ""}
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

      {/* ── Global animation keyframes ── */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.35s ease both;
        }
      `}</style>
    </>
  );
}
