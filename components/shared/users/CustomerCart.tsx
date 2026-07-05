import { getCart } from "@/actions/customer/ProductAndStore/Cart.Action";
import { EmptyCart } from "@/components/customer/products/EmptyCart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Shield,
  Wallet,
  Gift,
  Package,
  Receipt,
  CreditCard,
  Plus,
} from "lucide-react";
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
import { getFibBracketFrom21 } from "@/lib/FibBracket";
import { cn } from "@/lib/utils";
import { MiscItemsSection } from "@/components/cashier/MiscItemSection";
import { UPCScannerCart } from "@/components/cashier/UPCScannerCart";
import ClearCartDialog from "./ClearCartDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollableItemsList } from "@/components/customer/products/ScrollableItemsList";
import { CartItemRow } from "./CartItemRow";
import CartReloadListener from "@/actions/pusher/pusherCartClient";

const fmt = (cents: number) => (cents / 100).toFixed(2);

const calcLine = (item: ICartItem | ISubsidyItems) => {
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

const PINNED_LAST_IDS = ["6a2f51207f6cc4d79650b794", "6a2f51897f6cc4d79650b796"];

const CustomerCart = async ({ customerId }: { customerId?: string }) => {
  const isCashier = !!customerId;

  const [CartItems, UserData] = await Promise.all([
    getCart(customerId),
    getUser(customerId),
  ]);

  const giftWalletBalance = UserData?.giftWalletBalance ?? 0;
  const UserStoreId = UserData?.associatedStoreId?.toString() ?? "";
  const rawItems = (CartItems?.items as ICartItem[] | null) ?? [];

  const nonSubsidisedRest: ICartItem[] = [];
  const nonSubsidisedPinned: ICartItem[] = [];
  const subsidised: ICartItem[] = [];

  for (let i = rawItems.length - 1; i >= 0; i--) {
    const item = rawItems[i];
    if (item.productId.subsidised) {
      subsidised.push(item);
    } else if (PINNED_LAST_IDS.includes(item.productId._id?.toString())) {
      nonSubsidisedPinned.push(item);
    } else {
      nonSubsidisedRest.push(item);
    }
  }

  const items = [
    ...nonSubsidisedRest,
    ...nonSubsidisedPinned,
    ...subsidised,
  ];

  const subItems = (CartItems?.subItems as ISubsidyItems[]) ?? [];
  const MiscItems = (CartItems?.miscItems as IMiscCartItem[]) ?? [];
  const subItemProductIds = subItems.map((s) => s.productId._id.toString());

  if (
    !items ||
    (items.length === 0 && subItems.length === 0 && MiscItems.length === 0)
  )
    return (
      <>
        <CartReloadListener />
        {customerId && (
          <div className="w-full flex items-center gap-2 px-4 xl:px-8 pt-5 xl:pt-8">
            <div className="flex-1">
              <UPCScannerCart customerId={customerId} storeId={UserStoreId} />
            </div>
            <Link href={`/cashier/customer/${customerId}/new-product`}>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        )}
        <EmptyCart customerId={customerId} />
      </>
    );

  // Compute calcLine ONCE per item, reuse everywhere (reduce + both renders).
  const itemCalcs = items.map((item) => ({ item, calc: calcLine(item) }));

  const itemTotals = itemCalcs.reduce(
    (acc, { calc }) => {
      acc.subtotal += calc.afterMarkup;
      acc.gst += calc.gst;
      acc.pst += calc.pst;
      acc.totalTax += calc.totalTax;
      acc.disposable += calc.disposable;
      acc.total += calc.lineTotal;
      acc.totalMarkup += calc.markup;
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

  let nonSubsidisedMarkup = 0;
  const progressTotal = { total: 0, totalMarkup: 0, productCount: 0 };

  for (const { item, calc } of itemCalcs) {
    if (item.productId.subsidised) continue;
    nonSubsidisedMarkup += calc.markup;
    progressTotal.total += calc.afterMarkup;
    progressTotal.totalMarkup += calc.markupPercentage;
    progressTotal.productCount += 1;
  }

  let newSubisdyCalc = 0;

  const totalInDollars = progressTotal.total / 100;
  const { prev, current, mid } = getFibBracketFrom21(totalInDollars);
  const avgMarkup = progressTotal.totalMarkup / progressTotal.productCount;

  const UserSubsidyPercentage = (UserData?.subsidy ?? 55) / 100;

  if (prev >= 21) {
    newSubisdyCalc = nonSubsidisedMarkup * UserSubsidyPercentage;
  }
  const activeMarkup = (() => {
    if (prev >= 21 && totalInDollars >= prev && totalInDollars < mid!)
      return avgMarkup;
    else if (mid && totalInDollars >= mid && totalInDollars <= current)
      return avgMarkup;
    return null;
  })();

  let totalActiveMarkup = 0;
  if (activeMarkup !== null) {
    for (const { item } of itemCalcs) {
      if (item.productId.subsidised) continue;
      totalActiveMarkup += Math.round(
        item.productId.price * item.quantity * (activeMarkup / 100),
      );
    }
  }

  const subsidyTotals = subItems.reduce(
    (acc, item) => {
      const { markup } = calcLine(item);
      const disposableFee = (item.productId.disposableFee ?? 0) * item.quantity;
      const fullPriceWithDisposable = item.TotalPrice * item.quantity;
      const priceForTax = fullPriceWithDisposable - disposableFee;

      const afterSubsidy = Math.max(fullPriceWithDisposable - item.subsidy, 0);
      const taxRate = item.productId.tax ?? 0;
      let gst = 0,
        pst = 0;
      if (taxRate === 0.05) gst = Math.round(priceForTax * 0.05);
      else if (taxRate === 0.07) pst = Math.round(priceForTax * 0.07);
      else if (taxRate === 0.12) {
        gst = Math.round(priceForTax * 0.05);
        pst = Math.round(priceForTax * 0.07);
      }
      const totalTax = gst + pst;
      acc.disposable += (item.productId.disposableFee ?? 0) * item.quantity;
      acc.subtotal += afterSubsidy;
      acc.gst += gst;
      acc.pst += pst;
      acc.totalTax += totalTax;
      acc.total += afterSubsidy + totalTax;
      acc.totalMarkup += markup;
      return acc;
    },
    { subtotal: 0, gst: 0, pst: 0, totalTax: 0, disposable: 0, total: 0, totalMarkup: 0 },
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

  const PlatformFee = 50;

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
      itemTotals.total + subsidyTotals.total + miscTotals.total + PlatformFee,
    ),
    totalMarkup: itemTotals.totalMarkup + subsidyTotals.totalMarkup,
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
  void MarkupSub; // retained from original calc chain (subsidyOnOrder was computed but unused downstream)

  const TotalSubsidy = Number(
    ((newSubisdyCalc + giftWalletBalance) / 100).toFixed(2),
  );

  const isCovered =
    newSubisdyCalc + (UserData?.giftWalletBalance ?? 0) >=
    subsidyTotals.disposable;

  // ── Sub-components ──────────────────────────────────────────────

  const TaxRows = () => (
    <>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Platform Fee</span>
        <span className="font-medium tabular-nums">CA${fmt(PlatformFee)}</span>
      </div>
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
            {isCovered && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
              >
                covered
              </Badge>
            )}
          </span>
          <span
            className={`font-medium tabular-nums text-emerald-600 ${isCovered && "line-through"}`}
          >
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
      <CartReloadListener />
      {customerId && (
        <div className="w-full flex items-center gap-2 px-4 xl:px-8 pt-5 xl:pt-8">
          <div className="flex-1">
            <UPCScannerCart customerId={customerId} storeId={UserStoreId} />
          </div>
          <Link href={`/cashier/customer/${customerId}/new-product`}>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      )}
      {/* ── MOBILE / TABLET LAYOUT ── */}
      <div
        className="xl:hidden flex flex-col"
        style={{ minHeight: "calc(100dvh - 0px)" }}
      >
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-4">
          <div className="border-border/60 shadow-none">
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
            <div className="flex justify-end mt-2 p-2">
              <ClearCartDialog customerId={customerId} />
            </div>
          </div>

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

            <ScrollableItemsList
              maxHeight="460px"
              className="rounded-xl space-y-2 pr-3"
            >
              {itemCalcs.map(({ item, calc }) => (
                <CartItemRow
                  key={item.productId._id.toString()}
                  item={item}
                  afterMarkup={calc.afterMarkup}
                  customerId={customerId}
                  variant="mobile"
                />
              ))}
            </ScrollableItemsList>
          </section>

          <SubsidyItemsSection subItems={subItems} customerId={customerId} />
          <MiscItemsSection miscItems={MiscItems} customerId={customerId} />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Wallets
              </span>
            </div>
            <WalletSection />
          </section>

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

      {/* ── DESKTOP LAYOUT (≥ xl / ≥ 1280px) ── */}
      <div className="hidden xl:block">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
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
              <div className="flex justify-end mt-2">
                <ClearCartDialog customerId={customerId} />
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0 space-y-5">
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

                <ScrollableItemsList
                  maxHeight="420px"
                  className="divide-y divide-border/50"
                >
                  {itemCalcs.map(({ item, calc }) => (
                    <CartItemRow
                      key={item.productId._id.toString()}
                      item={item}
                      afterMarkup={calc.afterMarkup}
                      customerId={customerId}
                      variant="desktop"
                    />
                  ))}
                </ScrollableItemsList>
              </Card>

              <SubsidyItemsSection subItems={subItems} customerId={customerId} />
              <MiscItemsSection miscItems={MiscItems} customerId={customerId} />

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
                    <CheckoutActions customerId={customerId} TotalCart={totals} />
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