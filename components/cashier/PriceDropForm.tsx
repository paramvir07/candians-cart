"use client";

import { useState, useTransition } from "react";
import { TrendingDown, Loader2, Package, Tag, Scale, Receipt, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createPriceDropItem } from "@/actions/cashier/PriceDrop";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  storeId: string;
  name: string;
  description?: string;
  category: string;
  markup: number;
  tax: number;
  disposableFee?: number;
  price: number;
  stock: boolean;
  subsidised: boolean;
  images: { url: string; fileId: string }[];
  isFeatured: boolean;
  primaryUPC?: string;
  isMeasuredInWeight?: boolean;
  UOM?: string;
  vendorId?: string;
}

interface PriceDropFormProps {
  product: Product;
}

// Total price (shelf price) = basePrice * (1 + markup/100) * (1 + tax)
// Reverse: basePrice = totalPrice / ((1 + markup/100) * (1 + tax))
function getTotalPrice(basePriceCents: number, markupPct: number, tax: number): number {
  return basePriceCents * (1 + markupPct / 100) * (1 + tax);
}

function getBasePriceFromTotal(totalPriceCents: number, markupPct: number, tax: number): number {
  return Math.round(totalPriceCents / ((1 + markupPct / 100) * (1 + tax)));
}

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

function displayToCents(display: string): number {
  return Math.round(parseFloat(display) * 100);
}

export default function PriceDropForm({ product }: PriceDropFormProps) {
  const currentTotalCents = getTotalPrice(product.price, product.markup, product.tax);

  const [totalDisplay, setTotalDisplay] = useState<string>(centsToDisplay(currentTotalCents));
  const [isPending, startTransition] = useTransition();

  const totalCents = displayToCents(totalDisplay);
  const derivedBaseCents = getBasePriceFromTotal(totalCents, product.markup, product.tax);

  const router = useRouter();

const handleSubmit = () => {
    if (derivedBaseCents <= 0) {
    toast.error("Price should be greater than 0");
    return;
  }
  startTransition(async () => {
    const payload = {
      productId: product._id,
      newBasePriceCents: derivedBaseCents,
      priceDrop: true,
    };


    const res = await createPriceDropItem(payload);

    toast[res.success ? "success" : "error"](res.message);
    if(res.success){
        router.back()
        return;
    }
  });
};

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingDown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Price Drop</h1>
            <p className="text-sm text-muted-foreground">Set a new shelf price</p>
          </div>
        </div>

        {/* Product name banner */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{product.name}</span>
          </div>
          <div className="flex gap-1.5">
            {product.subsidised && <Badge variant="secondary" className="text-[10px]">Subsidised</Badge>}
            {product.isFeatured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
          </div>
        </div>

        {/* Price Drop toggle — always on */}
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Price Drop Active</p>
              <p className="text-xs text-muted-foreground">This product will be marked as a price drop</p>
            </div>
          </div>
          <div className="h-6 w-11 rounded-full bg-primary flex items-center px-0.5 cursor-not-allowed opacity-80">
            <div className="ml-auto h-5 w-5 rounded-full bg-white shadow-sm" />
          </div>
        </div>

        {/* Editable: total shelf price */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Set Shelf Price</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Old Price : ${getTotalPrice(product.price, product.markup, product.tax)/100}</p>

          <div className="space-y-2">
            <Label htmlFor="totalPrice" className="flex items-center gap-1.5 text-sm">
              <Tag className="h-3.5 w-3.5" />
              Total Price
              <span className="text-muted-foreground">(after markup + tax, in $)</span>
            </Label>
            <Input
              id="totalPrice"
              type="number"
              min={0}
              step={0.01}
              value={totalDisplay}
              onChange={(e) => setTotalDisplay(e.target.value)}
              className="font-mono text-base"
            />
          </div>

          {/* Derived breakdown */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Calculated Breakdown</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base price (stored)</span>
              <span className="font-mono font-semibold text-foreground">
                ${centsToDisplay(derivedBaseCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">After markup ({product.markup}%)</span>
              <span className="font-mono text-foreground">
                ${centsToDisplay(Math.round(derivedBaseCents * (1 + product.markup / 100)))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">After tax ({(product.tax * 100).toFixed(0)}%)</span>
              <span className="font-mono text-foreground">
                ${centsToDisplay(totalCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Read-only fields */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Details</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Category", value: product.category, icon: <Leaf className="h-3.5 w-3.5" /> },
              { label: "UOM", value: product.UOM ?? "—", icon: <Scale className="h-3.5 w-3.5" /> },
              { label: "Tax", value: `${(product.tax * 100).toFixed(0)}%`, icon: <Receipt className="h-3.5 w-3.5" /> },
              { label: "UPC", value: product.primaryUPC ?? "—", icon: <Tag className="h-3.5 w-3.5" /> },
              { label: "Disposal Fee", value: product.disposableFee ? `${product.disposableFee}¢` : "—", icon: <Package className="h-3.5 w-3.5" /> },
              { label: "By Weight", value: product.isMeasuredInWeight ? "Yes" : "No", icon: <Scale className="h-3.5 w-3.5" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                  {icon}
                  <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isPending} className="w-full h-11 font-semibold gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
          Apply Price Drop
        </Button>

      </div>
    </div>
  );
}