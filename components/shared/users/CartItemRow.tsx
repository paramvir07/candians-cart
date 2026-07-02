"use client";

import { memo } from "react";
import Image from "next/image";
import { BadgePercent } from "lucide-react";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import { AddtoSubsidyBtn } from "@/components/customer/products/CartActionBtns";
import { RemoveButton } from "@/components/customer/products/RemoveButton";
import { QuantityControl } from "@/components/customer/products/QuantityControls";
import { ICartItem } from "@/types/customer/CustomerCart";

const fmt = (cents: number) => (cents / 100).toFixed(2);

function tierLabel(markup: number) {
  if (markup >= 100) return { label: "HIGH", cls: "bg-red-500 text-white" };
  if (markup >= 50) return { label: "MED", cls: "bg-amber-400 text-amber-950" };
  return { label: "LOW", cls: "bg-emerald-500 text-white" };
}

interface CartItemRowProps {
  item: ICartItem;
  afterMarkup: number;
  customerId?: string;
  variant: "mobile" | "desktop";
}

function CartItemRowImpl({
  item,
  afterMarkup,
  customerId,
  variant,
}: CartItemRowProps) {
  const markup = item.productId.markup;
  const hasImage = item.productId.images?.[0]?.url;
  const isMeasuredInWeight = item.productId.isMeasuredInWeight;
  const productId = item.productId._id.toString();
  const tier = !item.productId.subsidised ? tierLabel(markup) : null;

  const thumbSize = variant === "mobile" ? 64 : 56;
  const thumbClass = variant === "mobile" ? "h-16 w-16" : "h-14 w-14";

  const image = (
    <div
      className={`relative ${thumbClass} shrink-0 rounded-lg overflow-hidden bg-secondary`}
    >
      {hasImage ? (
        <Image
          src={item.productId.images?.[0]?.url ?? ""}
          alt={item.productId.name}
          width={thumbSize}
          height={thumbSize}
          className="w-full h-full object-cover"
        />
      ) : (
        <CategoryIllustration
          category={item.productId.category}
          className="w-full h-full"
        />
      )}
      {tier && (
        <span
          className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black leading-none tracking-wide ${tier.cls}`}
        >
          {tier.label}
        </span>
      )}
    </div>
  );

  const priceDropBadge = item.productId?.PriceDrop ? (
    <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold leading-none text-amber-950 shadow-md shadow-amber-900/30 backdrop-blur-sm w-fit">
      <BadgePercent className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />
      PRICE DROP
    </div>
  ) : null;

  if (variant === "mobile") {
    return (
      <div
        data-cart-item
        className="flex gap-3 bg-card rounded-xl border border-border/60 p-3"
      >
        {image}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2 flex gap-2 items-center">
                {item.productId.name}
                {isMeasuredInWeight && `/${item.productId.UOM?.toLowerCase()}`}
                {priceDropBadge}
              </p>
              <p className="text-xs font-semibold text-muted-foreground"></p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {item.productId.category}
              </p>
            </div>
            <p className="text-sm font-bold tabular-nums text-primary shrink-0">
              CA${fmt(afterMarkup)}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <RemoveButton
                productId={productId}
                customerId={customerId}
                variant="mobile"
              />
              {item.productId.subsidised && (
                <AddtoSubsidyBtn ProductId={productId} customerId={customerId} />
              )}
            </div>
            <QuantityControl
              productId={productId}
              customerId={customerId}
              initialQuantity={item.quantity}
              variant="mobile"
              isMeasuredInWeight={isMeasuredInWeight}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-cart-item
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/20 transition-colors group"
    >
      {image}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
            {item.productId.name}
            {isMeasuredInWeight && `/${item.productId.UOM?.toLowerCase()}`}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            {priceDropBadge}
          </p>
          {item.productId.subsidised && (
            <span className="shrink-0">
              <AddtoSubsidyBtn ProductId={productId} customerId={customerId} />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {item.productId.category}
        </p>
      </div>
      <div className="shrink-0">
        <QuantityControl
          productId={productId}
          customerId={customerId}
          initialQuantity={item.quantity}
          variant="desktop"
          isMeasuredInWeight={isMeasuredInWeight}
        />
      </div>
      <div className="w-24 text-right shrink-0">
        <p className="text-sm font-bold tabular-nums text-primary">
          CA${fmt(afterMarkup)}
        </p>
      </div>
      <div className="shrink-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
        <RemoveButton
          productId={productId}
          customerId={customerId}
          variant="desktop"
        />
      </div>
    </div>
  );
}

export const CartItemRow = memo(CartItemRowImpl, (prev, next) => {
  return (
    prev.item.quantity === next.item.quantity &&
    prev.afterMarkup === next.afterMarkup &&
    prev.item.productId._id.toString() === next.item.productId._id.toString() &&
    prev.variant === next.variant &&
    prev.customerId === next.customerId
  );
});