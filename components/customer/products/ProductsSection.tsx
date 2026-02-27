"use client";
// components/customer/products/ProductsSection.tsx

import { useState, useMemo, useRef } from "react";
import { IProduct } from "@/types/store/products.types";
import { CustomerProductCard } from "@/components/customer/products/CustomerProductCard";
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
import { Sparkles, Flame, ChevronRight, PackageOpen } from "lucide-react";

const ITEMS_PER_PAGE = 16;

interface ProductsSectionProps {
  products: IProduct[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };
  const handleCategorySelect = (cat: string | null) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    scrollToGrid();
  };

  const activeFilterCount =
    getActiveFilterCount(filters) + (activeCategory ? 1 : 0);

  // Apply all filters + sort
  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory)
      result = result.filter((p) => p.category === activeCategory);
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
    return result;
  }, [products, activeCategory, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const subsidisedProducts = products.filter((p) => p.subsidised).slice(0, 8);
  const popularProducts = products.filter((p) => p.stock).slice(0, 8);
  const isShowingAll = !activeCategory && getActiveFilterCount(filters) === 0;

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

  const scrollToGrid = () =>
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {/* Sticky category pills */}
      <CategoryPillsBar
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-[57px] bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 pb-4">
                <span className="font-bold text-slate-900 text-sm">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Featured rows — only when no filters are active */}
            {isShowingAll && (
              <>
                {subsidisedProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-500" />
                        Subsidised
                      </h2>
                      <button
                        onClick={() => updateFilters({ subsidisedOnly: true })}
                        className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-0.5 group"
                      >
                        See all
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {subsidisedProducts.map((p) => (
                        <CustomerProductCard key={p._id} product={p} />
                      ))}
                    </div>
                  </div>
                )}

                {popularProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Popular Right Now
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {popularProducts.map((p) => (
                        <CustomerProductCard key={p._id} product={p} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* All products grid */}
            <div ref={gridRef}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    {activeCategory
                      ? activeCategory
                      : isShowingAll
                        ? "All Products"
                        : "Results"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                    {activeFilterCount > 0 && (
                      <>
                        {" · "}
                        <button
                          onClick={() => {
                            resetFilters();
                            setActiveCategory(null);
                          }}
                          className="text-green-600 hover:text-green-700 font-medium"
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

              {paginated.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {paginated.map((product) => (
                    <CustomerProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <PackageOpen className="h-12 w-12 opacity-30" />
                  <p className="font-semibold text-slate-600">
                    No products found
                  </p>
                  <p className="text-sm text-center max-w-xs">
                    Try adjusting your filters or browse all categories.
                  </p>
                  <button
                    onClick={() => {
                      resetFilters();
                      setActiveCategory(null);
                    }}
                    className="text-sm text-green-600 font-semibold hover:text-green-700 underline underline-offset-2"
                  >
                    Start fresh
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
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
                            setCurrentPage((p) => p - 1);
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
                              setCurrentPage(page as number);
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
                            setCurrentPage((p) => p + 1);
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

      {/* Mobile Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base">
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterPanel
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
