"use client";
// components/customer/products/CustomerProductCard.tsx

import { useState, useTransition, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  BadgeDollarSign,
  Star,
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
  RemoveItem,
  UpdateItemQuantity,
} from "@/actions/customer/ProductAndStore/Cart.Action";
import { ProductDetailDialog } from "@/components/customer/products/ProductDetailDialog";
import { Button } from "@/components/ui/button";

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
  subsidyPage: boolean;
}) {
  const vegetablesCategory = product.category === "Vegetables";
  const fruitsCategory = product.category === "Fruits";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartQuantity);
  const [inputValue, setInputValue] = useState(String(cartQuantity));
  const [isQtyDirty, setIsQtyDirty] = useState(false);

  const quantityStep = product.isMeasuredInWeight ? 0.01 : 1;

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
    setQuantity(cartQuantity);
    setInputValue(formatQtyForInput(cartQuantity));
    setIsQtyDirty(false);
  }, [cartQuantity, formatQtyForInput]);

  useEffect(() => {
    setInputValue(formatQtyForInput(quantity));
    setIsQtyDirty(false);
  }, [quantity, formatQtyForInput]);

  const hasImage = product.images?.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    const initialQty = product.isMeasuredInWeight ? 1 : 1;
    setQuantity(initialQty);
    setInputValue(formatQtyForInput(initialQty));
    setIsQtyDirty(false);

    startTransition(async () => {
      try {
        const res = await AddtoCart(product._id as string, customerId);
        if (res?.success) {
          toast.success(`${product.name} added to cart!`);
        } else {
          setQuantity(0);
          setInputValue("0");
        }
      } catch {
        setQuantity(0);
        setInputValue("0");
        toast.error("Failed to add to cart");
      }
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();

    const prev = quantity;
    const next = Math.min(99, prev + quantityStep);
    const normalizedNext = product.isMeasuredInWeight
      ? Math.round(next * 100) / 100
      : Math.trunc(next);

    setQuantity(normalizedNext);
    setInputValue(formatQtyForInput(normalizedNext));
    setIsQtyDirty(false);

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(normalizedNext));

        const res = await UpdateItemQuantity(customerId, fd);
        if (!res?.success) throw new Error(res?.message || "Failed");
      } catch {
        setQuantity(prev);
        setInputValue(formatQtyForInput(prev));
        toast.error("Failed to update quantity");
      }
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();

    const prev = quantity;
    const next = Math.max(0, prev - quantityStep);
    const normalizedNext = product.isMeasuredInWeight
      ? Math.round(next * 100) / 100
      : Math.trunc(next);

    setQuantity(normalizedNext);
    setInputValue(formatQtyForInput(normalizedNext));
    setIsQtyDirty(false);

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(normalizedNext));

        const res = await UpdateItemQuantity(customerId, fd);
        if (!res?.success) throw new Error(res?.message || "Failed");

        if (normalizedNext === 0) {
          toast.success(`${product.name} removed from cart`);
        }
      } catch {
        setQuantity(prev);
        setInputValue(formatQtyForInput(prev));
        toast.error("Failed to update quantity");
      }
    });
  };

  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = quantity;
    setQuantity(0);
    setInputValue("0");
    setIsQtyDirty(false);

    startTransition(async () => {
      try {
        await removeAllFromServer(product._id as string, customerId);
        toast.success(`${product.name} removed from cart`);
      } catch {
        setQuantity(prev);
        setInputValue(formatQtyForInput(prev));
        toast.error("Failed to remove item");
      }
    });
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
        setInputValue(formatQtyForInput(prevQty));
        setIsQtyDirty(false);
        toast.error("Failed to update quantity");
      }
    });
  }, [
    inputValue,
    quantity,
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
        className="group relative w-full cursor-pointer overflow-hidden rounded-3xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ aspectRatio: "2/3" }}
      >
        <div className="absolute inset-0 h-full w-full">
          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              onError={() => setImgError(true)}
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full relative w-full overflow-hidden">
              <CategoryIllustration
                category={product.category}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {!product.stock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <span className="rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              Unavailable
            </span>
          </div>
        )}

        <div className="absolute left-2 right-2 top-2 z-10 flex items-start justify-between gap-1">
          <div className="flex flex-col gap-1">
            {product.subsidised && (
              <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-teal-500/90 px-2 py-0.5 text-[9px] font-bold leading-none text-white shadow-md shadow-teal-900/30 backdrop-blur-sm">
                <BadgeDollarSign
                  className="h-2.5 w-2.5 shrink-0"
                  strokeWidth={2.5}
                />
                SUBSIDISED
              </div>
            )}
            {product.isFeatured && (
              <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold leading-none text-amber-950 shadow-md shadow-amber-900/30 backdrop-blur-sm">
                <Star
                  className="h-2.5 w-2.5 shrink-0 fill-amber-950"
                  strokeWidth={2}
                />
                FEATURED
              </div>
            )}
          </div>

          <div
            className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold shadow backdrop-blur-sm ${
              product.stock
                ? "border-emerald-400/30 bg-emerald-500/80 text-white"
                : "border-red-400/30 bg-red-500/80 text-white"
            }`}
          >
            <span
              className={`h-1 w-1 shrink-0 rounded-full bg-white ${
                product.stock ? "animate-pulse" : ""
              }`}
            />
            {product.stock ? "In Stock" : "Sold Out"}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div
            className="absolute inset-0 rounded-b-3xl"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 rounded-b-3xl"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 40%, transparent 100%)",
            }}
          />

          <div className="relative flex flex-col gap-2 px-3 pb-3 pt-8">
            <span
              className={`self-start inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold opacity-90 ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
            >
              {catConfig.emoji}{" "}
              {vegetablesCategory || fruitsCategory
                ? "Produce"
                : product.category}
            </span>

            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow">
              {product.name}
            </h3>

            <div className="flex items-center text-xs font-medium text-white/90">
              <span className="flex items-center gap-1">
                <span className="font-black text-white">
                  {fmt(product.price + product.price * (product.markup / 100))}
                  {product.UOM && `/${product.UOM?.toUpperCase()}`}
                </span>
              </span>
            </div>

            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {quantity > 0 ? (
                <div className="flex w-full items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRemoveAll}
                    disabled={isPending}
                    className="group/trash h-8 w-8 shrink-0 rounded-xl border border-white/25 bg-white/15 backdrop-blur-sm transition-colors hover:bg-red-500/40 disabled:opacity-40"
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <Trash2
                        size={13}
                        strokeWidth={2}
                        className="text-white/80 transition-colors group-hover/trash:text-white"
                      />
                    </div>
                  </button>

                  <div className="flex flex-1 items-center justify-between rounded-3xl border border-white/25 bg-white/15 px-2 py-1 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isPending}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 transition-colors hover:bg-white/35 disabled:opacity-50"
                    >
                      <Minus
                        size={11}
                        strokeWidth={2.5}
                        className="text-white"
                      />
                    </button>

                    <div className="flex flex-1 items-center justify-center gap-1">
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
                          e.stopPropagation();
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
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        disabled={isPending}
                        className="h-6 w-10 rounded-md border border-white/30 bg-white/20 text-center text-sm font-bold text-white tabular-nums outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />

                      {showConfirm && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityInputCommit();
                          }}
                          disabled={isPending}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          <Check
                            size={11}
                            strokeWidth={3}
                            className="text-primary-foreground"
                          />
                        </button>
                      )}
                    </div>

                    {!showConfirm && (
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isPending || quantity >= 99}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        <Plus
                          size={11}
                          strokeWidth={2.5}
                          className="text-primary-foreground"
                        />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  disabled={!product.stock || isPending}
                  onClick={handleAddToCart}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-secondary text-xs font-bold text-primary shadow-sm transition-all hover:bg-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-3.5 w-3.5" />
                  )}
                  {product.stock ? "Add to Cart" : "Out of Stock"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
