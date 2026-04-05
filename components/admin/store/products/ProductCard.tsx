"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { subsidisedProduct } from "@/actions/admin/subsidisedProducts";
import { deleteProduct } from "@/actions/store/products/deleteProduct";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Sparkles, PackageX, Star } from "lucide-react";
import { IProduct } from "@/types/store/products.types";
import { fmt } from "@/lib/fomatPrice";
import { ProductDetailDialog } from "./ProductDetailDialog";
import {
  CategoryIllustration,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";
import { featuredProduct } from "@/actions/common/FeaturedProduct.action";

export type ProductCardRole = "admin" | "store" | "customer";

interface ProductCardProps {
  product: IProduct;
  role: ProductCardRole;
  onDelete?: (id: string) => void;
}

export const ProductCard = ({ product, role, onDelete }: ProductCardProps) => {
  const [isSubsidised, setIsSubsidised] = useState(product.subsidised ?? false);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured ?? false);
  const [isSubsidyLoading, setIsSubsidyLoading] = useState(false);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = product.images && product.images.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  // Permissions
  const canToggleSubsidised = role === "admin";
  const canToggleFeatured = role === "admin" || role === "store";
  const canEdit = role === "admin" || role === "store";
  const canDelete = role === "admin" || role === "store";
  const showSubsidisedBadge = isSubsidised && role !== "store";

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubsidyToggle = async (checked: boolean) => {
    setIsSubsidised(checked);
    setIsSubsidyLoading(true);
    try {
      const result = await subsidisedProduct(product._id, checked);
      if (result.success) {
        toast.success(
          `${product.name} marked as ${checked ? "subsidised" : "standard"}.`,
        );
      } else {
        setIsSubsidised(!checked);
        toast.error(result.error || "Failed to update.");
      }
    } catch {
      setIsSubsidised(!checked);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubsidyLoading(false);
    }
  };

  const handleFeaturedToggle = async (checked: boolean) => {
    setIsFeatured(checked);
    setIsFeaturedLoading(true);
    try {
      const result = await featuredProduct(product._id, checked);
      if (result.success) {
        toast.success(
          `${product.name} ${checked ? "marked as featured" : "removed from featured"}.`,
        );
      } else {
        setIsFeatured(!checked);
        toast.error(result.error || "Failed to update.");
      }
    } catch {
      setIsFeatured(!checked);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsFeaturedLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(product._id);
      if (result.success) {
        toast.success("Product deleted.");
        onDelete?.(product._id);
      } else {
        toast.error(result.message || "Failed to delete product.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ProductDetailDialog
        product={product}
        role={role}
        isSubsidised={isSubsidised}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <div className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
        {/* ── Image ─────────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="relative aspect-4/3 bg-muted overflow-hidden w-full shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View details for ${product.name}`}
        >
          {!product.stock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow">
                <PackageX className="h-3.5 w-3.5" />
                Out of Stock
              </span>
            </div>
          )}

          {/* Subsidised ribbon */}
          {showSubsidisedBadge && (
            <div className="absolute top-0 left-0 z-20">
              <div className="flex items-center gap-1 bg-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-xl shadow-md">
                <Sparkles className="h-3 w-3" />
                SUBSIDISED
              </div>
            </div>
          )}

          {/* Featured star badge */}
          {isFeatured && (
            <div className="absolute top-0 right-0 z-20 mt-0 mr-0">
              <div className="flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl shadow-md">
                <Star className="h-3 w-3 fill-white" />
                FEATURED
              </div>
            </div>
          )}

          {/* Category badge — only when no featured badge taking the right corner */}
          {!isFeatured && (
            <div
              className={`absolute top-3 right-3 z-20 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border shadow-sm backdrop-blur-sm ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
            >
              {catConfig.emoji} {product.category}
            </div>
          )}
          {isFeatured && (
            <div
              className={`absolute top-3 left-3 z-20 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border shadow-sm backdrop-blur-sm ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
            >
              {catConfig.emoji} {product.category}
            </div>
          )}

          {/* Hover hint */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-border/50">
              View details
            </span>
          </div>

          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              onError={() => setImgError(true)}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <CategoryIllustration
              category={product.category}
              className="w-full h-full"
            />
          )}
        </button>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="p-4 flex-1 flex flex-col text-left w-full focus-visible:outline-none"
        >
          <h3
            className="font-semibold text-foreground text-[15px] leading-snug line-clamp-1 mb-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Fixed-height description so all cards are the same height */}
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed min-h-10">
            {product.description || ""}
          </p>

          {/* Price row */}
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-xl font-bold text-foreground tracking-tight">
                {fmt(product.price + product.price * (product.markup / 100))} <span className="text-sm text-gray-500">({fmt(product.price)})</span> 
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {product.tax > 0 && (
                <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                  +{(product.tax * 100).toFixed(2)}% tax
                </span>
              )}
              {role !== "customer" && product.markup > 0 && (
                <span className="text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md">
                  {product.markup}% markup
                </span>
              )}
            </div>
          </div>
        </button>

        {/* ── Toggles (admin + store) ────────────────────────────────────────── */}
        {(canToggleFeatured || canToggleSubsidised) && (
          <div
            className="px-4 pb-2 space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Featured toggle — admin + store */}
            {canToggleFeatured && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2">
                  <Star
                    className={`h-3.5 w-3.5 ${isFeatured ? "text-amber-500 fill-amber-400" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-xs font-medium ${isFeatured ? "text-amber-700" : "text-muted-foreground"}`}
                  >
                    {isFeatured ? "Featured" : "Not featured"}
                  </span>
                </div>
                <Switch
                  checked={isFeatured}
                  onCheckedChange={handleFeaturedToggle}
                  disabled={isFeaturedLoading}
                  className="data-[state=checked]:bg-amber-400 h-5 w-9"
                />
              </div>
            )}

            {/* Subsidised toggle — admin only */}
            {canToggleSubsidised && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-violet-50/60 border border-violet-100">
                <div className="flex items-center gap-2">
                  <Sparkles
                    className={`h-3.5 w-3.5 ${isSubsidised ? "text-violet-500" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-xs font-medium ${isSubsidised ? "text-violet-600" : "text-muted-foreground"}`}
                  >
                    {isSubsidised ? "Subsidised" : "Standard pricing"}
                  </span>
                </div>
                <Switch
                  checked={isSubsidised}
                  onCheckedChange={handleSubsidyToggle}
                  disabled={isSubsidyLoading}
                  className="data-[state=checked]:bg-violet-500 h-5 w-9"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Edit + Delete ──────────────────────────────────────────────────── */}
        {(canEdit || canDelete) && (
          <div
            className="px-4 pb-4 pt-2 grid grid-cols-2 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && (
              <Link
                href={
                  role === "store"
                    ? `/store/products/${product._id}/edit`
                    : `/admin/product/${product._id}/edit`
                }
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 border border-border rounded-xl transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isDeleting ? "Deleting…" : "Delete"}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete "{product.name}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The product will be
                      permanently removed from your store along with all
                      associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Product
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* ── Customer view details ──────────────────────────────────────────── */}
        {role === "customer" && (
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/60 rounded-xl transition-colors"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </>
  );
};
