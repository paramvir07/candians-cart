import { getCart } from "@/actions/customer/ProductAndStore/Cart.Action";
import { EmptyCart } from "@/components/customer/products/EmptyCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ShoppingCart,
  Shield,
  Wallet,
  ChevronLeft,
  Gift,
  Package,
  Receipt,
  CreditCard,
  BadgePercent,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/actions/customer/User.action";
import { TopUpDialog } from "@/components/customer/wallet/TopupDialog";
import ProgressBarCart, {
  SubsidyCart,
} from "@/components/customer/products/ProgressBarCart";
import { ICartItem } from "@/types/customer/CustomerCart";
import Navbar from "@/components/customer/landing/Navbar";
import CheckoutActions from "./CheckOutActions";
import { SubsidyItemsSection } from "@/components/customer/products/SubsidyItemsSection";
import { ISubsidyItems } from "@/db/models/customer/cart.model";
import { AddtoSubsidyBtn } from "@/components/customer/products/CartActionBtns";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import { getFibBracketFrom21 } from "@/lib/FibBracket";
import { RemoveButton } from "@/components/customer/products/RemoveButton";
import { QuantityControl } from "@/components/customer/products/QuantityControls";
import { cn } from "@/lib/utils";

const fmt = (cents: number) => (cents / 100).toFixed(2);
const calcLine = (item: ICartItem) => {
  const base = item.productId.price * item.quantity;
  const markup = Math.round(base * (item.productId.markup / 100));
  const markupPercentage = item.productId.markup;
  const afterMarkup = base + markup;
  const tax = item.productId.tax;

  let gst = 0;
  let pst = 0;
  if (tax === 0.05) {
    gst = Math.round(afterMarkup * 0.05);
  } else if (tax === 0.07) {
    pst = Math.round(afterMarkup * 0.07);
  } else if (tax === 0.12) {
    gst = Math.round(afterMarkup * 0.05);
    pst = Math.round(afterMarkup * 0.07);
  }

  const totalTax = gst + pst;
  const disposable = (item.productId.disposableFee ?? 0) * item.quantity;
  const lineTotal = afterMarkup + totalTax + disposable;

  return { base, markup, markupPercentage, afterMarkup, gst, pst, totalTax, disposable, lineTotal };
};

const CustomerCart = async ({ customerId }: { customerId?: string }) => {
  const isCashier = !!customerId;

  const [CartItems, UserData] = await Promise.all([
    getCart(customerId),
    getUser(customerId),
  ]);

  const giftWalletBalance = UserData?.giftWalletBalance ?? 0;
  const items = CartItems?.items as ICartItem[] | null;
  const subItems = (CartItems?.subItems as ISubsidyItems[]) ?? [];
  const subItemProductIds = subItems.map((s) => s.productId._id.toString());

  if (!items || (items.length === 0 && !subItems))
    return <EmptyCart customerId={customerId} />;

  const itemTotals = items.reduce(
    (acc, item) => {
      const { afterMarkup, gst, pst, totalTax, disposable, lineTotal } = calcLine(item);
      acc.subtotal   += afterMarkup;
      acc.gst        += gst;
      acc.pst        += pst;
      acc.totalTax   += totalTax;
      acc.disposable += disposable;
      acc.total      += lineTotal;
      return acc;
    },
    { subtotal: 0, gst: 0, pst: 0, totalTax: 0, disposable: 0, total: 0 },
  );

  const progressTotal = items.reduce((acc, item) => {
    if (item.productId.subsidised) return acc;
    const { markupPercentage, afterMarkup } = calcLine(item);
    return {
      total: acc.total + afterMarkup,
      totalMarkup: acc.totalMarkup + markupPercentage,
      productCount: acc.productCount + 1
    };
  }, { total: 0, totalMarkup: 0, productCount: 0 });

  const totalInDollars = progressTotal.total / 100;
  const { prev, current, mid } = getFibBracketFrom21(totalInDollars);
  const avgMarkup = progressTotal.totalMarkup / progressTotal.productCount;

  const activeMarkup = (() => {
    if (prev >= 21 && totalInDollars >= prev && totalInDollars < mid!) return avgMarkup;
    else if (mid && totalInDollars >= mid && totalInDollars <= current) return 30;
    return null;
  })();

  const calculateTotalMarkup = (item: ICartItem) => {
    if (activeMarkup === null || item.productId.subsidised) return null;
    const base = item.productId.price * item.quantity;
    return Math.round(base * (activeMarkup / 100));
  };

  const totalActiveMarkup = items.reduce((acc, item) => acc + (calculateTotalMarkup(item) ?? 0), 0);

  const subsidyTotals = subItems.reduce(
    (acc, item) => {
      const fullPrice = item.TotalPrice * item.quantity;
      const afterSubsidy = Math.max(fullPrice - item.subsidy, 0);
      const taxRate = item.productId.tax ?? 0;
      const taxBase = fullPrice;

      let gst = 0;
      let pst = 0;
      if (taxRate === 0.05) gst = Math.round(taxBase * 0.05);
      else if (taxRate === 0.07) pst = Math.round(taxBase * 0.07);
      else if (taxRate === 0.12) {
        gst = Math.round(taxBase * 0.05);
        pst = Math.round(taxBase * 0.07);
      }

      const totalTax = gst + pst;
      acc.disposable += (item.productId.disposableFee ?? 0) * item.quantity;
      acc.subtotal   += afterSubsidy;
      acc.gst        += gst;
      acc.pst        += pst;
      acc.totalTax   += totalTax;
      acc.total      += afterSubsidy + totalTax;
      return acc;
    },
    { subtotal: 0, gst: 0, pst: 0, totalTax: 0, disposable: 0, total: 0 },
  );

  const totals = {
    subtotal:   itemTotals.subtotal   + subsidyTotals.subtotal,
    gst:        itemTotals.gst        + subsidyTotals.gst,
    pst:        itemTotals.pst        + subsidyTotals.pst,
    totalTax:   itemTotals.totalTax   + subsidyTotals.totalTax,
    disposable: itemTotals.disposable + subsidyTotals.disposable,
    total:      itemTotals.total      + subsidyTotals.total,
  };

  const showGST = totals.gst > 0;
  const showPST = totals.pst > 0;

  const active = activeMarkup ?? 0;
  const markupBase = (() => {
    if (mid && totalInDollars >= mid && totalInDollars <= current) return mid * 100;
    if (totalInDollars >= prev && totalInDollars < (mid ?? current)) return prev * 100;
    return 0;
  })();

  const MarkupSub = markupBase * (active / 100);
  const subsidyOnOrder = Math.floor(MarkupSub * 0.60);
  const TotalSubsidy = Number(((subsidyOnOrder + giftWalletBalance) / 100).toFixed(2));
  const totalItemCount = items.length + subItems.length;

  // ── Sub-components ──────────────────────────────────────────────────────────

  const TaxRows = () => (
    <>
      {showGST && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GST (5%)</span>
          <span className="font-medium tabular-nums">CA${fmt(totals.gst)}</span>
        </div>
      )}
      {showPST && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">PST (7%)</span>
          <span className="font-medium tabular-nums">CA${fmt(totals.pst)}</span>
        </div>
      )}
      {showGST && showPST && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Tax</span>
          <span className="font-medium tabular-nums">CA${fmt(totals.totalTax)}</span>
        </div>
      )}
    </>
  );

  const DisposableRow = () => (
    <>
      {itemTotals.disposable > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Disposable fee</span>
          <span className="font-medium tabular-nums">CA${fmt(itemTotals.disposable)}</span>
        </div>
      )}
      {subsidyTotals.disposable > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            Disposable fee
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400">
              covered
            </Badge>
          </span>
          <span className="font-medium tabular-nums text-emerald-600 line-through">
            CA${fmt(subsidyTotals.disposable)}
          </span>
        </div>
      )}
    </>
  );

  // Wallet section — different emphasis for cashier vs customer
  const WalletSection = () => (
    <div className={cn("grid gap-3", isCashier ? "grid-cols-2" : "grid-cols-2")}>
      {/* Main Wallet */}
      <Card className="relative overflow-hidden border-border/60 shadow-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">Main Wallet</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Available balance</p>
            </div>
          </div>
          <p className="text-xl font-bold tabular-nums text-foreground mb-3">
            <span className="text-xs font-medium text-muted-foreground mr-0.5">CA$</span>
            {fmt(UserData?.walletBalance ?? 0)}
          </p>
          <TopUpDialog customerId={customerId} />
        </CardContent>
      </Card>

      {/* Gift Wallet */}
      <Card className={cn(
        "relative overflow-hidden border-border/60 shadow-none",
        giftWalletBalance > 0 && "border-primary/30 bg-primary/[0.02]"
      )}>
        {giftWalletBalance > 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
        )}
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              giftWalletBalance > 0 ? "bg-primary/10" : "bg-muted"
            )}>
              <Gift className={cn("h-4 w-4", giftWalletBalance > 0 ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">Gift Wallet</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Subsidies earned</p>
            </div>
          </div>
          <p className={cn(
            "text-xl font-bold tabular-nums mb-3",
            giftWalletBalance > 0 ? "text-primary" : "text-muted-foreground"
          )}>
            <span className="text-xs font-medium text-muted-foreground mr-0.5">CA$</span>
            {fmt(giftWalletBalance)}
          </p>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border",
            giftWalletBalance > 0
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground border-border"
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              giftWalletBalance > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
            )} />
            {giftWalletBalance > 0 ? "Active" : "No subsidies yet"}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Order summary card content (shared between mobile + desktop)
  const OrderSummaryContent = () => (
    <div className="space-y-2.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium tabular-nums">CA${fmt(totals.subtotal)}</span>
      </div>
      <TaxRows />
      <DisposableRow />
      <SubsidyCart subsidy={subsidyOnOrder} />
      <Separator className="my-1" />
      <div className="flex justify-between items-center pt-0.5">
        <span className="font-semibold text-foreground">Total</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">CA$</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">{fmt(totals.total)}</span>
        </div>
      </div>
    </div>
  );

  // Cart item row (shared between mobile card and desktop row)
  const CartItemCard = ({ item, variant }: { item: ICartItem; variant: "mobile" | "desktop" }) => {
    const { afterMarkup } = calcLine(item);
    const hasImage = item.productId.images?.[0]?.url;
    const isMobile = variant === "mobile";

    return (
      <div className={cn(
        "flex gap-3 bg-card",
        isMobile ? "rounded-xl border border-border/60 p-3" : "px-5 py-4 border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
      )}>
        {/* Image */}
        <div className={cn(
          "relative shrink-0 rounded-lg overflow-hidden bg-secondary",
          isMobile ? "h-16 w-16" : "h-[60px] w-[60px]"
        )}>
          {hasImage ? (
            <Image
              src={item.productId.images?.[0]?.url ?? ""}
              alt={item.productId.name}
              width={64} height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <CategoryIllustration category={item.productId.category} className="w-full h-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn("flex items-start gap-2", isMobile ? "flex-col" : "flex-row justify-between")}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold truncate text-foreground">{item.productId.name}</p>
                {item.productId.subsidised && (
                  <AddtoSubsidyBtn ProductId={item.productId._id.toString()} customerId={customerId} />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.productId.category}</p>
            </div>
            <p className="text-sm font-bold tabular-nums text-primary shrink-0">
              CA${fmt(afterMarkup)}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <RemoveButton productId={item.productId._id.toString()} customerId={customerId} variant={variant} />
            <QuantityControl productId={item.productId._id.toString()} customerId={customerId} initialQuantity={item.quantity} variant={variant} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen",
      !isCashier && "bg-background"
    )}>
      {!isCashier && <Navbar />}

      {/* ══════════════════════════════════════════
          CASHIER MODE — top banner
      ══════════════════════════════════════════ */}
      {isCashier && (
        <div className="border-b border-border bg-muted/40 px-4 md:px-8 py-2.5 flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Cashier View
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-foreground font-semibold">Customer Cart</span>
        </div>
      )}

      {/* ════════════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════════════ */}
      <div className="md:hidden px-4 pt-5 pb-52 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={isCashier ? `/cashier/customer/${customerId}` : "/"}>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {isCashier ? "Customer's Cart" : "My Cart"}
            </h1>
            <Badge variant="secondary" className="rounded-full font-semibold">
              {totalItemCount}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-4">
            <ProgressBarCart
              total={progressTotal.total}
              customerId={customerId}
              giftWalletBalance={giftWalletBalance}
              totalMarkup={totalActiveMarkup}
              Totalsubsidy={TotalSubsidy}
              SubsidyonOrder={subsidyOnOrder}
              subItemIds={subItemProductIds}
            />
          </CardContent>
        </Card>

        {/* Cart items */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items ({items.length})
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item: ICartItem) => (
              <CartItemCard key={item.productId._id.toString()} item={item} variant="mobile" />
            ))}
          </div>
        </div>

        {/* Subsidy items */}
        <SubsidyItemsSection subItems={subItems} customerId={customerId} />

        {/* Wallets */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wallets
            </span>
          </div>
          <WalletSection />
        </div>

        {/* Bill summary */}
        <Card className="border-border/60 shadow-none overflow-hidden">
          <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bill Details
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <OrderSummaryContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Fixed CTA */}
      <div className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md px-4 pt-4",
        isCashier ? "pb-24" : "pb-6"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
              CA${fmt(totals.total)}
            </p>
          </div>
          <CheckoutActions customerId={customerId} compact TotalCart={totals} />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3 text-muted-foreground/50" />
          <p className="text-[11px] text-muted-foreground/60">Secured checkout</p>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════ */}
      <div className="hidden md:block max-w-5xl mx-auto px-8 py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={isCashier ? `/cashier/customer/${customerId}` : "/"}>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                {isCashier ? "Customer's Cart" : "My Cart"}
              </h1>
              {isCashier && (
                <p className="text-xs text-muted-foreground leading-tight">
                  Managing order on behalf of customer
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full font-semibold ml-1">
            {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
          </Badge>
        </div>

        {/* Progress bar */}
        <Card className="mb-6 border-border/60 shadow-none">
          <CardContent className="px-5 py-4">
            <ProgressBarCart
              total={progressTotal.total}
              customerId={customerId}
              giftWalletBalance={giftWalletBalance}
              totalMarkup={totalActiveMarkup}
              Totalsubsidy={TotalSubsidy}
              SubsidyonOrder={subsidyOnOrder}
              subItemIds={subItemProductIds}
            />
          </CardContent>
        </Card>

        {/* 2-col layout */}
        <div className="flex gap-6 items-start">

          {/* Left — items + wallets */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Items card */}
            <Card className="border-border/60 shadow-none overflow-hidden">
              <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </CardHeader>
              <div>
                {items.map((item: ICartItem) => {
                  const { afterMarkup } = calcLine(item);
                  const hasImage = item.productId.images?.[0]?.url;
                  return (
                    <div key={item.productId._id.toString()}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors group">

                      <div className="relative h-[56px] w-[56px] shrink-0 rounded-lg overflow-hidden bg-secondary">
                        {hasImage ? (
                          <Image
                            src={item.productId.images?.[0]?.url ?? ""}
                            alt={item.productId.name}
                            width={56} height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{item.productId.name}</p>
                          {item.productId.subsidised && (
                            <AddtoSubsidyBtn ProductId={item.productId._id.toString()} customerId={customerId} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.productId.category}</p>
                      </div>

                      <QuantityControl
                        productId={item.productId._id.toString()}
                        customerId={customerId}
                        initialQuantity={item.quantity}
                        variant="desktop"
                      />

                      <div className="w-20 text-right">
                        <p className="text-sm font-bold tabular-nums text-primary">
                          CA${fmt(afterMarkup)}
                        </p>
                      </div>

                      <RemoveButton
                        productId={item.productId._id.toString()}
                        customerId={customerId}
                        variant="desktop"
                      />
                    </div>
                  );
                })}
              </div>
            </Card>

            <SubsidyItemsSection subItems={subItems} customerId={customerId} />

            {/* Wallets */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wallets
                </span>
              </div>
              <WalletSection />
            </div>
          </div>

          {/* Right — order summary */}
          <div className="w-72 shrink-0 sticky top-6">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Order Summary
                  </span>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-5">
                <OrderSummaryContent />
              </CardContent>

              <div className="px-5 pb-5 space-y-3">
                <CheckoutActions customerId={customerId} TotalCart={totals} />
                <div className="flex items-center justify-center gap-1.5">
                  <Shield className="h-3 w-3 text-muted-foreground/40" />
                  <p className="text-[11px] text-muted-foreground/50">Secured checkout</p>
                </div>
              </div>
            </Card>

            {/* Cashier quick-info card */}
            {isCashier && (
              <Card className="mt-3 border-border/60 shadow-none bg-muted/30">
                <CardContent className="px-4 py-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BadgePercent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Info</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Active markup</span>
                    <span className="font-semibold text-foreground">{active > 0 ? `${active}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subsidy on order</span>
                    <span className="font-semibold text-primary">CA${fmt(subsidyOnOrder)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Gift wallet balance</span>
                    <span className="font-semibold text-foreground">CA${fmt(giftWalletBalance)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;