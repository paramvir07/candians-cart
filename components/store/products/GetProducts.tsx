import React, { useState, useEffect } from "react";
import { Edit, Trash2, Search, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// --- SAMPLE DATA ---
const SAMPLE_PRODUCTS = [
  {
    _id: "prod_001",
    shopId: "shop_123",
    name: "Organic Whole Milk (2L)",
    description: "Fresh organic whole milk from local dairy farms. Pasteurized and homogenized.",
    category: "Dairy",
    markup: 30,
    tax: 0.05,
    disposableFee: 10,
    Price: 599,
    inStock: true,
    images: [{ url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=1000", fileId: "file_1" }],
    updatedAt: "2023-10-25T10:00:00Z"
  },
  {
    _id: "prod_002",
    shopId: "shop_123",
    name: "Honeycrisp Apples",
    description: "Sweet and crisp apples, perfect for snacking or baking. Sold per lb.",
    category: "Fruits",
    markup: 40,
    tax: 0.00,
    disposableFee: 0,
    Price: 249,
    inStock: true,
    images: [{ url: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&q=80&w=1000", fileId: "file_2" }],
    updatedAt: "2023-10-24T14:30:00Z"
  },
  {
    _id: "prod_003",
    shopId: "shop_123",
    name: "Artisan Sourdough Bread",
    description: "Freshly baked sourdough with a crispy crust and soft interior.",
    category: "Bakery",
    markup: 50,
    tax: 0.05,
    disposableFee: 0,
    Price: 850,
    inStock: false,
    images: [],
    updatedAt: "2023-10-20T09:15:00Z"
  }
];

// --- SKELETON COMPONENT ---
// This perfectly mirrors the padding, margins, and borders of your real card.
const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Image Area Skeleton */}
      <Skeleton className="w-full aspect-4/3 rounded-none" />

      {/* Content Body Skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <Skeleton className="h-6 w-3/4" /> {/* Title */}
        </div>
        
        <div className="space-y-2 mb-4 flex-1 mt-2">
          <Skeleton className="h-4 w-full" /> {/* Description Line 1 */}
          <Skeleton className="h-4 w-5/6" /> {/* Description Line 2 */}
        </div>

        {/* Price & Meta Data Skeleton */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-3 w-10" /> {/* "Price" label */}
            <Skeleton className="h-6 w-20" /> {/* Price Amount */}
          </div>
          <Skeleton className="h-4 w-12" /> {/* Tax Badge */}
        </div>
      </div>

      {/* Actions Footer Skeleton */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
};

const GetProducts = () => {
  // Simulate loading state for demonstration
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fake a network request delay of 2 seconds
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(cents / 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-[#F9FAFB] min-h-screen">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-2">Manage your inventory, pricing, and stock levels.</p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* SKELETON RENDERING LOGIC */}
        {isLoading ? (
          // Render 8 skeletons to fill out a typical screen
          Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : (
          /* ACTUAL DATA RENDERING */
          SAMPLE_PRODUCTS.map((product) => (
            <div 
              key={product._id} 
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                {!product.inStock && (
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Out of Stock
                    </span>
                  </div>
                )}
    
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0].url} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs">No image</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-700 shadow-sm z-20">
                  {product.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1" title={product.name}>
                    {product.name}
                  </h3>
                </div>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatPrice(product.Price)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 text-[10px] text-slate-400">
                     {product.tax > 0 && <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Tax {(product.tax * 100)}%</span>}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GetProducts;