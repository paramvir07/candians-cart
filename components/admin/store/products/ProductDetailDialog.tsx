"use client";

interface ProductDialogProps {
  product: IProduct;
  role: ProductCardRole;
  isSubsidised: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ImageIcon,
  Sparkles,
  PackageX,
  PackageCheck,
  Receipt,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { ProductCardRole } from "./ProductCard";
import { IProduct } from "@/types/store/products.types";
import Image from "next/image";
import { fmt } from "@/lib/fomatPrice";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";

export const ProductDetailDialog = ({
  product,
  role,
  isSubsidised,
  open,
  onOpenChange,
}: ProductDialogProps) => {
  const hasImage = product.images && product.images.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl gap-0 border-0 shadow-2xl">
        {/* ── Hero image ──────────────────────────────────────────────────────── */}
        <div className="relative w-full aspect-[16/8] bg-muted overflow-hidden">
          {/* Out of stock overlay */}
          {!product.stock && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <span className="flex items-center gap-2 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                <PackageX className="h-3.5 w-3.5" />
                Out of Stock
              </span>
            </div>
          )}

          {/* Subsidised ribbon */}
          {isSubsidised && role !== "store" && (
            <div className="absolute top-0 left-0 z-20">
              <div className="flex items-center gap-1.5 bg-violet-500 text-white text-[10px] font-bold px-4 py-2 rounded-br-2xl tracking-wider">
                <Sparkles className="h-3 w-3" />
                SUBSIDISED
              </div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 right-3 z-20">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm capitalize">
              {product.category}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 left-3 z-30 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          ) : (
            <CategoryIllustration
              category={product.category}
              className="w-full h-full"
            />
          )}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <div className="p-6 space-y-5 bg-white">
          {/* Name + description + stock badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
            {product.stock ? (
              <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <PackageCheck className="h-3.5 w-3.5" />
                In Stock
              </span>
            ) : (
              <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                <PackageX className="h-3.5 w-3.5" />
                Out of Stock
              </span>
            )}
          </div>

          {/* ── Metrics grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Price — always shown */}
            <div className="col-span-2 sm:col-span-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Price
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {fmt(product.price + product.price * (product.markup / 100))}{" "}
                <span className="text-sm text-gray-500">
                  ({fmt(product.price)})
                </span>
              </p>
            </div>

            {/* Tax */}
            {product.tax > 0 && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Receipt className="h-3 w-3 text-amber-500" />
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Tax
                  </p>
                </div>
                <p className="text-xl font-bold text-amber-700">
                  {product.tax * 100}%
                </p>
              </div>
            )}

            {/* Markup — admin/store only */}
            {role !== "customer" && product.markup > 0 && (
              <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3 w-3 text-sky-500" />
                  <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">
                    Markup
                  </p>
                </div>
                <p className="text-xl font-bold text-sky-700">
                  {product.markup}%
                </p>
              </div>
            )}

            {/* Disposable fee — admin/store only */}
            {role !== "customer" &&
            product.disposableFee &&
            product.disposableFee > 0 ? (
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="h-3 w-3 text-orange-500" />
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    Disposal
                  </p>
                </div>
                <p className="text-xl font-bold text-orange-700">
                  {fmt(product.disposableFee)}
                </p>
              </div>
            ) : null}
          </div>

          {/* ── Subsidised banner ────────────────────────────────────────────── */}
          {isSubsidised && role !== "store" && (
            <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-700">
                  Subsidised Product
                </p>
                <p className="text-xs text-violet-500 mt-0.5">
                  {role === "customer"
                    ? "This product is subsidised — you may be eligible for a reduced price."
                    : "This product is currently marked as subsidised."}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
