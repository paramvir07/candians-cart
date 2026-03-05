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

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: {
  product: IProduct;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const hasImage = product.images?.length > 0;
  const catConfig = getCategoryConfig(product.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl gap-0 border-0 shadow-2xl">
        {/* Image hero */}
        <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
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
              <div className="flex items-center gap-1.5 bg-linear-to-r from-violet-600 to-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-2xl">
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
        </div>

        {/* Content */}
        <div className="bg-white p-6 space-y-4">
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

          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h2>
            <p className="text-slate-500 mt-2 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
                Price
              </p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {fmt(product.price)}
              </p>
              {product.tax > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">
                  +{product.tax}% tax at checkout
                </p>
              )}
            </div>
            {product.subsidised && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  <Sparkles className="h-3.5 w-3.5" />
                  Subsidised
                </div>
                <p className="text-[10px] text-slate-400 text-right max-w-32.5">
                  You may qualify for a reduced price
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function CustomerProductCard({
  product,
  cartQuantity = 0,
}: {
  product: IProduct;
  cartQuantity?: number;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartQuantity);

  // Update local state when the async cart fetch finishes
  useEffect(() => {
    setQuantity(cartQuantity);
  }, [cartQuantity]);

  const hasImage = product.images?.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  // Handlers
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(1); // Optimistic UI update
    startTransition(async () => {
      try {
        const res = await AddtoCart(product._id as string);
        if (res?.success) {
          toast.success(`${product.name} added to cart!`);
        } else {
          setQuantity(0); // Revert on failure
        }
      } catch (error) {
        setQuantity(0);
        toast.error("Failed to add to cart");
      }
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => q + 1); // Optimistic update
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product._id as string);
        await IncrementItem(undefined, formData);
      } catch (error) {
        setQuantity((q) => Math.max(0, q - 1)); // Revert on failure
      }
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => Math.max(0, q - 1)); // Optimistic update
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product._id as string);
        await DecrementItem(undefined, formData);
      } catch (error) {
        setQuantity((q) => q + 1); // Revert on failure
      }
    });
  };

  return (
    <>
      <ProductDetailDialog
        product={product}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <div
        onClick={() => setDialogOpen(true)}
        className="group w-full cursor-pointer text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        {/* Image */}
        <div className="relative aspect-4/3 w-full overflow-hidden">
          {!product.stock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Unavailable
              </span>
            </div>
          )}
          {product.subsidised && (
            <div className="absolute top-0 left-0 z-10">
              <div className="flex items-center gap-1 bg-linear-to-r from-violet-600 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-xl">
                <Sparkles className="h-3 w-3" />
                SUBSIDISED
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
          <div className="mt-2 h-9 flex items-center justify-center">
            {quantity > 0 ? (
              <div
                className="flex items-center justify-between w-full px-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={isPending}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Minus size={13} strokeWidth={2} className="text-slate-600" />
                </button>
                <span className="text-sm font-semibold text-gray-900 w-6 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={isPending || quantity >= 99}
                  className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <Plus size={13} strokeWidth={2} className="text-white" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant={product.stock ? "default" : "secondary"}
                disabled={!product.stock || isPending}
                onClick={handleAddToCart}
                className={`w-full rounded-xl h-full text-xs font-bold transition-all ${
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
