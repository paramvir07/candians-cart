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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/actions/customer/User.action";
import { TopUpDialog } from "@/components/customer/wallet/TopupDialog";
import ProgressBarCart, {
  CartAmountBadge,
  SubsidyCart,
} from "@/components/customer/products/ProgressBarCart";
import { ICartItem } from "@/types/customer/CustomerCart";
import Navbar from "@/components/customer/landing/Navbar";
import CheckoutActions from "./CheckOutActions";
import { SubsidyItemsSection } from "@/components/customer/products/SubsidyItemsSection";
import { IMiscCartItem, ISubsidyItems } from "@/db/models/customer/cart.model";
import { AddtoSubsidyBtn } from "@/components/customer/products/CartActionBtns";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import { getFibBracketFrom21 } from "@/lib/FibBracket";
import { RemoveButton } from "@/components/customer/products/RemoveButton";
import { QuantityControl } from "@/components/customer/products/QuantityControls";
import { cn } from "@/lib/utils";
import AddMiscItemModalTrigger from "@/components/cashier/MiscItemTrigger";
import { MiscItemsSection } from "@/components/cashier/MiscItemSection";
import { UPCScannerCart } from "@/components/cashier/UPCScannerCart";

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
  const UserStoreId = UserData?.associatedStoreId?.toString() ?? "";
  const rawItems = (CartItems?.items as ICartItem[] | null) ?? [];
  const nonSubsidised = rawItems
    .filter((i) => !i.productId.subsidised)
    .reverse();
  const subsidised = rawItems.filter((i) => i.productId.subsidised).reverse();
  const items = [...nonSubsidised, ...subsidised];
  const subItems = (CartItems?.subItems as ISubsidyItems[]) ?? [];
  const MiscItems = (CartItems?.miscItems as IMiscCartItem[]) ?? [];
  const subItemProductIds = subItems.map((s) => s.productId._id.toString());

  if (
    !items ||
    (items.length === 0 && subItems.length === 0 && MiscItems.length === 0)
  )
    return (
      <>
        <div className=" mt-5 mx-5">
          {customerId && (
            <UPCScannerCart customerId={customerId} storeId={UserStoreId} />
          )}
        </div>
        <EmptyCart customerId={customerId} />
      </>
    );

  const itemTotals = items.reduce(
    (acc, item) => {
      const { afterMarkup, gst, pst, totalTax, disposable, lineTotal, markup } =
        calcLine(item);
      acc.subtotal += afterMarkup;
      acc.gst += gst;
      acc.pst += pst;
      acc.totalTax += totalTax;
      acc.disposable += disposable;
      acc.total += lineTotal;
      acc.totalMarkup += markup;
      return acc;
    },
    {
      subtotal: 0,
      gst: 0,
      pst: 0,
      totalTax: 0,
      disposable: 0,
      total: 0,
      totalMarkup: 0,
    },
  );
  const nonSubsidisedMarkup = items.reduce((acc, item) => {
    if (item.productId.subsidised) return acc;
    return acc + calcLine(item).markup;
  }, 0);

  // console.log("Total Markup : ",nonSubsidisedMarkup)
  let newSubisdyCalc = 0;
  // console.log("Subsidy given:", (nonSubsidisedMarkup * 0.6)/100);

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

  if (prev >= 21) {
    newSubisdyCalc = nonSubsidisedMarkup * 0.6;
  }
  const activeMarkup = (() => {
    if (prev >= 21 && totalInDollars >= prev && totalInDollars < mid!)
      return avgMarkup;
    else if (mid && totalInDollars >= mid && totalInDollars <= current)
      return avgMarkup; // If we're above the mid point, we can still give the higher markup as a subsidy, but it won't be reflected in the progress bar markup percentage
    return null;
  })();
  CartItems;

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

  const calcMiscTotal = (miscItems: IMiscCartItem[]) => {
    return miscItems.reduce(
      (acc, item) => {
        const taxRate = item.taxAtAdd ?? (item.itemId as any)?.tax ?? 0;
        const linePreTax = item.priceAtAdd * item.quantity;

        let gst = 0,
          pst = 0;
        if (taxRate === 0.05) gst = Math.round(linePreTax * 0.05);
        else if (taxRate === 0.07) pst = Math.round(linePreTax * 0.07);
        else if (taxRate === 0.12) {
          gst = Math.round(linePreTax * 0.05);
          pst = Math.round(linePreTax * 0.07);
        }

        const totalTax = gst + pst;
        acc.subtotal += linePreTax;
        acc.gst += gst;
        acc.pst += pst;
        acc.totalTax += totalTax;
        acc.total += linePreTax + totalTax;
        return acc;
      },
      { subtotal: 0, gst: 0, pst: 0, totalTax: 0, total: 0 },
    );
  };

  const miscTotals = calcMiscTotal(MiscItems);

  // console.log(miscTotals)

  const totals = {
    subtotal: Math.round(
      itemTotals.subtotal + subsidyTotals.subtotal + miscTotals.subtotal,
    ),
    gst: itemTotals.gst + subsidyTotals.gst + miscTotals.gst,
    pst: itemTotals.pst + subsidyTotals.pst + miscTotals.pst,
    totalTax:
      itemTotals.totalTax + subsidyTotals.totalTax + miscTotals.totalTax,
    disposable: itemTotals.disposable + subsidyTotals.disposable,
    total: Math.round(
      itemTotals.total + subsidyTotals.total + miscTotals.total,
    ),
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
  const subsidyOnOrder = Math.floor(MarkupSub * 0.6); // Subsidy is 60% of the calculated markup based on the active fib bracket
  const TotalSubsidy = Number(
    ((newSubisdyCalc + giftWalletBalance) / 100).toFixed(2),
  );

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
          <TopUpDialog
            customerId={customerId}
            cartTotal={totals.total}
            WalletBalance={UserData?.walletBalance ?? 0}
          />
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
      <SubsidyCart subsidy={newSubisdyCalc} total={totals.total} />
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

      {customerId && (
        <div className="w-full flex items-center gap-2 px-4 xl:px-8 pt-5 xl:pt-8">
          <div className="flex-1">
            <UPCScannerCart customerId={customerId} storeId={UserStoreId} />
          </div>
          <AddMiscItemModalTrigger customerId={customerId || ""} />
        </div>
      )}

      <div
        className="xl:hidden flex flex-col"
        style={{ minHeight: "calc(100dvh - 0px)" }}
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-4">
          {/* Progress */}
          <div
            className={`border-border/60 shadow-none`}
          >
            <div className={`${isCashier && "hidden"}`}>
              <ProgressBarCart
                total={progressTotal.total}
                customerId={customerId}
                giftWalletBalance={giftWalletBalance}
                totalMarkup={totalActiveMarkup}
                Totalsubsidy={TotalSubsidy}
                SubsidyonOrder={Math.round(newSubisdyCalc)}
                subItemIds={subItemProductIds}
              />
            </div>
            <CartAmountBadge total={progressTotal.total} />
          </div>

          {/* Cart items */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Items ({items.length})
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tabular-nums text-primary">
                CA${fmt(itemTotals.total)}
              </span>
            </div>

            {/* Scrollable items list */}
            <div className="max-h-[460px] overflow-y-auto rounded-xl space-y-2 pr-0.5">
              {items.map((item: ICartItem) => {
                const { afterMarkup } = calcLine(item);
                const hasImage = item.productId.images?.[0]?.url;
                const isMeasuredInWeight = item.productId.isMeasuredInWeight;
                return (
                  <div
                    key={item.productId._id.toString()}
                    data-cart-item
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
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2 flex gap-2 items-center">
                              {item.productId.name}
                              {isMeasuredInWeight &&
                                `/${item.productId.UOM?.toLowerCase()}`}
                              {item.productId?.PriceDrop ? (
                                <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold leading-none text-amber-950 shadow-md shadow-amber-900/30 backdrop-blur-sm w-fit">
                                  <BadgePercent
                                    className="h-2.5 w-2.5 shrink-0 "
                                    strokeWidth={2}
                                  />
                                  PRICE DROP
                                </div>
                              ) : (
                                ""
                              )}
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground"></p>
                          </div>
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
                          isMeasuredInWeight={item.productId.isMeasuredInWeight}
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
          <MiscItemsSection miscItems={MiscItems} customerId={customerId} />

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
        </div>

        {/* Mobile/Tablet CTA — sticky above footer */}
        {customerId && (
          <div className="sticky bottom-0 shrink-0 border-t border-border bg-background/95 backdrop-blur-md px-4 pt-3.5 pb-6 z-10">
            <div
              className={`flex ${customerId ? "items-center" : ""} justify-between gap-4 ${!customerId ? "mb-2" : ""}`}
            >
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
        )}
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT  (≥ lg / ≥ 1024px)
          Only triggers on true desktop screens
      ════════════════════════════════════════ */}
      <div className="hidden xl:block">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          {/* Progress bar */}
          <div className="mb-6 border-border/60 shadow-none">
            <div className={`${isCashier && "hidden"}`}>
              <ProgressBarCart
                total={progressTotal.total}
                customerId={customerId}
                giftWalletBalance={giftWalletBalance}
                totalMarkup={totalActiveMarkup}
                Totalsubsidy={TotalSubsidy}
                SubsidyonOrder={Math.round(newSubisdyCalc)}
                subItemIds={subItemProductIds}
              />
            </div>
            <div className="mt-3">
              <CartAmountBadge total={progressTotal.total} />
            </div>
          </div>

          {/* 2-col layout */}
          <div className="flex gap-6 items-start">
            {/* Left col */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Items card */}
              <Card className="border-border/60 shadow-none overflow-hidden">
                <CardHeader className="px-5 py-3.5 bg-muted/30 border-b border-border/50 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tabular-nums text-primary">
                      CA${fmt(itemTotals.total)}
                    </span>
                  </div>
                </CardHeader>

                {/* Scrollable items */}
                <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
                  {items.map((item: ICartItem) => {
                    const { afterMarkup } = calcLine(item);
                    const hasImage = item.productId.images?.[0]?.url;
                    const isMeasuredInWeight =
                      item.productId.isMeasuredInWeight;
                    return (
                      <div
                        key={item.productId._id.toString()}
                        data-cart-item
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

                        {/* <div className="flex-1 min-w-0">
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
                        </div> */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            {" "}
                            {/* changed items-center to items-start */}
                            <p className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
                              {item.productId.name}
                              {isMeasuredInWeight &&
                                `/${item.productId.UOM?.toLowerCase()}`}
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground">
                              {item.productId?.PriceDrop ? (
                                <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold leading-none text-amber-950 shadow-md shadow-amber-900/30 backdrop-blur-sm">
                                  <BadgePercent
                                    className="h-2.5 w-2.5 shrink-0 "
                                    strokeWidth={2}
                                  />
                                  PRICE DROP
                                </div>
                              ) : (
                                ""
                              )}
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
                            isMeasuredInWeight={
                              item.productId.isMeasuredInWeight
                            }
                          />
                        </div>

                        <div className="w-24 text-right shrink-0">
                          <p className="text-sm font-bold tabular-nums text-primary">
                            CA${fmt(afterMarkup)}
                          </p>
                        </div>

                        <div className="shrink-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
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
              <MiscItemsSection miscItems={MiscItems} customerId={customerId} />

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
                {customerId && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
                    <CheckoutActions
                      customerId={customerId}
                      TotalCart={totals}
                    />
                    <div className="flex items-center justify-center gap-1.5">
                      <Shield className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                      <p className="text-[11px] text-muted-foreground/50">
                        Secured checkout
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;
