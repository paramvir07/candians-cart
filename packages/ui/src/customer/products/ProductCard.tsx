"use client";

import Image from "next/image";
import { useState } from "react";
import { IProduct } from "@/types/store/products.types";
import { DecrementItem, IncrementItem } from "@/actions/customer/ProductAndStore/Cart.Action";

// ── Type matching your Mongoose ProductSchema ──────────────────────────────

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Final price = price × (1 + markup/100) × (1 + tax) + disposableFee */
function calcFinalPrice(product: IProduct): number {
  const base = product.price;
  const withMarkup = base * (1 + product.markup / 100);
  const withTax = withMarkup * (1 + product.tax);
  const withFee = withTax + (product.disposableFee ?? 0);
  return Math.round(withFee);
}

function formatCAD(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Human-readable tax label */
function taxLabel(tax: number): string {
  if (tax === 0) return "No tax";
  if (tax === 0.05) return "GST 5%";
  if (tax === 0.07) return "PST 7%";
  if (tax === 0.12) return "GST+PST 12%";
  return "";
}

// ── Category emoji fallback ──────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  Fruits: "🍎",
  Vegetables: "🥦",
  Dairy: "🥛",
  Meat: "🥩",
  Bakery: "🍞",
  Beverages: "🧃",
  Snacks: "🍿",
  Household: "🧹",
  "Personal Care": "🧴",
  Other: "📦",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const [count, setCount] = useState(0);

  const imageUrl = product.images?.[0]?.url ?? null;
  const finalPrice = calcFinalPrice(product);
  const hasDisposableFee = !!product.disposableFee && product.disposableFee > 0;

  const handleAdd = () => {
    if (!product.stock) return;
    setCount(1);
    onAddToCart?.(product);
  };


  const handleIncrement = () => {
    if (count >= 99) return;
    setCount((c) => c + 1);
  };

  const handleDecrement = () => {
    if (count <= 1) {
      setCount(0);
    } else {
      setCount((c) => c - 1);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 h-full">
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className={`object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${
              !product.stock ? "grayscale opacity-50" : ""
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <span
            className={`text-5xl select-none transition-transform duration-300 group-hover:scale-110 ${
              !product.stock ? "grayscale opacity-50" : ""
            }`}
          >
            {CATEGORY_EMOJI[product.category] ?? "📦"}
          </span>
        )}

        {/* Category pill */}
        <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[10px] font-semibold text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
          {product.category}
        </span>

        {/* Out of stock overlay */}
        {!product.stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <span className="bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Info ──────────────────────────────────────────────────────── */}
      <div className="p-3 flex flex-col grow">
        {/* Name */}
        <h3 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">
            {product.description}
          </p>
        )}

        {/* Tax + Disposable fee badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tax > 0 && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
              {taxLabel(product.tax)}
            </span>
          )}
          {hasDisposableFee && (
            <span className="text-[10px] font-medium text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
              +{formatCAD(product.disposableFee!)} deposit
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-gray-900">
              {formatCAD(finalPrice)}
            </span>
            {product.markup > 0 && (
              <span className="ml-1 text-[10px] text-gray-400 line-through">
                {formatCAD(product.price)}
              </span>
            )}
          </div>

          {count > 0 ? (
            <div className="flex items-center gap-1 border border-green-600 rounded-lg overflow-hidden">
              {/* Decrement Form */}
              <form action={DecrementItem.bind(null, undefined)}>
                <input
                  type="hidden"
                  name="productId"
                  value={product._id.toString()}
                />
                <button
                  onClick={handleDecrement}
                  type="submit"
                  className="px-2 py-1 text-green-700 font-bold text-base hover:bg-green-50 transition-colors"
                >
                  −
                </button>
              </form>

              {/* Count Display */}
              <span className="px-2 text-sm font-bold text-green-700 min-w-4 text-center">
                {count}
              </span>

              {/* Increment Form */}
              <form action={IncrementItem.bind(null, undefined)}>
                <input
                  type="hidden"
                  name="productId"
                  value={product._id.toString()}
                />
                <button
                  onClick={handleIncrement}
                  type="submit"
                  className="px-2 py-1 text-green-700 font-bold text-base hover:bg-green-50 transition-colors"
                >
                  +
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!product.stock}
              className={`px-5 py-1.5 rounded-lg text-sm font-bold border transition-all active:scale-95 ${
                product.stock
                  ? "border-green-600 text-green-700 bg-white hover:bg-green-50"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
