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
  Store,
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
  let gst = 0,
    pst = 0;
  if (tax === 0.05) gst = Math.round(afterMarkup * 0.05);
  else if (tax === 0.07) pst = Math.round(afterMarkup * 0.07);
  else if (tax === 0.12) {
    gst = Math.round(afterMarkup * 0.05);
    pst = Math.round(afterMarkup * 0.07);
  }
  const totalTax = gst + pst;
  const disposable = (item.productId.disposableFee ?? 0) * item.quantity;
  const lineTotal = afterMarkup + totalTax + disposable;
  return {
    base,
    markup,
    markupPercentage,
    afterMarkup,
    gst,
    pst,
    totalTax,
    disposable,
    lineTotal,
  };
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
      const { afterMarkup, gst, pst, totalTax, disposable, lineTotal } =
        calcLine(item);
      acc.subtotal += afterMarkup;
      acc.gst += gst;
      acc.pst += pst;
      acc.totalTax += totalTax;
      acc.disposable += disposable;
      acc.total += lineTotal;
      return acc;
    },
    { subtotal: 0, gst: 0, pst: 0, totalTax: 0, disposable: 0, total: 0 },
  );

  const progressTotal = items.reduce(
    (acc, item) => {
      if (item.productId.subsidised) return acc;
      const { markupPercentage, afterMarkup } = calcLine(item);
      return {
        total: acc.total + afterMarkup,
        totalMarkup: acc.totalMarkup + markupPercentage,
        productCount: acc.productCount + 1,
      };
    },
    { total: 0, totalMarkup: 0, productCount: 0 },
  );

  const totalInDollars = progressTotal.total / 100;
  const { prev, current, mid } = getFibBracketFrom21(totalInDollars);
  const avgMarkup = progressTotal.totalMarkup / progressTotal.productCount;


  const activeMarkup = (() => {
    if (prev >= 21 && totalInDollars >= prev && totalInDollars < mid!)
      return avgMarkup;
    else if (mid && totalInDollars >= mid && totalInDollars <= current)
      return 30;
    return null;
  })();
CartItems

  const calculateTotalMarkup = (item: ICartItem) => {
    if (activeMarkup === null || item.productId.subsidised) return null;
    return Math.round(
      item.productId.price * item.quantity * (activeMarkup / 100),
    );
  };

  const totalActiveMarkup = items.reduce(
    (acc, item) => acc + (calculateTotalMarkup(item) ?? 0),
    0,
  );

  const subsidyTotals = subItems.reduce(
    (acc, item) => {
      const fullPrice = item.TotalPrice * item.quantity;
      const afterSubsidy = Math.max(fullPrice - item.subsidy, 0);
      const taxRate = item.productId.tax ?? 0;
      let gst = 0,
        pst = 0;
      if (taxRate === 0.05) gst = Math.round(fullPrice * 0.05);
      else if (taxRate === 0.07) pst = Math.round(fullPrice * 0.07);
      else if (taxRate === 0.12) {
        gst = Math.round(fullPrice * 0.05);
        pst = Math.round(fullPrice * 0.07);
      }
      const totalTax = gst + pst;
      acc.disposable += (item.productId.disposableFee ?? 0) * item.quantity;
      acc.subtotal += afterSubsidy;
      acc.gst += gst;
      acc.pst += pst;
      acc.totalTax += totalTax;
      acc.total += afterSubsidy + totalTax;
      return acc;
    },
    { subtotal: 0, gst: 0, pst: 0, totalTax: 0, disposable: 0, total: 0 },
  );

  const totals = {
    subtotal: itemTotals.subtotal + subsidyTotals.subtotal,
    gst: itemTotals.gst + subsidyTotals.gst,
    pst: itemTotals.pst + subsidyTotals.pst,
    totalTax: itemTotals.totalTax + subsidyTotals.totalTax,
    disposable: itemTotals.disposable + subsidyTotals.disposable,
    total: itemTotals.total + subsidyTotals.total,
  };

  const showGST = totals.gst > 0;
  const showPST = totals.pst > 0;
  const active = activeMarkup ?? 0;

  const markupBase = (() => {
    if (mid && totalInDollars >= mid && totalInDollars <= current)
      return mid * 100;
    if (totalInDollars >= prev && totalInDollars < (mid ?? current))
      return prev * 100;
    return 0;
  })();

  const MarkupSub = markupBase * (active / 100);
  const subsidyOnOrder = Math.floor(MarkupSub * 0.6);
  const TotalSubsidy = Number(
    ((subsidyOnOrder + giftWalletBalance) / 100).toFixed(2),
  );
  const totalItemCount = items.length + subItems.length;

  // ── Sub-components ──────────────────────────────────────────────

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
          <span className="font-medium tabular-nums">
            CA${fmt(totals.totalTax)}
          </span>
        </div>
      )}
    </>
  );

  const DisposableRow = () => (
    <>
      {itemTotals.disposable > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Disposable fee</span>
          <span className="font-medium tabular-nums">
            CA${fmt(itemTotals.disposable)}
          </span>
        </div>
      )}
      {subsidyTotals.disposable > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5 flex-wrap">
            Disposable fee
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
            >
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

  const WalletSection = () => (
    <div className="grid grid-cols-2 gap-3">
      <Card className="relative overflow-hidden border-border/60 shadow-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                Main Wallet
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                Available balance
              </p>
            </div>
          </div>
          <p className="text-xl font-bold tabular-nums text-foreground truncate">
            <span className="text-xs font-medium text-muted-foreground mr-0.5">
              CA$
            </span>
            {fmt(UserData?.walletBalance ?? 0)}
          </p>
          <TopUpDialog customerId={customerId} />
        </CardContent>
      </Card>

      <Card
        className={cn(
          "relative overflow-hidden border-border/60 shadow-none",
          giftWalletBalance > 0 && "border-primary/30 bg-primary/[0.02]",
        )}
      >
        {giftWalletBalance > 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
        )}
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                giftWalletBalance > 0 ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Gift
                className={cn(
                  "h-4 w-4",
                  giftWalletBalance > 0
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                Gift Wallet
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                Subsidies earned
              </p>
            </div>
          </div>
          <p
            className={cn(
              "text-xl font-bold tabular-nums truncate",
              giftWalletBalance > 0 ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="text-xs font-medium text-muted-foreground mr-0.5">
              CA$
            </span>
            {fmt(giftWalletBalance)}
          </p>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border w-fit",
              giftWalletBalance > 0
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                giftWalletBalance > 0
                  ? "bg-primary animate-pulse"
                  : "bg-muted-foreground/40",
              )}
            />
            {giftWalletBalance > 0 ? "Active" : "No subsidies yet"}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OrderSummaryContent = () => (
    <div className="space-y-2.5">
      <div className="flex justify-between text-sm gap-4">
        <span className="text-muted-foreground shrink-0">Subtotal</span>
        <span className="font-medium tabular-nums">
          CA${fmt(totals.subtotal)}
        </span>
      </div>
      <TaxRows />
      <DisposableRow />
      <SubsidyCart subsidy={subsidyOnOrder} />
      <Separator className="my-1" />
      <div className="flex justify-between items-center gap-4 pt-0.5">
        <span className="font-semibold text-foreground shrink-0">Total</span>
        <div className="flex items-baseline gap-0.5 min-w-0">
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            CA$
          </span>
          <span className="text-2xl font-bold tabular-nums text-foreground truncate">
            {fmt(totals.total)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen", !isCashier && "bg-background")}>
      {!isCashier && <Navbar />}

      {/* ── Cashier banner ── */}
      {isCashier && (
        <div className="border-b border-border bg-background px-4 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="h-3 w-3 text-primary" />
            </div>
            <Badge
              variant="secondary"
              className="font-semibold text-xs gap-1 px-2"
            >
              <User className="h-3 w-3" />
              Cashier View
            </Badge>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Live session
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MOBILE + TABLET LAYOUT  (< lg / < 1024px)
          Covers phones AND iPads (768px portrait & landscape)
      ════════════════════════════════════════ */}
      <div
        className="lg:hidden flex flex-col"
        style={{ minHeight: "calc(100dvh - 0px)" }}
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-5 pb-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href={isCashier ? `/cashier/customer/${customerId}` : "/customer"}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <ShoppingCart className="h-5 w-5 text-primary shrink-0" />
              <h1 className="text-lg font-bold tracking-tight text-foreground truncate">
                {isCashier ? "Customer's Cart" : "My Cart"}
              </h1>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full font-semibold shrink-0"
            >
              {totalItemCount}
            </Badge>
          </div>

          {/* Progress */}
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
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items ({items.length})
              </span>
            </div>

            {/* Scrollable items list */}
            <div className="max-h-[460px] overflow-y-auto no-scrollbar rounded-xl space-y-2 pr-0.5">
              {items.map((item: ICartItem) => {
                const { afterMarkup } = calcLine(item);
                const hasImage = item.productId.images?.[0]?.url;
                return (
                  <div
                    key={item.productId._id.toString()}
                    className="flex gap-3 bg-card rounded-xl border border-border/60 p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-secondary">
                      {hasImage ? (
                        <Image
                          src={item.productId.images?.[0]?.url ?? ""}
                          alt={item.productId.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CategoryIllustration
                          category={item.productId.category}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                            {item.productId.name}
                          </p>
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
                            productId={item.productId._id.toString()}
                            customerId={customerId}
                            variant="mobile"
                          />
                          {item.productId.subsidised && (
                            <AddtoSubsidyBtn
                              ProductId={item.productId._id.toString()}
                              customerId={customerId}
                            />
                          )}
                        </div>
                        <QuantityControl
                          productId={item.productId._id.toString()}
                          customerId={customerId}
                          initialQuantity={item.quantity}
                          variant="mobile"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Subsidy items */}
          <SubsidyItemsSection subItems={subItems} customerId={customerId} />

          {/* Wallets */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Wallets
              </span>
            </div>
            <WalletSection />
          </section>

          {/* Bill summary */}
          <Card className="border-border/60 shadow-none overflow-hidden">
            <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order Summary
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4">
              <OrderSummaryContent />
            </CardContent>
          </Card>

          {/* Cashier order info (mobile/tablet) */}
          {isCashier && (
            <Card className="border-border/60 shadow-none bg-muted/30">
              <CardContent className="px-4 py-3.5 space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <BadgePercent className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order Info
                  </span>
                </div>
                <div className="flex justify-between text-xs gap-4">
                  <span className="text-muted-foreground shrink-0">
                    Active markup
                  </span>
                  <span className="font-semibold text-foreground">
                    {active > 0 ? `${active}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs gap-4">
                  <span className="text-muted-foreground shrink-0">
                    Subsidy on order
                  </span>
                  <span className="font-semibold text-primary">
                    CA${fmt(subsidyOnOrder)}
                  </span>
                </div>
                <div className="flex justify-between text-xs gap-4">
                  <span className="text-muted-foreground shrink-0">
                    Gift wallet
                  </span>
                  <span className="font-semibold text-foreground">
                    CA${fmt(giftWalletBalance)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile/Tablet CTA — sticky above footer */}
        <div className="sticky bottom-0 shrink-0 border-t border-border bg-background/95 backdrop-blur-md px-4 pt-3.5 pb-6 z-10">
          <div className={`flex ${customerId ? "items-center": ""} justify-between gap-4 ${!customerId ? "mb-2": ""}`}>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
                Total
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground truncate">
                CA${fmt(totals.total)}
              </p>
            </div>
            <div className="shrink-0">
              <CheckoutActions
                customerId={customerId}
                compact
                TotalCart={totals}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            <p className="text-[11px] text-muted-foreground/60">
              Secured checkout
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT  (≥ lg / ≥ 1024px)
          Only triggers on true desktop screens
      ════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Link
              href={isCashier ? `/cashier/customer/${customerId}` : "/customer"}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight truncate">
                  {isCashier ? "Customer's Cart" : "My Cart"}
                </h1>
                {isCashier && (
                  <p className="text-xs text-muted-foreground leading-tight">
                    Managing order on behalf of customer
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full font-semibold ml-1 shrink-0"
            >
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
            {/* Left col */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Items card */}
              <Card className="border-border/60 shadow-none overflow-hidden">
                <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50 sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </CardHeader>

                {/* Scrollable items */}
                <div className="max-h-[420px] overflow-y-auto no-scrollbar divide-y divide-border/50">
                  {items.map((item: ICartItem) => {
                    const { afterMarkup } = calcLine(item);
                    const hasImage = item.productId.images?.[0]?.url;
                    return (
                      <div
                        key={item.productId._id.toString()}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/20 transition-colors group"
                      >
                        <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-secondary">
                          {hasImage ? (
                            <Image
                              src={item.productId.images?.[0]?.url ?? ""}
                              alt={item.productId.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <CategoryIllustration
                              category={item.productId.category}
                              className="w-full h-full"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {item.productId.name}
                            </p>
                            {item.productId.subsidised && (
                              <span className="shrink-0">
                                <AddtoSubsidyBtn
                                  ProductId={item.productId._id.toString()}
                                  customerId={customerId}
                                />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.productId.category}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <QuantityControl
                            productId={item.productId._id.toString()}
                            customerId={customerId}
                            initialQuantity={item.quantity}
                            variant="desktop"
                          />
                        </div>

                        <div className="w-24 text-right shrink-0">
                          <p className="text-sm font-bold tabular-nums text-primary">
                            CA${fmt(afterMarkup)}
                          </p>
                        </div>

                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <RemoveButton
                            productId={item.productId._id.toString()}
                            customerId={customerId}
                            variant="desktop"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Subsidy items */}
              <SubsidyItemsSection
                subItems={subItems}
                customerId={customerId}
              />

              {/* Wallets */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Wallets
                  </span>
                </div>
                <WalletSection />
              </section>
            </div>

            {/* Right col — sticky summary */}
            <div className="w-72 shrink-0 sticky top-6 space-y-3">
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Order Summary
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-5 py-5">
                  <OrderSummaryContent />
                </CardContent>
                <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
                  <CheckoutActions customerId={customerId} TotalCart={totals} />
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    <p className="text-[11px] text-muted-foreground/50">
                      Secured checkout
                    </p>
                  </div>
                </div>
              </Card>

              {isCashier && (
                <Card className="border-border/60 shadow-none bg-muted/30 overflow-hidden">
                  <CardContent className="px-4 py-3.5 space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <BadgePercent className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Order Info
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xs gap-4">
                      <span className="text-muted-foreground shrink-0">
                        Active markup
                      </span>
                      <span className="font-semibold text-foreground">
                        {active > 0 ? `${active}%` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs gap-4">
                      <span className="text-muted-foreground shrink-0">
                        Subsidy on order
                      </span>
                      <span className="font-semibold text-primary">
                        CA${fmt(subsidyOnOrder)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs gap-4">
                      <span className="text-muted-foreground shrink-0">
                        Gift wallet
                      </span>
                      <span className="font-semibold text-foreground">
                        CA${fmt(giftWalletBalance)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;