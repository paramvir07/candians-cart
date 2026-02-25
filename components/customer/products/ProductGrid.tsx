"use client";

import { AddtoCart } from "@/actions/customer/ProductAndStore/Cart.Action";
import ProductCard from "./ProductCard";
import { IProduct } from "@/types/store/products.types"; // Adjust import path

interface ProductGridProps {
  products: IProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const handleAddToCart = async(product: IProduct) => {
    console.log("Added to cart:", product._id);
    await AddtoCart(product._id);
  };

  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center bg-gray-50 rounded-lg mx-4">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header matching the screenshot */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Dairy, Bread & Eggs
        </h2>
        <button className="text-green-600 font-bold text-sm hover:underline">
          see all
        </button>
      </div>

      {/* Grid: 2 cols on mobile, 3 on tablet, 5 or 6 on desktop to match dense grocery layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
