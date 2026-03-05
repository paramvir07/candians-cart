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
import { Edit, Trash2, Sparkles, PackageX } from "lucide-react";
import { IProduct } from "@/types/store/products.types";
import { fmt } from "@/lib/fomatPrice";
import { ProductDetailDialog } from "./ProductDetailDialog";
import {
  CategoryIllustration,
  getCategoryConfig,
} from "@/components/customer/shared/CategoryIllustration";

export type ProductCardRole = "admin" | "store" | "customer";

interface ProductCardProps {
  product: IProduct;
  role: ProductCardRole;
  onDelete?: (id: string) => void;
}

export const ProductCard = ({ product, role, onDelete }: ProductCardProps) => {
  const [isSubsidised, setIsSubsidised] = useState(product.subsidised ?? false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = product.images && product.images.length > 0 && !imgError;
  const catConfig = getCategoryConfig(product.category);

  const canToggleSubsidised = role === "admin";
  const canEdit = role === "admin" || role === "store";
  const canDelete = role === "admin" || role === "store";
  const showSubsidisedBadge = isSubsidised && role !== "store";

  const handleToggle = async (checked: boolean) => {
    setIsSubsidised(checked);
    setIsToggleLoading(true);
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
      setIsToggleLoading(false);
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
        {/* Image */}
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="relative aspect-4/3 bg-muted overflow-hidden w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          {showSubsidisedBadge && (
            <div className="absolute top-0 left-0 z-20">
              <div className="flex items-center gap-1 bg-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-xl shadow-md">
                <Sparkles className="h-3 w-3" />
                SUBSIDISED
              </div>
            </div>
          )}

          {/* Color-coded category badge */}
          <div
            className={`absolute top-3 right-3 z-20 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border shadow-sm backdrop-blur-sm ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
          >
            {catConfig.emoji} {product.category}
          </div>

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
            // Beautiful illustrated SVG fallback per category
            <CategoryIllustration
              category={product.category}
              className="w-full h-full"
            />
          )}
        </button>

        {/* Body */}
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="p-4 flex-1 flex flex-col gap-2 text-left w-full focus-visible:outline-none"
        >
          <h3
            className="font-semibold text-foreground text-[15px] leading-snug line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-xl font-bold text-foreground tracking-tight">
              {fmt(product.price)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {product.tax > 0 && (
                <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                  +{product.tax}% tax
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

        {/* Admin: subsidised toggle */}
        {canToggleSubsidised && (
          <div className="px-4 pb-2">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 border border-border/60"
            >
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
                onCheckedChange={handleToggle}
                disabled={isToggleLoading}
                className="data-[state=checked]:bg-violet-500 h-5 w-9"
              />
            </div>
          </div>
        )}

        {/* Store/Admin: edit + delete */}
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

        {/* Customer: view details button */}
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
