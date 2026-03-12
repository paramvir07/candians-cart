"use client";
// components/customer/products/ProductDetailDialog.tsx

import { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sparkles,
  PackageX,
  PackageCheck,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Tag,
  Info,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { IProduct } from "@/types/store/products.types";
import {
  CategoryIllustration,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";
import { fmt } from "@/lib/fomatPrice";
import {
  AddtoCart,
  IncrementItem,
  DecrementItem,
  RemoveItem,
  UpdateItemQuantity,
} from "@/actions/customer/ProductAndStore/Cart.Action";

async function removeAllFromServer(
  productId: string,
  customerId: string | undefined,
) {
  const formData = new FormData();
  formData.append("productId", productId);
  await RemoveItem(customerId, formData);
}

interface ProductDetailDialogProps {
  product: IProduct;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customerId?: string;
  cartQuantity: number;
  onQuantityChange: (q: number) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  customerId,
  cartQuantity,
  onQuantityChange,
}: ProductDetailDialogProps) {
  const hasImage = product.images?.length > 0;
  const catConfig = getCategoryConfig(product.category);
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartQuantity);
  const [inputValue, setInputValue] = useState(String(cartQuantity));
  const [isQtyDirty, setIsQtyDirty] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(cartQuantity);
      setInputValue(String(cartQuantity));
      setIsQtyDirty(false);
    }
  }, [open, cartQuantity]);

  useEffect(() => {
    setInputValue(String(quantity));
    setIsQtyDirty(false);
  }, [quantity]);

  const optimisticUpdate = useCallback(
    (
      newQty: number,
      serverAction: () => Promise<void>,
      rollbackQty: number,
    ) => {
      setQuantity(newQty);
      onQuantityChange(newQty);
      setIsQtyDirty(false);
      startTransition(async () => {
        try {
          await serverAction();
        } catch {
          setQuantity(rollbackQty);
          onQuantityChange(rollbackQty);
          setInputValue(String(rollbackQty));
          setIsQtyDirty(false);
          toast.error("Something went wrong. Please try again.");
        }
      });
    },
    [onQuantityChange],
  );

  const handleAddToCart = () =>
    optimisticUpdate(
      1,
      async () => {
        const res = await AddtoCart(product._id as string, customerId);
        if (res?.success) toast.success(`${product.name} added to cart!`);
        else throw new Error("Add to cart failed");
      },
      0,
    );

  const handleIncrement = () =>
    optimisticUpdate(
      quantity + 1,
      async () => {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        await IncrementItem(customerId, fd);
      },
      quantity,
    );

  const handleDecrement = () =>
    optimisticUpdate(
      Math.max(0, quantity - 1),
      async () => {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        await DecrementItem(customerId, fd);
      },
      quantity,
    );

  const handleRemoveAll = () => {
    const prev = quantity;
    optimisticUpdate(
      0,
      async () => {
        await removeAllFromServer(product._id as string, customerId);
        toast.success(`${product.name} removed from cart`);
      },
      prev,
    );
  };

  const handleQuantityInputCommit = useCallback(() => {
    const parsed = Number(inputValue);
    if (Number.isNaN(parsed)) {
      setInputValue(String(quantity));
      setIsQtyDirty(false);
      return;
    }
    const newQty = Math.max(0, Math.min(99, parsed));
    const prevQty = quantity;
    if (newQty === prevQty) {
      setInputValue(String(prevQty));
      setIsQtyDirty(false);
      return;
    }
    setQuantity(newQty);
    onQuantityChange(newQty);
    setInputValue(String(newQty));
    setIsQtyDirty(false);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(newQty));
        const res = await UpdateItemQuantity(customerId, fd);
        if (!res?.success) throw new Error(res?.message || "Failed");
        if (newQty === 0) toast.success(`${product.name} removed from cart`);
      } catch {
        setQuantity(prevQty);
        onQuantityChange(prevQty);
        setInputValue(String(prevQty));
        setIsQtyDirty(false);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }, [
    inputValue,
    quantity,
    onQuantityChange,
    product._id,
    product.name,
    customerId,
  ]);

  const showConfirm =
    isQtyDirty &&
    !isPending &&
    !Number.isNaN(Number(inputValue)) &&
    Math.max(0, Math.min(99, Number(inputValue))) !== quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden rounded-3xl gap-0 border-0 shadow-2xl">
        {/* Hero image */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
          {!product.stock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <span className="flex items-center gap-2 bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                <PackageX className="h-4 w-4 text-red-500" />
                Currently Unavailable
              </span>
            </div>
          )}

          {/* Badges — SUBSIDISED top-left, FEATURED top-right, never overlap */}
          {product.subsidised && (
            <div className="absolute top-0 left-0 z-20">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-2xl shadow-md">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                SUBSIDISED
              </div>
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-0 right-0 z-20">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-bl-2xl shadow-md">
                ⭐ FEATURED
              </div>
            </div>
          )}

          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="512px"
            />
          ) : (
            <CategoryIllustration
              category={product.category}
              className="w-full h-full"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="bg-white">
          <div className="px-5 pt-5 pb-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
              >
                {catConfig.emoji} {product.category}
              </span>
              {product.stock ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <PackageCheck className="h-3.5 w-3.5" />
                  In Stock
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  <PackageX className="h-3.5 w-3.5" />
                  Out of Stock
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="mx-5 my-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {fmt(product.price + product.markup)}
              </p>
              {product.tax > 0 && (
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Tag className="h-3 w-3" />+{product.tax}% tax at checkout
                </p>
              )}
            </div>
            {product.subsidised && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  <Sparkles className="h-3.5 w-3.5" />
                  Subsidised
                </div>
                <p className="text-[10px] text-slate-400 text-right max-w-[130px]">
                  You may qualify for a reduced price
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-1">
            {product.stock ? (
              quantity > 0 ? (
                <div className="flex items-center gap-2">
                  {/* Trash */}
                  <button
                    type="button"
                    onClick={handleRemoveAll}
                    disabled={isPending}
                    className="w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 group"
                  >
                    <Trash2
                      size={15}
                      strokeWidth={2}
                      className="text-slate-400 group-hover:text-red-400 transition-colors"
                    />
                  </button>

                  {/* Stepper */}
                  <div className="flex items-center justify-between flex-1 min-w-0 bg-green-50 border border-green-200 rounded-2xl px-3 py-2.5 gap-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isPending}
                      className="w-8 h-8 rounded-full border border-green-200 bg-white flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-50 shadow-sm shrink-0"
                    >
                      <Minus
                        size={13}
                        strokeWidth={2.5}
                        className="text-green-700"
                      />
                    </button>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          inputMode="numeric"
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsQtyDirty(true);
                          }}
                          onBlur={handleQuantityInputCommit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          disabled={isPending}
                          className="w-16 h-8 rounded-lg border border-green-200 bg-white text-center text-base font-black text-green-800 tabular-nums outline-none focus:ring-2 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {showConfirm && (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleQuantityInputCommit}
                            disabled={isPending}
                            className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm shrink-0"
                          >
                            <Check
                              size={14}
                              strokeWidth={3}
                              className="text-white"
                            />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-green-500 font-medium mt-0.5">
                        in cart
                      </span>
                    </div>

                    {!showConfirm && (
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isPending || quantity >= 99}
                        className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm shrink-0"
                      >
                        <Plus
                          size={13}
                          strokeWidth={2.5}
                          className="text-white"
                        />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isPending}
                  className="group relative w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  <ShoppingCart className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white tracking-wide">
                    Add to Cart
                  </span>
                </button>
              )
            ) : (
              <div className="w-full h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2">
                <PackageX className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">
                  Out of Stock
                </span>
              </div>
            )}
            {product.stock && quantity === 0 && (
              <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                <Info className="h-3 w-3" />
                Free to remove from cart anytime
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
