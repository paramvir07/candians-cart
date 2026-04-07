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

  const quantityStep = product.isMeasuredInWeight ? 0.01 : 1;
  const vegetablesCategory = product.category === "Vegetables";
  const fruitsCategory = product.category === "Fruits";

  const formatQtyForInput = useCallback(
    (value: number) => {
      if (product.isMeasuredInWeight) {
        return Number.isInteger(value) ? String(value) : String(value);
      }
      return String(Math.trunc(value));
    },
    [product.isMeasuredInWeight],
  );

  const normalizeQuantity = useCallback(
    (rawValue: string) => {
      const trimmed = rawValue.trim();

      if (trimmed === "") return null;

      const parsed = Number(trimmed);

      if (!Number.isFinite(parsed)) return null;

      const bounded = Math.max(0, Math.min(99, parsed));

      if (product.isMeasuredInWeight) {
        return Math.round(bounded * 100) / 100;
      }

      return Math.trunc(bounded);
    },
    [product.isMeasuredInWeight],
  );

  useEffect(() => {
    if (open) {
      setQuantity(cartQuantity);
      setInputValue(formatQtyForInput(cartQuantity));
      setIsQtyDirty(false);
    }
  }, [open, cartQuantity, formatQtyForInput]);

  useEffect(() => {
    setInputValue(formatQtyForInput(quantity));
    setIsQtyDirty(false);
  }, [quantity, formatQtyForInput]);

  const optimisticUpdate = useCallback(
    (
      newQty: number,
      serverAction: () => Promise<void>,
      rollbackQty: number,
    ) => {
      setQuantity(newQty);
      onQuantityChange(newQty);
      setInputValue(formatQtyForInput(newQty));
      setIsQtyDirty(false);

      startTransition(async () => {
        try {
          await serverAction();
        } catch {
          setQuantity(rollbackQty);
          onQuantityChange(rollbackQty);
          setInputValue(formatQtyForInput(rollbackQty));
          setIsQtyDirty(false);
          toast.error("Something went wrong. Please try again.");
        }
      });
    },
    [onQuantityChange, formatQtyForInput],
  );

  const handleAddToCart = () => {
    const initialQty = 1;

    optimisticUpdate(
      initialQty,
      async () => {
        const res = await AddtoCart(product._id as string, customerId);
        if (res?.success) {
          toast.success(`${product.name} added to cart!`);
        } else {
          throw new Error("Add to cart failed");
        }
      },
      0,
    );
  };

  const handleIncrement = () => {
    const next = Math.min(99, quantity + quantityStep);
    const normalizedNext = product.isMeasuredInWeight
      ? Math.round(next * 100) / 100
      : Math.trunc(next);

    optimisticUpdate(
      normalizedNext,
      async () => {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(normalizedNext));

        const res = await UpdateItemQuantity(customerId, fd);
        if (!res?.success) throw new Error(res?.message || "Failed");
      },
      quantity,
    );
  };

  const handleDecrement = () => {
    const next = Math.max(0, quantity - quantityStep);
    const normalizedNext = product.isMeasuredInWeight
      ? Math.round(next * 100) / 100
      : Math.trunc(next);

    optimisticUpdate(
      normalizedNext,
      async () => {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(normalizedNext));

        const res = await UpdateItemQuantity(customerId, fd);
        if (!res?.success) throw new Error(res?.message || "Failed");

        if (normalizedNext === 0) {
          toast.success(`${product.name} removed from cart`);
        }
      },
      quantity,
    );
  };

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
    const newQty = normalizeQuantity(inputValue);

    if (newQty === null) {
      setInputValue(formatQtyForInput(quantity));
      setIsQtyDirty(false);
      return;
    }

    const prevQty = quantity;

    if (newQty === prevQty) {
      setInputValue(formatQtyForInput(prevQty));
      setIsQtyDirty(false);
      return;
    }

    setQuantity(newQty);
    onQuantityChange(newQty);
    setInputValue(formatQtyForInput(newQty));
    setIsQtyDirty(false);

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(newQty));

        const res = await UpdateItemQuantity(customerId, fd);
        if (!res?.success) throw new Error(res?.message || "Failed");

        if (newQty === 0) {
          toast.success(`${product.name} removed from cart`);
        }
      } catch {
        setQuantity(prevQty);
        onQuantityChange(prevQty);
        setInputValue(formatQtyForInput(prevQty));
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
    normalizeQuantity,
    formatQtyForInput,
  ]);

  const normalizedInputQty = normalizeQuantity(inputValue);

  const showConfirm =
    isQtyDirty &&
    !isPending &&
    normalizedInputQty !== null &&
    normalizedInputQty !== quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm overflow-hidden rounded-3xl border-0 p-0 shadow-2xl gap-0">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "4/3" }}
        >
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

          {!product.stock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
              <span className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-bold text-white shadow backdrop-blur-sm">
                <PackageX className="h-4 w-4" />
                Unavailable
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {product.subsidised && (
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-teal-500/90 px-2.5 py-1 text-[10px] font-bold leading-none text-white shadow-md shadow-teal-900/30 backdrop-blur-sm">
                <BadgeDollarSign
                  className="h-3 w-3 shrink-0"
                  strokeWidth={2.5}
                />
                SUBSIDISED
              </div>
            )}
            {product.isFeatured && (
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-bold leading-none text-amber-950 shadow-md shadow-amber-900/30 backdrop-blur-sm">
                <Star
                  className="h-3 w-3 shrink-0 fill-amber-950"
                  strokeWidth={2}
                />
                FEATURED
              </div>
            )}
          </div>

          <div className="absolute top-3 right-12 z-20">
            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow backdrop-blur-sm ${
                product.stock
                  ? "bg-emerald-500/80 border-emerald-400/30 text-white"
                  : "bg-red-500/80 border-red-400/30 text-white"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 shrink-0 rounded-full bg-white ${
                  product.stock ? "animate-pulse" : ""
                }`}
              />
              {product.stock ? "In Stock" : "Sold Out"}
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="space-y-4 bg-white px-5 pt-1 pb-5">
          <div className="space-y-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
            >
              {catConfig.emoji} {(vegetablesCategory || fruitsCategory) ? "Produce" : product.category }
            </span>

            <h2 className="text-lg font-black leading-tight text-foreground">
              {product.name}
            </h2>

            {product.description && (
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/60 px-4 py-3">
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Price
              </p>
              <p className="text-2xl font-black tracking-tight text-primary">
                {fmt(product.price + product.price * (product.markup / 100))}
                {product.UOM && `/${product.UOM?.toUpperCase()}`}
              </p>
              {product.tax > 0 && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Tag className="h-3 w-3" />+{product.tax}% tax at checkout
                </p>
              )}
            </div>

            {product.subsidised && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700">
                  <BadgeDollarSign
                    className="h-3 w-3 shrink-0"
                    strokeWidth={2.5}
                  />
                  Subsidised
                </div>
                <p className="max-w-[120px] text-right text-[10px] text-muted-foreground">
                  You may qualify for a reduced price
                </p>
              </div>
            )}
          </div>

          <div>
            {product.stock ? (
              quantity > 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveAll}
                    disabled={isPending}
                    className="group/trash h-11 w-11 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-40"
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <Trash2
                        size={15}
                        strokeWidth={2}
                        className="text-slate-400 transition-colors group-hover/trash:text-red-400"
                      />
                    </div>
                  </button>

                  <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-secondary px-2.5 py-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isPending}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white transition-colors hover:bg-primary/10 disabled:opacity-50"
                    >
                      <Minus
                        size={13}
                        strokeWidth={2.5}
                        className="text-primary"
                      />
                    </button>

                    <div className="flex flex-1 flex-col items-center gap-0.5">
                      <div className="flex w-full items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          step={product.isMeasuredInWeight ? "0.01" : "1"}
                          inputMode={
                            product.isMeasuredInWeight ? "decimal" : "numeric"
                          }
                          value={inputValue}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (value === "") {
                              setInputValue(value);
                              setIsQtyDirty(true);
                              return;
                            }

                            if (!product.isMeasuredInWeight) {
                              if (!/^\d+$/.test(value)) return;
                            } else {
                              if (!/^\d*([.]\d{0,2})?$/.test(value)) return;
                            }

                            setInputValue(value);
                            setIsQtyDirty(true);
                          }}
                          onBlur={handleQuantityInputCommit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          disabled={isPending}
                          className="h-8 w-14 rounded-lg border border-border bg-white text-center text-base font-black text-foreground tabular-nums outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />

                        {showConfirm && (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleQuantityInputCommit}
                            disabled={isPending}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <Check
                              size={13}
                              strokeWidth={3}
                              className="text-primary-foreground"
                            />
                          </button>
                        )}
                      </div>

                      <span className="text-[10px] font-medium text-primary/70">
                        in cart
                      </span>
                    </div>

                    {!showConfirm && (
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isPending || quantity >= 99}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:opacity-90 disabled:opacity-50"
                      >
                        <Plus
                          size={13}
                          strokeWidth={2.5}
                          className="text-primary-foreground"
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
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-primary/20 bg-secondary text-primary shadow-sm transition-all duration-150 hover:bg-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-sm font-bold tracking-wide">
                    Add to Cart
                  </span>
                </button>
              )
            ) : (
              <div className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100">
                <CircleDot className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
