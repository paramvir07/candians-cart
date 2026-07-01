"use client";

import {
  useState,
  useTransition,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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
  BadgePercent,
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
import { emitCartUpdated } from "@/lib/cartEvent";
import PriceDropBtn from "./PriceDropBtn";

function useCashierMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 996);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}
const getSubsidyConfig = (markup: number = 0) => {
  if (markup >= 100) {
    return {
      label: "High Subsidy",
      bg: "bg-rose-100 shadow-[0_0_15px_rgba(255,228,230,1)]",
      border: "border-rose-300",
      text: "text-black",
    };
  }
  if (markup >= 50) {
    return {
      label: "Med Subsidy",
      bg: "bg-amber-100 shadow-[0_0_15px_rgba(254,243,199,1)]",
      border: "border-amber-300",
      text: "text-black",
    };
  }
  return {
    label: "Low Subsidy",
    bg: "bg-teal-100 shadow-[0_0_15px_rgba(204,251,241,1)]",
    border: "border-teal-300",
    text: "text-black",
  };
};

export interface ProductCardHandle {
  focusQty: () => void;
}

export const CustomerProductCard = forwardRef<
  ProductCardHandle,
  {
    isCashier?: boolean;
    customerId?: string;
    product: IProduct;
    cartQuantity?: number;
    subsidyPage: boolean;
  }
>(function CustomerProductCard(
  { isCashier, customerId, product, cartQuantity = 0 },
  ref,
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState<number>(cartQuantity);
  const [inputValue, setInputValue] = useState<string>(String(cartQuantity));
  const [isQtyDirty, setIsQtyDirty] = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const cashierMobile = useCashierMobile();
  const cashier = isCashier && !cashierMobile;

  // const quantityStep = 1;

  useImperativeHandle(ref, () => ({
    focusQty: () => {
      if (product.UOM && product.UOM.trim() !== "") {
        setInputValue("");
        setIsQtyDirty(true);
        setTimeout(() => {
          qtyInputRef.current?.focus();
          qtyInputRef.current?.select();
        }, 0);
      } else {
        setQuantity((prev) => (prev === 0 ? 1 : prev));
        setInputValue((prev) => (prev === "0" || prev === "" ? "1" : prev));
        setIsQtyDirty(false);
      }
    },
  }));

  const formatQtyForInput = useCallback(
    (value: number) => {
      if (product.isMeasuredInWeight) {
        return String(value);
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

  const hasImage = product.images && product.images.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  const syncQuantity = useCallback(
    (newQty: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        const fd = new FormData();
        fd.append("productId", product._id as string);
        fd.append("quantity", String(newQty));

        const res = await UpdateItemQuantity(customerId, fd);

        if (res?.success) {
          emitCartUpdated();
        }
      }, 400);
    },
    [product._id, customerId],
  );

  const removeFromCartFast = useCallback(
    async (rollbackQty?: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      setQuantity(0);
      setInputValue("0");
      setIsQtyDirty(false);

      try {
        const fd = new FormData();
        fd.append("productId", product._id as string);

        await RemoveItem(customerId, fd);
        emitCartUpdated();
        toast.success(`${product.name} removed from cart`);
      } catch {
        if (rollbackQty !== undefined) {
          setQuantity(rollbackQty);
          setInputValue(formatQtyForInput(rollbackQty));
        }

        toast.error("Failed to remove item");
      }
    },
    [product._id, product.name, customerId, formatQtyForInput],
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    const initialQty = 1;
    setQuantity(initialQty);
    setInputValue(formatQtyForInput(initialQty));
    setIsQtyDirty(false);

    startTransition(async () => {
      try {
        const res = await AddtoCart(product._id as string, customerId);
        if (res?.success) {
          toast.success(`${product.name} added to cart!`);
          emitCartUpdated();
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

    if (quantity >= 99) return;

    const next = quantity + 1;
    const normalizedNext = product.isMeasuredInWeight
      ? Math.round(next * 100) / 100
      : Math.trunc(next);

    setQuantity(normalizedNext);
    setInputValue(formatQtyForInput(normalizedNext));
    setIsQtyDirty(false);

    syncQuantity(normalizedNext);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (quantity <= 1) {
      void removeFromCartFast(quantity);
      return;
    }

    const next = quantity - 1;
    const normalizedNext = product.isMeasuredInWeight
      ? Math.round(next * 100) / 100
      : Math.trunc(next);

    setQuantity(normalizedNext);
    setInputValue(formatQtyForInput(normalizedNext));
    setIsQtyDirty(false);

    syncQuantity(normalizedNext);
  };

  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    void removeFromCartFast(quantity);
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
    if (newQty === 0) {
      void removeFromCartFast(prevQty);
      return;
    }

    setQuantity(newQty);
    setInputValue(formatQtyForInput(newQty));
    setIsQtyDirty(false);

    syncQuantity(newQty);
  }, [
    inputValue,
    quantity,
    normalizeQuantity,
    formatQtyForInput,
    removeFromCartFast,
    syncQuantity,
  ]);

  const normalizedInputQty = normalizeQuantity(inputValue);

  const showConfirm =
    isQtyDirty &&
    normalizedInputQty !== null &&
    normalizedInputQty !== quantity;

  const subsidyConfig = getSubsidyConfig(product.markup ?? 0);

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
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
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
          {/* LEFT BADGES */}
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
            {product.PriceDrop && (
              <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold leading-none text-amber-950 shadow-md shadow-amber-900/30 backdrop-blur-sm">
                <BadgePercent
                  className="h-2.5 w-2.5 shrink-0"
                  strokeWidth={2}
                />
                PRICE DROP
              </div>
            )}
          </div>

          {/* RIGHT BADGE: Dynamic Subsidy Level based on markup */}
          {!product.subsidised && (
            <div
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-black backdrop-blur-md transition-colors ${subsidyConfig.bg} ${subsidyConfig.border} ${subsidyConfig.text}`}
            >
              <BadgeDollarSign className="h-3 w-3 shrink-0" strokeWidth={2.5} />
              {subsidyConfig.label}
            </div>
            
          )}
          <div className="absolute right-4 top-8 z-10" style={{ bottom: "6.5rem" }}>
              <img
                src="https://ik.imagekit.io/h7w5h0hou/Candian's-Cart-Logo-abb.png"
                alt="Canadian's Cart"
                className="h-6 w-6 rounded-full object-contain drop-shadow-md"
              />
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
              {catConfig.emoji} {product.category}
            </span>

            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow flex items-center justify-between">
              {product.name}
              <div>
                {isCashier && !product.PriceDrop && (
                  <PriceDropBtn productId={product._id as string} />
                )}
              </div>
            </h3>

            <div className="flex items-center text-xs font-medium text-white/90 justify-between">
              <span className="flex items-center gap-1">
                <span className="font-black text-white">
                  {fmt(
                    product.price +
                      product.price * ((product.markup ?? 0) / 100),
                  )}
                  {product.UOM && `/${product.UOM.toUpperCase()}`}
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
                    className={`group/trash shrink-0 rounded-xl border border-white/25 bg-white/15 backdrop-blur-sm transition-colors hover:bg-red-500/40 disabled:opacity-40 ${
                      cashier ? "h-11 w-11" : "h-8 w-8"
                    }`}
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
                      className={`flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 transition-colors hover:bg-white/35 disabled:opacity-50 ${
                        cashier ? "h-9 w-9" : "h-6 w-6"
                      }`}
                    >
                      <Minus
                        size={cashier ? 16 : 11}
                        strokeWidth={2.5}
                        className="text-white"
                      />
                    </button>

                    <div className="flex flex-1 items-center justify-center gap-1">
                      <input
                        ref={qtyInputRef}
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
                        className={`rounded-md border border-white/30 bg-white/20 text-center font-bold text-white tabular-nums outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                          cashier ? "h-9 w-14 text-base" : "h-6 w-10 text-sm"
                        }`}
                      />

                      {showConfirm && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityInputCommit();
                          }}
                          className={`flex shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-90 disabled:opacity-50 ${
                            cashier ? "h-9 w-9" : "h-6 w-6"
                          }`}
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
                        disabled={quantity >= 99}
                        className={`flex shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-90 disabled:opacity-50 ${
                          cashier ? "h-9 w-9" : "h-6 w-6"
                        }`}
                      >
                        <Plus
                          size={cashier ? 16 : 11}
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
                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-secondary font-bold text-primary shadow-sm transition-all hover:bg-primary/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                    cashier ? "h-12 text-sm" : "h-9 text-xs"
                  }`}
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
});
