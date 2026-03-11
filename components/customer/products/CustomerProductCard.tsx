"use client";
// components/customer/products/CustomerProductCard.tsx

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  PackageX,
  PackageCheck,
  X,
  ShoppingCart,
  Loader2,
  Plus,
  Minus,
  Tag,
  Info,
  Trash2,
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
} from "@/actions/customer/ProductAndStore/Cart.Action";

// ─── Shared helper ────────────────────────────────────────────────────────────

async function removeAllFromServer(
  productId: string,
  customerId: string | undefined,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const formData = new FormData();
    formData.append("productId", productId);
    await DecrementItem(customerId, formData);
  }
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  customerId,
  cartQuantity,
  onQuantityChange,
}: {
  product: IProduct;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customerId?: string;
  cartQuantity: number;
  onQuantityChange: (q: number) => void;
}) {
  const hasImage = product.images?.length > 0;
  const catConfig = getCategoryConfig(product.category);
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartQuantity);

  useEffect(() => {
    setQuantity(cartQuantity);
  }, [cartQuantity]);

  const sync = (q: number) => {
    setQuantity(q);
    onQuantityChange(q);
  };

  const handleAddToCart = () => {
    sync(1);
    startTransition(async () => {
      try {
        const res = await AddtoCart(product._id as string, customerId);
        if (res?.success) {
          toast.success(`${product.name} added to cart!`);
        } else {
          sync(0);
        }
      } catch {
        sync(0);
        toast.error("Failed to add to cart");
      }
    });
  };

  const handleIncrement = () => {
    sync(quantity + 1);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product._id as string);
        await IncrementItem(customerId, formData);
      } catch {
        sync(Math.max(0, quantity - 1));
      }
    });
  };

  const handleDecrement = () => {
    sync(Math.max(0, quantity - 1));
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product._id as string);
        await DecrementItem(customerId, formData);
      } catch {
        sync(quantity + 1);
      }
    });
  };

  const handleRemoveAll = () => {
    const prev = quantity;
    sync(0);
    startTransition(async () => {
      try {
        await removeAllFromServer(product._id as string, customerId, prev);
        toast.success(`${product.name} removed from cart`);
      } catch {
        sync(prev);
        toast.error("Failed to remove item");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden rounded-3xl gap-0 border-0 shadow-2xl">
        {/* ── Hero Image ── */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
          {!product.stock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <span className="flex items-center gap-2 bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                <PackageX className="h-4 w-4 text-red-500" />
                Currently Unavailable
              </span>
            </div>
          )}
          {product.subsidised && (
            <div className="absolute top-0 left-0 z-20">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-2xl shadow-md">
                <Sparkles className="h-3.5 w-3.5" />
                SUBSIDISED
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

        {/* ── Content ── */}
        <div className="bg-white">
          <div className="px-5 pt-5 pb-3 space-y-2">
            <div className="flex items-center justify-between">
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

          {/* ── Price ── */}
          <div className="mx-5 my-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {fmt(product.price)}
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

          {/* ── CTA ── */}
          <div className="px-5 pb-5 pt-1">
            {product.stock ? (
              quantity > 0 ? (
                /* ── Dialog stepper with trash ── */
                <div className="flex items-center gap-2">
                  {/* Trash button */}
                  <button
                    type="button"
                    onClick={handleRemoveAll}
                    disabled={isPending}
                    className="w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                    title="Remove all from cart"
                  >
                    <Trash2
                      size={15}
                      strokeWidth={2}
                      className="text-slate-400"
                    />
                  </button>

                  {/* Stepper pill */}
                  <div className="flex items-center justify-between flex-1 bg-green-50 border border-green-200 rounded-2xl px-3 py-2.5">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isPending}
                      className="w-8 h-8 rounded-full border border-green-200 bg-white flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <Minus
                        size={13}
                        strokeWidth={2.5}
                        className="text-green-700"
                      />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-black text-green-800 tabular-nums leading-none">
                        {quantity}
                      </span>
                      <span className="text-[10px] text-green-500 font-medium mt-0.5">
                        in cart
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={isPending || quantity >= 99}
                      className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <Plus
                        size={13}
                        strokeWidth={2.5}
                        className="text-white"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Add to cart ── */
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isPending}
                  className="group relative w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 text-white" />
                      <span className="text-sm font-bold text-white tracking-wide">
                        Add to Cart
                      </span>
                    </>
                  )}
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

// ─── Card ─────────────────────────────────────────────────────────────────────

export function CustomerProductCard({
  customerId,
  product,
  cartQuantity = 0,
}: {
  customerId?: string;
  product: IProduct;
  cartQuantity?: number;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartQuantity);

  useEffect(() => {
    setQuantity(cartQuantity);
  }, [cartQuantity]);

  const hasImage = product.images?.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(1);
    startTransition(async () => {
      try {
        const res = await AddtoCart(product._id as string, customerId);
        if (res?.success) {
          toast.success(`${product.name} added to cart!`);
        } else {
          setQuantity(0);
        }
      } catch {
        setQuantity(0);
        toast.error("Failed to add to cart");
      }
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => q + 1);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product._id as string);
        await IncrementItem(customerId, formData);
      } catch {
        setQuantity((q) => Math.max(0, q - 1));
      }
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => Math.max(0, q - 1));
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product._id as string);
        await DecrementItem(customerId, formData);
      } catch {
        setQuantity((q) => q + 1);
      }
    });
  };

  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = quantity;
    setQuantity(0);
    startTransition(async () => {
      try {
        await removeAllFromServer(product._id as string, customerId, prev);
        toast.success(`${product.name} removed from cart`);
      } catch {
        setQuantity(prev);
        toast.error("Failed to remove item");
      }
    });
  };

  return (
    <>
      <ProductDetailDialog
        product={product}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerId={customerId}
        cartQuantity={quantity}
        onQuantityChange={setQuantity}
      />

      <div
        onClick={() => setDialogOpen(true)}
        className="group w-full cursor-pointer text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {!product.stock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Unavailable
              </span>
            </div>
          )}
          {product.subsidised && (
            <div className="absolute top-0 left-0 z-10">
              <div className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-xl">
                <Sparkles className="h-3 w-3" />
                SUBSIDISED
              </div>
            </div>
          )}
          <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 flex items-end justify-center pb-3">
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 bg-white/95 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-slate-100">
              View details →
            </span>
          </div>
          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              onError={() => setImgError(true)}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <CategoryIllustration
              category={product.category}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Body */}
        <div className="p-3.5 flex flex-col gap-1.5 flex-1">
          <span
            className={`self-start inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
          >
            {catConfig.emoji} {product.category}
          </span>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
            <span className="text-base font-black text-slate-900">
              {fmt(product.price)}
            </span>
            {product.stock ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-400" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center" style={{ minHeight: "36px" }}>
            {quantity > 0 ? (
              /* ── Card stepper with trash ── */
              <div
                className="flex items-center gap-1.5 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Trash */}
                <button
                  type="button"
                  onClick={handleRemoveAll}
                  disabled={isPending}
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                  title="Remove all"
                >
                  <Trash2
                    size={13}
                    strokeWidth={2}
                    className="text-slate-400"
                  />
                </button>

                {/* − qty + */}
                <div className="flex items-center justify-between flex-1 bg-green-50 border border-green-200 rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={isPending}
                    className="w-6 h-6 rounded-full border border-green-200 bg-white flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <Minus
                      size={11}
                      strokeWidth={2.5}
                      className="text-green-700"
                    />
                  </button>
                  <span className="text-sm font-bold text-green-800 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={isPending || quantity >= 99}
                    className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Plus size={11} strokeWidth={2.5} className="text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant={product.stock ? "default" : "secondary"}
                disabled={!product.stock || isPending}
                onClick={handleAddToCart}
                className={`w-full rounded-xl h-9 text-xs font-bold transition-all ${
                  product.stock
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }`}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                )}
                {product.stock ? "Add to Cart" : "Out of Stock"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
