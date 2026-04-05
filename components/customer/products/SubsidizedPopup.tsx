"use client";

import { useState, useEffect } from "react";
import { getSubsidizedProducts } from "@/actions/customer/ProductAndStore/Cart.Action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IProduct } from "@/types/store/products.types";
import { Sparkles, ArrowRight } from "lucide-react";
import { AddSubsidyItem } from "@/actions/customer/SubsidyItems.Action";
import { useAtom } from "jotai";
import { UsedSubsidy } from "@/atoms/customer/CartAtom";
import { useRouter } from "next/navigation";

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const VISIBLE_LIMIT = 4;

export function SubsidizedPopup({
  subsidyGot,
  customerId,
  isOpen,
  onOpenChange,
  alreadyAddedIds = [],
}: {
  subsidyGot: number;
  customerId?: string;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  alreadyAddedIds?: string[];
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [usedSubsidy] = useAtom(UsedSubsidy);
  const router = useRouter();

  useEffect(() => {
    getSubsidizedProducts(customerId)
      .then((data) => {
        setProducts(data);
        setSelected(new Set());
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Only non-already-added products, capped at VISIBLE_LIMIT
  const selectableProducts = products
    .filter((p) => !alreadyAddedIds.includes(p._id))
    .slice(0, VISIBLE_LIMIT);

  // All visible products (including already-added), capped at VISIBLE_LIMIT
  const visibleProducts = products.slice(0, VISIBLE_LIMIT);

  const hasMore = products.length > VISIBLE_LIMIT;

  const toggleAll = () => {
    if (selected.size === selectableProducts.length) setSelected(new Set());
    else setSelected(new Set(selectableProducts.map((p) => p._id)));
  };

  const selectedProducts = products.filter((p) => selected.has(p._id));
  const totalActual = selectedProducts.reduce(
    (sum, p) => sum + p.price / 100,
    0,
  );
  const subsidy = subsidyGot - usedSubsidy / 100;
  const youPay = Math.max(0, totalActual - subsidy);
  const allSelected =
    selected.size === selectableProducts.length &&
    selectableProducts.length > 0;

  const handleAddSubsidyItems = async () => {
    AddSubsidyItem(selectedProducts, subsidy * 100, customerId);
    onOpenChange(false);
  };

  const handleViewAll = () => {
    onOpenChange(false);
    // Navigate to /customer with subsidisedOnly filter flag in search params
    router.push("/customer?subsidisedOnly=true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden border-0 shadow-2xl w-[calc(100vw-24px)] max-w-[460px] sm:w-full sm:max-w-[460px] rounded-3xl"
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[16px] font-bold text-gray-900 leading-tight">
                Subsidy Items
              </DialogTitle>
              <p className="text-[12px] text-gray-400 mt-0.5 leading-none">
                Select what you'd like to add
              </p>
            </div>
          </div>

          {/* Subsidy pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 w-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[12px] font-medium text-emerald-700">
              Available subsidy
            </span>
            <span className="ml-auto text-[14px] font-extrabold text-emerald-600">
              ${subsidy.toFixed(2)}
            </span>
          </div>
        </DialogHeader>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-100 mx-5" />

        {/* ── Product list ── */}
        <div className="px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2.5 text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-[13px]">Loading…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* Select All row */}
              {selectableProducts.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${allSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}
                  >
                    {allSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-gray-700">
                    Select all ({selectableProducts.length})
                  </span>
                  <span className="ml-auto text-[12px] font-semibold text-gray-400">
                    {fmt(selectableProducts.reduce((s, p) => s + p.price, 0))}
                  </span>
                </button>
              )}

              {/* Separator */}
              <div className="h-px bg-gray-100 my-1" />

              {/* Individual products — capped at VISIBLE_LIMIT */}
              {visibleProducts.map((product) => {
                const isChecked = selected.has(product._id);
                const alreadyAdded = alreadyAddedIds.includes(product._id);

                return (
                  <button
                    key={product._id}
                    disabled={alreadyAdded}
                    onClick={() => !alreadyAdded && toggle(product._id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors ${
                      alreadyAdded
                        ? "opacity-50 cursor-not-allowed"
                        : isChecked
                          ? "bg-emerald-50/70"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    {alreadyAdded ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                        In Cart
                      </span>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    <span
                      className={`text-[13px] flex-1 ${alreadyAdded ? "text-gray-400" : isChecked ? "text-gray-900 font-medium" : "text-gray-700"}`}
                    >
                      {product.name}
                    </span>
                    <span
                      className={`text-[13px] font-semibold tabular-nums ${alreadyAdded ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {fmt(
                        product.price + product.price * (product.markup / 100),
                      )}
                    </span>
                  </button>
                );
              })}

              {/* View all button — only shown when there are more than VISIBLE_LIMIT products */}
              {hasMore && (
                <>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={handleViewAll}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-[13px] font-semibold text-emerald-700">
                        View all subsidy items
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                        {products.length - VISIBLE_LIMIT}+ more
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Summary ── */}
        {!loading && selected.size > 0 && (
          <div className="mx-5 mb-4 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">Subtotal</span>
                <span className="text-[12px] font-semibold text-gray-700 tabular-nums">
                  ${totalActual.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-emerald-600 font-medium">
                  Subsidy
                </span>
                <span className="text-[12px] font-semibold text-emerald-600 tabular-nums">
                  −${Math.min(subsidy, totalActual).toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-900">
                  You pay
                </span>
                <span className="text-[16px] font-extrabold text-gray-900 tabular-nums">
                  ${youPay.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-5 pb-5">
          <Button
            className="w-full h-11 rounded-2xl font-bold text-[14px] text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
            disabled={selected.size === 0}
            onClick={handleAddSubsidyItems}
          >
            Add{" "}
            {selected.size > 0
              ? `${selected.size} item${selected.size > 1 ? "s" : ""}`
              : "Items"}{" "}
            to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
