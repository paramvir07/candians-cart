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
import { CheckSquare, Square, Wallet, ShoppingBag } from "lucide-react";
import { AddSubsidyItem, saveSubsidytoWallet } from "@/actions/customer/SubsidyItems.Action";
import { toast } from "sonner";

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function SubsidizedPopup({
  subsidyGot,
  customerId,
  isOpen,
  onOpenChange,
}: {
  subsidyGot: number;
  customerId?: string;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p._id)));
  };

  const selectedProducts = products.filter((p) => selected.has(p._id));
  const totalActual = selectedProducts.reduce((sum, p) => sum + p.price / 100, 0);
  const subsidy = subsidyGot;
  const youPay = Math.max(0, totalActual - subsidy);
  const allSelected = selected.size === products.length && products.length > 0;


  
  const handleAddSubsidyItems = async () =>{
    AddSubsidyItem(selectedProducts,(subsidy*100), customerId)
    onOpenChange(false)
  }

  const savetoWallet = async () =>{
    const res = await saveSubsidytoWallet(customerId);
    if(res?.success){
      onOpenChange(false)
      toast.success(res.message);
      return
    }
    toast.success(res?.message);
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0 gap-0 overflow-hidden border-0 shadow-2xl
          w-[calc(100vw-24px)] max-w-[480px]
          sm:w-full sm:max-w-[480px]
          lg:max-w-[540px]
          rounded-2xl
        "
        style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0"
                style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight">
                  Subsidised Pack
                </DialogTitle>
              </div>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex gap-2 mt-3 sm:mt-4">
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl bg-green-50 border border-green-100">
              <span className="text-[11px] sm:text-[12px] font-semibold text-green-700">Subsidy</span>
              <span className="text-[12px] sm:text-[13px] font-bold text-green-600">${subsidy.toFixed(2)}</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] sm:text-[12px] font-semibold text-gray-500">Items</span>
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-700">{products.length}</span>
            </div>
          </div>
        </DialogHeader>

        {/* ── Product list ── */}
        <div className="overflow-y-auto" style={{ maxHeight: "min(320px, 40vh)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <div className="w-5 h-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
              <span className="text-sm">Loading products…</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2.5 pl-4 sm:pl-5 pr-2 text-left">
                    <button onClick={toggleAll} className="flex items-center gap-2 group">
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-green-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                      )}
                      <span className="text-[11px] sm:text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                        Item
                      </span>
                    </button>
                  </th>
                  <th className="py-2.5 pr-4 sm:pr-5 text-right text-[11px] sm:text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Full Pack row */}
                <tr
                  className="border-b border-gray-50 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={toggleAll}
                >
                  <td className="py-3 pl-4 sm:pl-5 pr-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 shrink-0" />
                      )}
                      <span className="text-[13px] sm:text-[14px] font-bold text-gray-800">
                        Full Pack (All Items)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 sm:pr-5 text-right text-[13px] sm:text-[14px] font-bold text-gray-900">
                    {fmt(products.reduce((s, p) => s + p.price, 0))}
                  </td>
                </tr>

                {/* Individual products */}
                {products.map((product) => {
                  const isChecked = selected.has(product._id);
                  return (
                    <tr
                      key={product._id}
                      className="border-b border-gray-50 cursor-pointer hover:bg-gray-50/80 transition-colors"
                      onClick={() => toggle(product._id)}
                    >
                      <td className="py-3 pl-4 sm:pl-5 pr-2">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 shrink-0" />
                          )}
                          <span className="text-[13px] sm:text-[14px] text-gray-700">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 sm:pr-5 text-right text-[13px] sm:text-[14px] text-gray-600">
                        {fmt(product.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Summary ── */}
        {!loading && (
          <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-2 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] sm:text-[13px] text-gray-500">Total Actual Price:</span>
              <span className="text-[12px] sm:text-[13px] font-semibold text-gray-700">
                ${totalActual.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[12px] sm:text-[13px] font-semibold text-green-600">Subsidy Applied:</span>
              <span className="text-[12px] sm:text-[13px] font-semibold text-green-600">
                −${subsidy.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-[14px] sm:text-[15px] font-bold text-gray-900">You Pay:</span>
              <span className="text-[16px] sm:text-[18px] font-extrabold text-green-600">
                ${youPay.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-t border-gray-100 bg-white">
          <Button
          onClick={savetoWallet}
            variant="outline"
            className="flex-1 h-9 sm:h-10 rounded-xl border-gray-200 text-gray-700 font-semibold text-[12px] sm:text-[13px] gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Save to Wallet
          </Button>
          <Button
            className="flex-1 h-9 sm:h-10 rounded-xl font-semibold text-[12px] sm:text-[13px] gap-1.5 text-white"
            style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
            disabled={selected.size === 0}
            onClick={handleAddSubsidyItems}
          >
            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Confirm</span>
            <span className="sm:hidden">Confirm</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}