"use client";
// components/customer/products/CustomerProductCard.tsx

import { useState, useTransition, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShoppingCart,
  Loader2,
  Plus,
  Minus,
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
import { ProductDetailDialog } from "@/components/customer/products/ProductDetailDialog";

async function removeAllFromServer(
  productId: string,
  customerId: string | undefined,
) {
  const formData = new FormData();
  formData.append("productId", productId);
  await RemoveItem(customerId, formData);
}

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
  const [inputValue, setInputValue] = useState(String(cartQuantity));
  const [isQtyDirty, setIsQtyDirty] = useState(false);

  useEffect(() => {
    setQuantity(cartQuantity);
    setInputValue(String(cartQuantity));
    setIsQtyDirty(false);
  }, [cartQuantity]);

  useEffect(() => {
    setInputValue(String(quantity));
    setIsQtyDirty(false);
  }, [quantity]);

  const hasImage = product.images?.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(1);
    setIsQtyDirty(false);
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
    setIsQtyDirty(false);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        await IncrementItem(customerId, fd);
      } catch {
        setQuantity((q) => Math.max(0, q - 1));
      }
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => Math.max(0, q - 1));
    setIsQtyDirty(false);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        await DecrementItem(customerId, fd);
      } catch {
        setQuantity((q) => q + 1);
      }
    });
  };

  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = quantity;
    setQuantity(0);
    setIsQtyDirty(false);
    startTransition(async () => {
      try {
        await removeAllFromServer(product._id as string, customerId);
        toast.success(`${product.name} removed from cart`);
      } catch {
        setQuantity(prev);
        toast.error("Failed to remove item");
      }
    });
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
        setInputValue(String(prevQty));
        setIsQtyDirty(false);
        toast.error("Failed to update quantity");
      }
    });
  }, [inputValue, quantity, product._id, product.name, customerId]);

  const showConfirm =
    isQtyDirty &&
    !isPending &&
    !Number.isNaN(Number(inputValue)) &&
    Math.max(0, Math.min(99, Number(inputValue))) !== quantity;

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
        className="group w-full h-full cursor-pointer text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
          {!product.stock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Unavailable
              </span>
            </div>
          )}

          {/* SUBSIDISED — always top-left, always rounded-br */}
          {product.subsidised && (
            <div className="absolute top-0 left-0 z-10">
              <div className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-xl leading-none whitespace-nowrap">
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                SUBSIDISED
              </div>
            </div>
          )}

          {/* FEATURED — always top-right, always rounded-bl */}
          {product.isFeatured && (
            <div className="absolute top-0 right-0 z-10">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl leading-none whitespace-nowrap">
                ⭐ FEATURED
              </div>
            </div>
          )}

          {/* Hover overlay */}
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
        <div className="p-3.5 flex flex-col flex-1 min-h-0">
          <div className="flex flex-col gap-1.5 flex-1">
            <span
              className={`self-start inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
            >
              {catConfig.emoji} {product.category}
            </span>

            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-green-700 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
              <span className="text-base font-black text-slate-900">
                {fmt(product.price + product.markup)}
              </span>
              {product.stock ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Cart controls */}
          <div className="mt-3 flex items-center min-h-[36px]">
            {quantity > 0 ? (
              <div
                className="flex items-center justify-center gap-1.5 w-full min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Trash */}
                <button
                  type="button"
                  onClick={handleRemoveAll}
                  disabled={isPending}
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 group/trash"
                >
                  <Trash2
                    size={13}
                    strokeWidth={2}
                    className="text-slate-400 group-hover/trash:text-red-400 transition-colors"
                  />
                </button>

                {/* Stepper row */}
                <div className="flex items-center bg-green-50 border border-green-200 rounded-xl px-1.5 py-1 gap-1">
                  {/* Minus */}
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={isPending}
                    className="w-6 h-6 rounded-full border border-green-200 bg-white flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Minus
                      size={11}
                      strokeWidth={2.5}
                      className="text-green-700"
                    />
                  </button>

                  {/* Input + Plus/Check — takes remaining space */}
                  <div className="flex items-center justify-center flex-1 min-w-0 gap-1">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      inputMode="numeric"
                      value={inputValue}
                      onChange={(e) => {
                        e.stopPropagation();
                        setInputValue(e.target.value);
                        setIsQtyDirty(true);
                      }}
                      onBlur={handleQuantityInputCommit}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                      disabled={isPending}
                      className="w-10 h-6 rounded-md border border-green-200 bg-white text-center text-sm font-bold text-green-800 tabular-nums outline-none focus:ring-1 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shrink-0"
                    />

                    {showConfirm ? (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityInputCommit();
                        }}
                        disabled={isPending}
                        className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <Check
                          size={11}
                          strokeWidth={3}
                          className="text-white"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isPending || quantity >= 99}
                        className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <Plus
                          size={11}
                          strokeWidth={2.5}
                          className="text-white"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant={product.stock ? "default" : "secondary"}
                disabled={!product.stock || isPending}
                onClick={handleAddToCart}
                className={`w-full rounded-xl h-10 text-xs font-bold transition-all ${
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
