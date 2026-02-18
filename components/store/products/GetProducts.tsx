"use client";
import { useState, useEffect } from "react";
import { Edit, Trash2, Search, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import getProducts from "@/actions/store/products/getProductsStore";
import { toast } from "sonner";
import { IProduct } from "@/types/store/products.types";
import Link from "next/link";

import { deleteProduct } from "@/actions/store/products/deleteProduct";

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
  const [products, setProducts] = useState<IProduct[]>([]); // Initialize empty array
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which product is being deleted

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const result = await getProducts();
        if (result.success) {
          setProducts(result.data);
        } else {
          // Handle error (e.g., toast.error(result.error))
          console.error(result.error);
        }
      } catch (err) {
        console.error("An unexpected error occurred", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Handle delete product action
  const handleDelete = async (productId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This cannot be undone.",
      )
    )
      return;

    setDeletingId(productId); // Set the ID of the product being deleted

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        toast.success("Product deleted successfully");
        console.log("Product deleted successfully");

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId),
        );
      } else {
        toast.error(result.message || "Failed to delete product");
        console.error(result.message || "Failed to delete product");
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while deleting the product",
        error,
      );
      toast.error("An unexpected error occurred while deleting the product");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };

  // Simple client-side search filter
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto p-8 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-2">
            Manage your inventory, pricing, and stock levels.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Render Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : filteredProducts.length > 0 ? (
          // Render Actual Data
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                {/* Out of Stock Overlay - checking stock number instead of boolean */}
                {product.stock === false && (
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
                  <h3
                    className="font-semibold text-slate-900 line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Price
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatPrice(product.price)}{" "}
                      {/* Note: lowercase 'price' to match Schema */}
                    </span>
                  </div>

                  <div className="flex gap-2 text-[10px] text-slate-400">
                    {product.tax > 0 && (
                      <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        Tax {Math.round(product.tax * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
                <Link
                  href={`/store/products/${product._id}/edit`}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>

                <button
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id} // Disable button if this product is being deleted
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === product._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default GetProducts;
