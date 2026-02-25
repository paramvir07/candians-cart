"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PackageOpen } from "lucide-react";

// Shadcn Pagination Imports
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Imports
import { getStoreProductsPaginated } from "@/actions/admin/getStoreProductsPaginated";
import { searchProducts } from "@/actions/common/searchProducts.action";
import { ProductSubsidisedRow } from "./ProductSubsidisedRow";
import { SearchBar } from "@/components/shared/SearchBar";

export interface SubsidisedProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  subsidised: boolean;
}

export const StoreProductsList = ({ storeId }: { storeId: string }) => {
  const [products, setProducts] = useState<SubsidisedProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      const result = await getStoreProductsPaginated(storeId, currentPage, 26);

      if (!isMounted) return;

      if (result.success) {
        setProducts(result.data as SubsidisedProduct[]);
        setTotalPages(result.totalPages ?? 1);
      } else {
        toast.error(result.error || "Failed to fetch products");
      }

      setIsLoading(false);
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [storeId, currentPage]);

  const handleSearchAction = async (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      const res = await getStoreProductsPaginated(storeId, currentPage, 25);
      if (res.success) {
        setTotalPages(res.totalPages ?? 1);
        return {
          success: true as const,
          data: res.data as SubsidisedProduct[],
        };
      }
      return {
        success: false as const,
        error: "Failed to fetch original products",
      };
    }

    setIsSearchMode(true);
    const res = await searchProducts(query, storeId);

    if (res.success) {
      return {
        success: true as const,
        data: res.data as unknown as SubsidisedProduct[],
      };
    } else {
      return { success: false as const, error: res.error || "Search failed" };
    }
  };

  // Helper to calculate which page numbers to show (handles ellipses for many pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "ellipsis",
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          {isSearchMode ? "Search Results" : "All Products"}
        </h2>

        <SearchBar<SubsidisedProduct>
          placeholder="Search product name or category..."
          searchAction={handleSearchAction}
          onSearchStart={() => setIsLoading(true)}
          onResults={(data) => {
            setProducts(data);
            setIsLoading(false);
          }}
        />
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductSubsidisedRow key={product._id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-8 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <PackageOpen className="h-10 w-10 mb-2 opacity-40 text-slate-400" />
            <p>
              {isSearchMode
                ? "No products matched your search."
                : "No products found for this store."}
            </p>
          </div>
        )}
      </div>

      {/* Shadcn Pagination Controls */}
      {!isSearchMode && totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1 && !isLoading) {
                      setIsLoading(true);
                      setCurrentPage((p) => p - 1);
                    }
                  }}
                  className={
                    currentPage === 1 || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage !== page && !isLoading) {
                          setIsLoading(true);
                          setCurrentPage(page as number);
                        }
                      }}
                      className={
                        isLoading
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages && !isLoading) {
                      setIsLoading(true);
                      setCurrentPage((p) => p + 1);
                    }
                  }}
                  className={
                    currentPage === totalPages || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
