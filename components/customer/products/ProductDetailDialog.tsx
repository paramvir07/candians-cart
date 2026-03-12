"use client";
// components/customer/products/ProductDetailDialog.tsx

import { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  BadgeDollarSign,
  Star,
  PackageX,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Tag,
  Trash2,
  Check,
  Loader2,
  CircleDot,
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
    (newQty: number, serverAction: () => Promise<void>, rollbackQty: number) => {
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
    optimisticUpdate(1, async () => {
      const res = await AddtoCart(product._id as string, customerId);
      if (res?.success) toast.success(`${product.name} added to cart!`);
      else throw new Error("Add to cart failed");
    }, 0);

  const handleIncrement = () =>
    optimisticUpdate(quantity + 1, async () => {
      const fd = new FormData();
      fd.append("productId", product._id as string);
      await IncrementItem(customerId, fd);
    }, quantity);

  const handleDecrement = () =>
    optimisticUpdate(Math.max(0, quantity - 1), async () => {
      const fd = new FormData();
      fd.append("productId", product._id as string);
      await DecrementItem(customerId, fd);
    }, quantity);

  const handleRemoveAll = () => {
    const prev = quantity;
    optimisticUpdate(0, async () => {
      await removeAllFromServer(product._id as string, customerId);
      toast.success(`${product.name} removed from cart`);
    }, prev);
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
  }, [inputValue, quantity, onQuantityChange, product._id, product.name, customerId]);

  const showConfirm =
    isQtyDirty &&
    !isPending &&
    !Number.isNaN(Number(inputValue)) &&
    Math.max(0, Math.min(99, Number(inputValue))) !== quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm p-0 overflow-hidden rounded-3xl gap-0 border-0 shadow-2xl">

        {/* ── Full-bleed hero image ── */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
          {/* image / illustration */}
          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="512px"
            />
          ) : (
            <CategoryIllustration category={product.category} className="w-full h-full" />
          )}

          {/* Out of stock dimmer */}
          {!product.stock && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full border border-white/30 shadow">
                <PackageX className="h-4 w-4" />
                Unavailable
              </span>
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {product.subsidised && (
              <div className="flex items-center gap-1.5 bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full leading-none whitespace-nowrap shadow-md shadow-teal-900/30">
                <BadgeDollarSign className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                SUBSIDISED
              </div>
            )}
            {product.isFeatured && (
              <div className="flex items-center gap-1.5 bg-amber-400/90 backdrop-blur-sm text-amber-950 text-[10px] font-bold px-2.5 py-1 rounded-full leading-none whitespace-nowrap shadow-md shadow-amber-900/30">
                <Star className="h-3 w-3 shrink-0 fill-amber-950" strokeWidth={2} />
                FEATURED
              </div>
            )}
          </div>

          {/* Top-right: stock pill */}
          <div className="absolute top-3 right-12 z-20">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border text-[10px] font-bold shadow ${
              product.stock
                ? "bg-emerald-500/80 border-emerald-400/30 text-white"
                : "bg-red-500/80 border-red-400/30 text-white"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 bg-white ${product.stock ? "animate-pulse" : ""}`} />
              {product.stock ? "In Stock" : "Sold Out"}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Bottom gradient fade into white */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        </div>

        {/* ── Content body ── */}
        <div className="bg-white px-5 pt-1 pb-5 space-y-4">

          {/* Category + name */}
          <div className="space-y-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
              {catConfig.emoji} {product.category}
            </span>
            <h2 className="text-lg font-black text-foreground leading-tight">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Price block */}
          <div className="flex items-center justify-between bg-secondary/60 border border-border rounded-2xl px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-2xl font-black text-primary tracking-tight">
                {fmt(product.price + product.markup)}
              </p>
              {product.tax > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  +{product.tax}% tax at checkout
                </p>
              )}
            </div>
            {product.subsidised && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-xl">
                  <BadgeDollarSign className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                  Subsidised
                </div>
                <p className="text-[10px] text-muted-foreground text-right max-w-[120px]">
                  You may qualify for a reduced price
                </p>
              </div>
            )}
          </div>

          {/* ── Cart controls ── */}
          <div>
            {product.stock ? (
              quantity > 0 ? (
                <div className="flex items-center gap-2">
                  {/* Trash */}
                  <button
                    type="button"
                    onClick={handleRemoveAll}
                    disabled={isPending}
                    className="w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 group/trash"
                  >
                    <Trash2 size={15} strokeWidth={2} className="text-slate-400 group-hover/trash:text-red-400 transition-colors" />
                  </button>

                  {/* Stepper */}
                  <div className="flex-1 flex items-center bg-secondary border border-border rounded-2xl px-2.5 py-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isPending}
                      className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Minus size={13} strokeWidth={2.5} className="text-primary" />
                    </button>

                    <div className="flex flex-col items-center flex-1 gap-0.5">
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          inputMode="numeric"
                          value={inputValue}
                          onChange={(e) => { setInputValue(e.target.value); setIsQtyDirty(true); }}
                          onBlur={handleQuantityInputCommit}
                          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                          disabled={isPending}
                          className="w-14 h-8 rounded-lg border border-border bg-white text-center text-base font-black text-foreground tabular-nums outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {showConfirm && (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleQuantityInputCommit}
                            disabled={isPending}
                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                          >
                            <Check size={13} strokeWidth={3} className="text-primary-foreground" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-primary/70 font-medium">in cart</span>
                    </div>

                    {!showConfirm && (
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isPending || quantity >= 99}
                        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <Plus size={13} strokeWidth={2.5} className="text-primary-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isPending}
                  className="group relative w-full h-12 rounded-2xl bg-secondary text-primary border border-primary/20 hover:bg-primary/15 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none" />
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-sm font-bold tracking-wide">Add to Cart</span>
                </button>
              )
            ) : (
              <div className="w-full h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2">
                <CircleDot className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">Out of Stock</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}