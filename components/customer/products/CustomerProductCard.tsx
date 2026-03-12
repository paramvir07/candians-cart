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
  Tag,
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
        className="group relative w-full cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ aspectRatio: "2/3" }}
      >
        {/* ── Full-bleed image / illustration ── */}
        <div className="absolute inset-0 w-full h-full">
          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              onError={() => setImgError(true)}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full overflow-hidden">
              <CategoryIllustration
                category={product.category}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* ── Out-of-stock dimmer ── */}
        {!product.stock && (
          <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
              Unavailable
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 z-10 flex items-start justify-between gap-1">
          {/* Left: badges stacked */}
          <div className="flex flex-col gap-1">
            {product.subsidised && (
              <div className="flex items-center gap-1 bg-teal-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full leading-none whitespace-nowrap shadow-md shadow-teal-900/30">
                <BadgeDollarSign className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} />
                SUBSIDISED
              </div>
            )}
            {product.isFeatured && (
              <div className="flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm text-amber-950 text-[9px] font-bold px-2 py-0.5 rounded-full leading-none whitespace-nowrap shadow-md shadow-amber-900/30">
                <Star className="h-2.5 w-2.5 shrink-0 fill-amber-950" strokeWidth={2} />
                FEATURED
              </div>
            )}
          </div>

          {/* Right: stock status pill */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-sm border text-[9px] font-bold shadow shrink-0 ${
              product.stock
                ? "bg-emerald-500/80 border-emerald-400/30 text-white"
                : "bg-red-500/80 border-red-400/30 text-white"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full shrink-0 bg-white ${
                product.stock ? "animate-pulse" : ""
              }`}
            />
            {product.stock ? "In Stock" : "Sold Out"}
          </div>
        </div>

        {/* ── Bottom blur content panel ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Dark gradient */}
          <div
            className="absolute inset-0 rounded-b-3xl"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)",
            }}
          />
          {/* Blur layer at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 rounded-b-3xl"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
            }}
          />

          <div className="relative px-3 pt-8 pb-3 flex flex-col gap-2">
            {/* Category pill */}
            <span
              className={`self-start inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${catConfig.bg} ${catConfig.text} ${catConfig.border} border opacity-90`}
            >
              {catConfig.emoji} {product.category}
            </span>

            {/* Product name */}
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow">
              {product.name}
            </h3>

            {/* Price row */}
            <div className="flex items-center text-white/90 text-xs font-medium">
              <span className="flex items-center gap-1">
                <span className="font-black text-white">
                  {fmt(product.price + product.markup)}
                </span>
              </span>
            </div>

            {/* ── Cart controls ── */}
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              {quantity > 0 ? (
                <div className="flex items-center gap-1.5 w-full">
                  {/* Trash */}
                  <button
                    type="button"
                    onClick={handleRemoveAll}
                    disabled={isPending}
                    className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-red-500/40 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 group/trash"
                  >
                    <Trash2
                      size={13}
                      strokeWidth={2}
                      className="text-white/80 group-hover/trash:text-white transition-colors"
                    />
                  </button>

                  {/* Stepper */}
                  <div className="flex-1 flex items-center bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-1.5 py-1 gap-1">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={isPending}
                      className="w-6 h-6 rounded-full border border-white/30 bg-white/20 flex items-center justify-center hover:bg-white/35 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Minus size={10} strokeWidth={2.5} className="text-white" />
                    </button>

                    <div className="flex items-center justify-center flex-1 gap-1">
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
                        className="w-8 h-6 rounded-md bg-white/20 border border-white/30 text-center text-xs font-bold text-white tabular-nums outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                        >
                          <Check size={10} strokeWidth={3} className="text-primary-foreground" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleIncrement}
                          disabled={isPending || quantity >= 99}
                          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                        >
                          <Plus size={10} strokeWidth={2.5} className="text-primary-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  disabled={!product.stock || isPending}
                  onClick={handleAddToCart}
                  className="w-full h-9 rounded-xl bg-secondary text-primary border border-primary/20 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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