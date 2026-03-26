import {
  DecrementItem,
  getCart,
  IncrementItem,
  RemoveItem,
} from "@/actions/customer/ProductAndStore/Cart.Action";
import { EmptyCart } from "@/components/customer/products/EmptyCart";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Shield,
  Wallet,
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  Gift,
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
  const [CartItems, UserData] = await Promise.all([
    getCart(customerId),
    getUser(customerId),
  ]);

  const giftWalletBalance = UserData?.giftWalletBalance ?? 0;
  const items = CartItems?.items as ICartItem[] | null;
  const subItems = (CartItems?.subItems as ISubsidyItems[]) ?? [];

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



// console.log("📦 progressTotal:", progressTotal);
// console.log("💰 totalInDollars:", totalInDollars);
// console.log("🔢 Fib bracket — prev:", prev, "| mid:", mid, "| current:", current);
// console.log("📊 avgMarkup:", avgMarkup, "(totalMarkup:", progressTotal.totalMarkup, "/ productCount:", progressTotal.productCount, ")");
// console.log("🎯 activeMarkup:", activeMarkup);
// console.log("🛒 Per-item calculateTotalMarkup breakdown:");
// items.forEach((item) => {
//   const result = calculateTotalMarkup(item);
//   console.log(
//     `  ${item.productId.subsidised ? "🔒 [subsidised]" : "📦"} ${item.productId.name}`,
//     `| qty: ${item.quantity}`,
//     `| price: ${item.productId.price}`,
//     `| originalMarkup: ${item.productId.markup}%`,
//     `| activeMarkup: ${activeMarkup}%`,
//     `| calculateTotalMarkup: ${result ?? "null (skipped)"}`,
//   );
// });
// console.log("💵 totalActiveMarkup (all items):", totalActiveMarkup);
// console.log("💵 Subsidy to be given:", totalActiveMarkup * (60 / 100));


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
    const MarkupSub = totals.subtotal*(active/100);

  const subsidyOnOrder = Math.floor(MarkupSub * 0.60);
  const TotalSubsidy = Number(((subsidyOnOrder + giftWalletBalance) / 100).toFixed(2));

    // console.log("SubTotal Cart : ",totals.subtotal)
    // console.log("Active Markup : ",active)
    // console.log("Total Markup : ",totals.subtotal*(active/100))
    // console.log("Subsidy to be given : ",MarkupSub*0.60)
    // console.log("Active Margin : ",activeMarkup)

  const TaxRows = () => (
    <>
      {showGST && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">GST (5%)</span>
          <span className="font-medium text-gray-900 tabular-nums">CA${fmt(totals.gst)}</span>
        </div>
      )}
      {showPST && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">PST (7%)</span>
          <span className="font-medium text-gray-900 tabular-nums">CA${fmt(totals.pst)}</span>
        </div>
      )}
      {showGST && showPST && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Tax</span>
          <span className="font-medium text-gray-900 tabular-nums">CA${fmt(totals.totalTax)}</span>
        </div>
      )}
    </>
  );

  const DisposableRow = () => (
    <>
      {itemTotals.disposable > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Disposable fee</span>
          <span className="font-medium text-gray-900 tabular-nums">
            CA${fmt(itemTotals.disposable)}
          </span>
        </div>
      )}
      {subsidyTotals.disposable > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1.5">
            Disposable fee
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full leading-none">
              subsidy covered
            </span>
          </span>
          <span className="font-medium text-emerald-600 tabular-nums line-through">
            CA${fmt(subsidyTotals.disposable)}
          </span>
        </div>
      )}
    </>
  );

  // ── Shared wallet cards (used in both mobile + desktop)
const WalletCards = () => (
  <div className="grid grid-cols-2 gap-3">
    {/* Main Wallet */}
    <div className="relative rounded-2xl overflow-hidden border border-gray-100"
      style={{ background: "var(--card)", boxShadow: "0 2px 12px oklch(0.6271 0.1699 149.2138 / 0.08)" }}
    >
      {/* BG orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07]"
        style={{ background: "var(--primary)" }} />

      {/* Vertical accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{ background: "linear-gradient(to bottom, transparent, var(--primary), transparent)" }} />

      <div className="px-4 pt-4 pb-4 pl-5">
        {/* Icon + label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.12)" }}
          >
            <Wallet className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p className="text-[11px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>Main Wallet</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: "var(--muted-foreground)" }}>Available balance</p>
          </div>
        </div>

        {/* Balance */}
        <p className="text-[20px] font-black tabular-nums leading-tight tracking-tight mb-3"
          style={{ color: "var(--foreground)" }}>
          <span className="text-[12px] font-semibold mr-0.5" style={{ color: "var(--muted-foreground)" }}>CA$</span>
          {fmt(UserData?.walletBalance ?? 0)}
        </p>

        <TopUpDialog customerId={customerId} />
      </div>
    </div>

    {/* Gift Wallet */}
    <div className="relative rounded-2xl overflow-hidden border border-gray-100"
      style={{ background: "var(--card)", boxShadow: "0 2px 12px oklch(0.6271 0.1699 149.2138 / 0.08)" }}
    >
      {/* BG orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06]"
        style={{ background: "oklch(0.7858 0.1598 85.3091)" }} />

      {/* Vertical accent bar — amber when empty, primary when has balance */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{
          background: (UserData?.giftWalletBalance ?? 0) > 0
            ? `linear-gradient(to bottom, transparent, var(--primary), transparent)`
            : `linear-gradient(to bottom, transparent, var(--muted-foreground), transparent)`
        }} />

      <div className="px-4 pt-4 pb-4 pl-5">
        {/* Icon + label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: (UserData?.giftWalletBalance ?? 0) > 0
                ? "oklch(0.6271 0.1699 149.2138 / 0.12)"
                : "oklch(0.5252 0.0315 157.3462 / 0.1)"
            }}
          >
            <Gift className="w-3.5 h-3.5"
              style={{ color: (UserData?.giftWalletBalance ?? 0) > 0 ? "var(--primary)" : "var(--muted-foreground)" }} />
          </div>
          <div>
            <p className="text-[11px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>Gift Wallet</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: "var(--muted-foreground)" }}>Subsidies earned</p>
          </div>
        </div>

        {/* Balance */}
        <p className="text-[20px] font-black tabular-nums leading-tight tracking-tight mb-3"
          style={{ color: (UserData?.giftWalletBalance ?? 0) > 0 ? "var(--primary)" : "var(--muted-foreground)" }}>
          <span className="text-[12px] font-semibold mr-0.5" style={{ color: "var(--muted-foreground)" }}>CA$</span>
          {fmt(UserData?.giftWalletBalance ?? 0)}
        </p>

        {/* Status pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: (UserData?.giftWalletBalance ?? 0) > 0
              ? "oklch(0.6271 0.1699 149.2138 / 0.1)"
              : "oklch(0.5252 0.0315 157.3462 / 0.08)",
            border: `1px solid ${(UserData?.giftWalletBalance ?? 0) > 0 ? "oklch(0.6271 0.1699 149.2138 / 0.2)" : "var(--border)"}`,
          }}>
          <div className="w-1.5 h-1.5 rounded-full"
            style={{
              background: (UserData?.giftWalletBalance ?? 0) > 0 ? "var(--primary)" : "var(--muted-foreground)",
              ...(UserData?.giftWalletBalance ?? 0) > 0 ? { animation: "pulse 2s infinite" } : {}
            }} />
          <span className="text-[10px] font-semibold"
            style={{ color: (UserData?.giftWalletBalance ?? 0) > 0 ? "var(--primary)" : "var(--muted-foreground)" }}>
            {(UserData?.giftWalletBalance ?? 0) > 0 ? "Active" : "No subsidies yet"}
          </span>
        </div>
      </div>
    </div>
  </div>
);

return (
  <div className={`min-h-screen ${!customerId ? "" : ""}`}
    style={{ background: !customerId ? "oklch(0.9859 0.0027 158.6587)" : "var(--background)" }}>
    {!customerId && <Navbar />}

    {/* ════════ MOBILE ════════ */}
    <div className="md:hidden px-4 pt-6 pb-52">

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <Link href={customerId ? `/cashier/customer/${customerId}` : "/"}>
          <Button className="rounded-full" variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.1)" }}>
            <ShoppingBag className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-lg font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            {customerId ? "Customer's Cart" : "My Cart"}
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            {items.length + subItems.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5 rounded-2xl px-4 py-3.5 border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <ProgressBarCart total={progressTotal.total} customerId={customerId} giftWalletBalance={giftWalletBalance} totalMarkup={totalActiveMarkup} Totalsubsidy={TotalSubsidy} />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2.5 mb-5">
        {items.map((item: ICartItem) => {
          const { afterMarkup } = calcLine(item);
          const hasImage = item.productId.images?.[0]?.url;
          return (
            <div key={item.productId._id}
              className="rounded-2xl overflow-hidden border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex gap-3 p-3">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
                  style={{ background: "var(--secondary)" }}>
                  {hasImage ? (
                    <Image src={item.productId.images?.[0]?.url ?? ""} alt={item.productId.name} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                        {item.productId.name}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {item.productId.category}
                      </p>
                    </div>
                    <p className="text-sm font-black tabular-nums shrink-0" style={{ color: "var(--primary)" }}>
                      CA${fmt(afterMarkup)}
                    </p>
                  </div>

                  {item.productId.subsidised && (
                    <div className="mt-1.5">
                      <AddtoSubsidyBtn ProductId={item.productId._id.toString()} customerId={customerId} />
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-2.5">
                    <form action={RemoveItem.bind(null, customerId)}>
                      <input type="hidden" name="productId" value={item.productId._id.toString()} />
                      <button type="submit" className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                        style={{ color: "var(--muted-foreground)" }}>
                        <Trash2 size={11} /><span>Remove</span>
                      </button>
                    </form>

                    <div className="flex items-center gap-1.5">
                      <form action={DecrementItem.bind(null, customerId)}>
                        <input type="hidden" name="productId" value={item.productId._id.toString()} />
                        <button type="submit" className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors"
                          style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                          <Minus size={11} strokeWidth={2.5} />
                        </button>
                      </form>
                      <span className="text-sm font-black w-5 text-center tabular-nums" style={{ color: "var(--foreground)" }}>
                        {item.quantity}
                      </span>
                      <form action={IncrementItem.bind(null, customerId)}>
                        <input type="hidden" name="productId" value={item.productId._id.toString()} />
                        <button type="submit" className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                          style={{ background: "var(--primary)" }}>
                          <Plus size={11} strokeWidth={2.5} className="text-white" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SubsidyItemsSection subItems={subItems} customerId={customerId} />

      <div className="mb-4 mt-2">
        <WalletCards />
      </div>

      {/* Bill */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header strip */}
        <div className="px-5 py-3 flex items-center justify-between border-b"
          style={{ borderColor: "var(--border)", background: "oklch(0.6271 0.1699 149.2138 / 0.04)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
            Bill Details
          </p>
          <div className="w-4 h-px" style={{ background: "var(--primary)", opacity: 0.4 }} />
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>CA${fmt(totals.subtotal)}</span>
          </div>
          <TaxRows />
          <DisposableRow />
          <SubsidyCart subsidy={totalActiveMarkup * 0.60} />

          {/* Divider with dots */}
          <div className="flex items-center gap-1 py-1">
            <div className="flex-1 border-t border-dashed" style={{ borderColor: "var(--border)" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
            <div className="flex-1 border-t border-dashed" style={{ borderColor: "var(--border)" }} />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-black tracking-tight" style={{ color: "var(--foreground)" }}>Total</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>CA$</span>
              <span className="text-xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>{fmt(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Fixed CTA */}
    <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t px-4 pt-4 ${customerId ? "pb-22" : "pb-5"}`}
      style={{ background: "oklch(1 0 0 / 0.97)", borderColor: "var(--border)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Total</p>
          <p className="text-2xl font-black tabular-nums tracking-tight" style={{ color: "var(--foreground)" }}>
            CA${fmt(totals.total)}
          </p>
        </div>
        <CheckoutActions customerId={customerId} compact TotalCart={totals} />
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3" style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
        <p className="text-[11px]" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>Secured checkout</p>
      </div>
    </div>

    {/* ════════ DESKTOP ════════ */}
    <div className="hidden md:block max-w-5xl mx-auto px-8 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={customerId ? `/cashier/customer/${customerId}` : "/"}>
          <Button className="rounded-full" variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.1)" }}>
          <ShoppingBag className="w-4 h-4" style={{ color: "var(--primary)" }} />
        </div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
          {customerId ? "Customer's Cart" : "My Cart"}
        </h1>
        <span className="text-sm font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
          {items.length + subItems.length} items
        </span>
      </div>

      {/* Progress */}
      <div className="mb-7 rounded-2xl px-5 py-4 border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <ProgressBarCart total={progressTotal.total} customerId={customerId} giftWalletBalance={giftWalletBalance} totalMarkup={totalActiveMarkup} Totalsubsidy={TotalSubsidy} />
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 flex flex-col gap-4">

          {/* Items card */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {items.length > 0 && (
              <div className="px-6 pt-5 pb-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border)", background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            )}

            {items.map((item: ICartItem, i) => {
              const { afterMarkup } = calcLine(item);
              const hasImage = item.productId.images?.[0]?.url;
              return (
                <div key={item.productId._id}
                  className={`flex items-center gap-5 px-6 py-4 transition-colors hover:bg-[oklch(0.6271_0.1699_149.2138_/_0.02)] ${i !== items.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "var(--border)" }}>

                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
                    style={{ background: "var(--secondary)" }}>
                    {hasImage ? (
                      <Image src={item.productId.images?.[0]?.url ?? ""} alt={item.productId.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate flex items-center gap-2.5" style={{ color: "var(--foreground)" }}>
                      {item.productId.name}
                      {item.productId.subsidised && (
                        <AddtoSubsidyBtn ProductId={item.productId._id.toString()} customerId={customerId} />
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {item.productId.category}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <form action={DecrementItem.bind(null, customerId)}>
                      <input type="hidden" name="productId" value={item.productId._id.toString()} />
                      <button type="submit" className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--secondary)]"
                        style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                        <Minus size={12} strokeWidth={2.5} />
                      </button>
                    </form>
                    <span className="text-sm font-black w-6 text-center tabular-nums" style={{ color: "var(--foreground)" }}>
                      {item.quantity}
                    </span>
                    <form action={IncrementItem.bind(null, customerId)}>
                      <input type="hidden" name="productId" value={item.productId._id.toString()} />
                      <button type="submit" className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ background: "var(--primary)" }}>
                        <Plus size={12} strokeWidth={2.5} className="text-white" />
                      </button>
                    </form>
                  </div>

                  {/* Price */}
                  <div className="w-24 text-right">
                    <p className="text-sm font-black tabular-nums" style={{ color: "var(--primary)" }}>
                      CA${fmt(afterMarkup)}
                    </p>
                  </div>

                  {/* Remove */}
                  <form action={RemoveItem.bind(null, customerId)}>
                    <input type="hidden" name="productId" value={item.productId._id.toString()} />
                    <button type="submit" className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400 ml-1"
                      style={{ color: "var(--muted-foreground)" }} aria-label="Remove item">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>

          <SubsidyItemsSection subItems={subItems} customerId={customerId} />
          <WalletCards />
        </div>

        {/* Order Summary sidebar */}
        <div className="w-72 shrink-0 sticky top-6">
          <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>

            {/* Summary header */}
            <div className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border)", background: "oklch(0.6271 0.1699 149.2138 / 0.04)" }}>
              <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
                Order Summary
              </p>
              <div className="w-6 h-px" style={{ background: "var(--primary)", opacity: 0.5 }} />
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>CA${fmt(totals.subtotal)}</span>
              </div>
              <TaxRows />
              <DisposableRow />
              <SubsidyCart subsidy={subsidyOnOrder} />

              {/* Dashed divider */}
              <div className="flex items-center gap-1 py-1">
                <div className="flex-1 border-t border-dashed" style={{ borderColor: "var(--border)" }} />
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
                <div className="flex-1 border-t border-dashed" style={{ borderColor: "var(--border)" }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-black" style={{ color: "var(--foreground)" }}>Total</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>CA$</span>
                  <span className="text-xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>{fmt(totals.total)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-5">
              <CheckoutActions customerId={customerId} TotalCart={totals} />
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Shield className="w-3 h-3" style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                <p className="text-[11px]" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>Secured checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default CustomerCart;