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
  const subsidyOnOrder = totalActiveMarkup * 0.60;
  const TotalSubsidy = Number(((subsidyOnOrder + giftWalletBalance) / 100).toFixed(2));

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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_2px_6px_rgba(16,185,129,0.3)] shrink-0">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800 leading-tight">Main Wallet</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Available</p>
            </div>
          </div>
          <p className="text-[18px] font-extrabold text-gray-900 tabular-nums leading-tight">
            CA${fmt(UserData?.walletBalance ?? 0)}
          </p>
          <div className="mt-2.5">
            <TopUpDialog customerId={customerId} />
          </div>
        </div>
      </div>

      {/* Gift Wallet */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_2px_6px_rgba(251,191,36,0.3)] shrink-0">
              <Gift className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800 leading-tight">Gift Wallet</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Subsidies</p>
            </div>
          </div>
          <p className={`text-[18px] font-extrabold tabular-nums leading-tight ${
            (UserData?.giftWalletBalance ?? 0) > 0 ? "text-emerald-600" : "text-gray-400"
          }`}>
            CA${fmt(UserData?.giftWalletBalance ?? 0)}
          </p>
          {/* spacer to match height of TopUpDialog button */}
          <div className="mt-2.5 h-9" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${!customerId ? "bg-[#F7F6F3]" : ""}`}>
      {!customerId && <Navbar />}

      {/* ════════════════════════════════════════
          MOBILE
      ════════════════════════════════════════ */}
      <div className="md:hidden px-4 pt-6 pb-52">
        <div className="flex items-center gap-2 mb-3">
          <Link href={customerId ? `/cashier/customer/${customerId}` : "/"}>
            <Button className="rounded-full" variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <ShoppingBag className="w-5 h-5 text-gray-800" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {customerId ? "Customer's cart" : "My Cart"}
          </h1>
          <span className="text-sm text-gray-400 font-normal">
            ({items.length + subItems.length})
          </span>
        </div>

        <div className="mb-4">
          <ProgressBarCart total={progressTotal.total} customerId={customerId} giftWalletBalance={giftWalletBalance} totalMarkup={totalActiveMarkup} Totalsubsidy={TotalSubsidy} />
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {items.map((item: ICartItem) => {
            const { afterMarkup } = calcLine(item);
            const hasImage = item.productId.images?.[0]?.url;
            return (
              <div key={item.productId._id} className="bg-white rounded-2xl p-4 flex gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
                <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                  {hasImage ? (
                    <Image src={item.productId.images?.[0]?.url ?? ""} alt={item.productId.name} width={72} height={72} className="w-full h-full object-cover" />
                  ) : (
                    <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-3">
                    {item.productId.name}
                    {item.productId.subsidised && (
                      <AddtoSubsidyBtn ProductId={item.productId._id.toString()} customerId={customerId} />
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.productId.category}</p>
                  <p className="text-sm font-bold text-gray-900 mt-1.5 tabular-nums">CA${fmt(afterMarkup)}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <form action={RemoveItem.bind(null, customerId)}>
                      <input type="hidden" name="productId" value={item.productId._id.toString()} />
                      <button type="submit" className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={12} /><span>Remove</span>
                      </button>
                    </form>
                    <div className="flex items-center gap-2">
                      <form action={DecrementItem.bind(null, customerId)}>
                        <input type="hidden" name="productId" value={item.productId._id.toString()} />
                        <button type="submit" className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Minus size={12} strokeWidth={2} />
                        </button>
                      </form>
                      <span className="text-sm font-semibold text-gray-900 w-5 text-center tabular-nums">{item.quantity}</span>
                      <form action={IncrementItem.bind(null, customerId)}>
                        <input type="hidden" name="productId" value={item.productId._id.toString()} />
                        <button type="submit" className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Plus size={12} strokeWidth={2} className="text-white" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SubsidyItemsSection subItems={subItems} customerId={customerId} />

        {/* Wallet Cards — side by side on mobile too */}
        <div className="mb-3">
          <WalletCards />
        </div>

        {/* Bill */}
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Bill Details</p>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900 tabular-nums">CA${fmt(totals.subtotal)}</span>
            </div>
            <TaxRows />
            <DisposableRow />
            <SubsidyCart subsidy={totalActiveMarkup * 0.60} />
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 tabular-nums">CA${fmt(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 pt-4 ${customerId ? "pb-22" : "pb-5"}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">CA${fmt(totals.total)}</p>
          </div>
          <CheckoutActions customerId={customerId} compact TotalCart={totals} />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-gray-300" />
          <p className="text-[11px] text-gray-400">Secured checkout</p>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP
      ════════════════════════════════════════ */}
      <div className="hidden md:block max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Link href={customerId ? `/cashier/customer/${customerId}` : "/"}>
            <Button className="rounded-full" variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <ShoppingBag className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {customerId ? "Customer's cart" : "My Cart"}
          </h1>
          <span className="text-gray-400 font-normal text-lg">({items.length + subItems.length})</span>
        </div>

        <div className="mb-6">
          <ProgressBarCart total={progressTotal.total} customerId={customerId} giftWalletBalance={giftWalletBalance} totalMarkup={totalActiveMarkup} Totalsubsidy={TotalSubsidy} />
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-1 flex flex-col gap-4">
            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              {items.length > 0 && (
                <div className="px-6 pt-5 pb-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              )}
              {items.map((item: ICartItem, i) => {
                const { afterMarkup } = calcLine(item);
                const hasImage = item.productId.images?.[0]?.url;
                return (
                  <div key={item.productId._id} className={`flex items-center gap-5 px-6 py-4 ${i !== items.length - 1 ? "border-b border-gray-50" : ""}`}>
                    <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      {hasImage ? (
                        <Image src={item.productId.images?.[0]?.url ?? ""} alt={item.productId.name} width={72} height={72} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-3">
                        {item.productId.name}
                        {item.productId.subsidised && (
                          <AddtoSubsidyBtn ProductId={item.productId._id.toString()} customerId={customerId} />
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.productId.category}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <form action={DecrementItem.bind(null, customerId)}>
                        <input type="hidden" name="productId" value={item.productId._id.toString()} />
                        <button type="submit" className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Minus size={13} strokeWidth={2} />
                        </button>
                      </form>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-center tabular-nums">{item.quantity}</span>
                      <form action={IncrementItem.bind(null, customerId)}>
                        <input type="hidden" name="productId" value={item.productId._id.toString()} />
                        <button type="submit" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Plus size={13} strokeWidth={2} className="text-white" />
                        </button>
                      </form>
                    </div>
                    <p className="text-sm font-bold text-gray-900 w-24 text-right tabular-nums">CA${fmt(afterMarkup)}</p>
                    <form action={RemoveItem.bind(null, customerId)}>
                      <input type="hidden" name="productId" value={item.productId._id.toString()} />
                      <button type="submit" className="text-gray-300 hover:text-red-400 transition-colors ml-1" aria-label="Remove item">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>

            <SubsidyItemsSection subItems={subItems} customerId={customerId} />

            {/* Wallet Cards — side by side */}
            <WalletCards />
          </div>

          {/* Order Summary */}
          <div className="w-72 shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Order Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900 tabular-nums">CA${fmt(totals.subtotal)}</span>
                </div>
                <TaxRows />
                <DisposableRow />
                <SubsidyCart subsidy={totalActiveMarkup * 0.60} />
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 tabular-nums">CA${fmt(totals.total)}</span>
                </div>
              </div>
              <CheckoutActions customerId={customerId} TotalCart={totals} />
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Shield className="w-3 h-3 text-gray-300" />
                <p className="text-xs text-gray-400">Secured checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;