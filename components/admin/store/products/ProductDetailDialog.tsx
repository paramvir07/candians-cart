interface ProductDialogProps {
  product: IProduct;
  role: ProductCardRole;
  isSubsidised: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Sparkles,
  PackageX,
  PackageCheck,
  Receipt,
  Tag,
  TrendingUp,
} from "lucide-react";
import { ProductCardRole } from "./ProductCard";
import { IProduct } from "@/types/store/products.types";
import Image from "next/image";
import { fmt } from "@/lib/fomatPrice";

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
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl gap-0">
        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-muted">
          {!product.stock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <span className="flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                <PackageX className="h-3.5 w-3.5" />
                Out of Stock
              </span>
            </div>
          )}

          {isSubsidised && role !== "store" && (
            <div className="absolute top-0 left-0 z-20">
              <div className="flex items-center gap-1 bg-violet-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-br-xl">
                <Sparkles className="h-3 w-3" />
                SUBSIDISED
              </div>
            </div>
          )}

          <div className="absolute top-3 right-3 z-20">
            <Badge variant="secondary" className="capitalize shadow-sm">
              {product.category}
            </Badge>
          </div>

          {hasImage ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-2">
              <ImageIcon className="h-14 w-14" strokeWidth={1} />
              <span className="text-sm">No image available</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-xl font-bold text-foreground leading-tight">
                  {product.name}
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div className="shrink-0">
                {product.stock ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <PackageCheck className="h-3.5 w-3.5" />
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-full">
                    <PackageX className="h-3.5 w-3.5" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Price + meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-xl p-3 border border-border/60">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                Price
              </p>
              <p className="text-xl font-bold text-foreground tracking-tight">
                {fmt(product.price)}
              </p>
            </div>

            {product.tax > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60">
                <div className="flex items-center gap-1 mb-1">
                  <Receipt className="h-3 w-3 text-amber-500" />
                  <p className="text-[10px] font-medium text-amber-600 uppercase tracking-widest">
                    Tax
                  </p>
                </div>
                <p className="text-lg font-bold text-amber-700">
                  {product.tax}%
                </p>
              </div>
            )}

            {/* Admin/Store only fields */}
            {role !== "customer" && product.markup > 0 && (
              <div className="bg-sky-50 rounded-xl p-3 border border-sky-200/60">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-sky-500" />
                  <p className="text-[10px] font-medium text-sky-600 uppercase tracking-widest">
                    Markup
                  </p>
                </div>
                <p className="text-lg font-bold text-sky-700">
                  {product.markup}%
                </p>
              </div>
            )}

            {role !== "customer" &&
            product.disposableFee &&
            product.disposableFee > 0 ? (
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-200/60">
                <div className="flex items-center gap-1 mb-1">
                  <Tag className="h-3 w-3 text-orange-500" />
                  <p className="text-[10px] font-medium text-orange-600 uppercase tracking-widest">
                    Disposal Fee
                  </p>
                </div>
                <p className="text-lg font-bold text-orange-700">
                  {fmt(product.disposableFee)}
                </p>
              </div>
            ) : null}
          </div>

          {/* Subsidised indicator — visible to all, but labeled differently */}
          {isSubsidised && role !== "store" && (
            <div className="flex items-center gap-2.5 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
              <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-violet-700">
                  Subsidised Product
                </p>
                <p className="text-xs text-violet-500">
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
