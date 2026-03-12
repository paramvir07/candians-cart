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

const fmt = (cents: number) => (cents / 100).toFixed(2);

const calcLine = (item: ICartItem) => {
  const base = item.productId.price * item.quantity;
  const markup = Math.round(base * (item.productId.markup / 100));
  const afterMarkup = base + markup;
  const tax = item.productId.tax;

  // Split tax into GST (5%) and PST (7%) components
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

  return {
    base,
    markup,
    afterMarkup,
    gst,
    pst,
    totalTax,
    disposable,
    lineTotal,
  };
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

  // ── Totals
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

  const progressTotal = items.reduce((acc, item) => {
    if (item.productId.subsidised) return acc;
    const { lineTotal } = calcLine(item);
    return acc + lineTotal;
  }, 0);

  const subsidyTotals = subItems.reduce(
    (acc, item) => {
      const afterSubsidy = Math.max(
        item.TotalPrice * item.quantity - item.subsidy,
        0,
      );
      const taxRate = item.productId.tax ?? 0;
      const disposable = (item.productId.disposableFee ?? 0) * item.quantity;

      // Always apply tax and disposable on whatever the effective price is
      const effectiveBase = afterSubsidy > 0 ? afterSubsidy : 0;

      let gst = 0;
      let pst = 0;
      if (taxRate === 0.05) gst = Math.round(effectiveBase * 0.05);
      else if (taxRate === 0.07) pst = Math.round(effectiveBase * 0.07);
      else if (taxRate === 0.12) {
        gst = Math.round(effectiveBase * 0.05);
        pst = Math.round(effectiveBase * 0.07);
      }

      const totalTax = gst + pst;
      const lineTotal = effectiveBase + totalTax + disposable;

      acc.subtotal += effectiveBase;
      acc.gst += gst;
      acc.pst += pst;
      acc.totalTax += totalTax;
      acc.disposable += disposable;
      acc.total += lineTotal;

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

  const showDisposable = totals.disposable > 0;
  const showGST = totals.gst > 0;
  const showPST = totals.pst > 0;

  // ── Tax rows shared between mobile + desktop
  const TaxRows = () => (
    <>
      {showGST && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">GST (5%)</span>
          <span className="font-medium text-gray-900 tabular-nums">
            CA${fmt(totals.gst)}
          </span>
        </div>
      )}
      {showPST && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">PST (7%)</span>
          <span className="font-medium text-gray-900 tabular-nums">
            CA${fmt(totals.pst)}
          </span>
        </div>
      )}
      {showGST && showPST && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Tax</span>
          <span className="font-medium text-gray-900 tabular-nums">
            CA${fmt(totals.totalTax)}
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className={`min-h-screen ${!customerId ? "bg-[#F7F6F3]" : ""} `}>
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
          <ProgressBarCart
            total={progressTotal}
            customerId={customerId}
            giftWalletBalance={giftWalletBalance}
          />
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {items.map((item: ICartItem) => {
            const { afterMarkup } = calcLine(item);
            const hasImage = item.productId.images?.[0]?.url;
            return (
              <div
                key={item.productId._id}
                className="bg-white rounded-2xl p-4 flex gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100"
              >
                <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                  {hasImage ? (
                    <Image
                      src={item.productId.images?.[0]?.url ?? ""}
                      alt={item.productId.name}
                      width={72}
                      height={72}
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
                  <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-3">
                    {item.productId.name}
                    {item.productId.subsidised && (
                      <AddtoSubsidyBtn
                        ProductId={item.productId._id.toString()}
                        customerId={customerId}
                      />
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.productId.category}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1.5 tabular-nums">
                    CA${fmt(afterMarkup)}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    <form action={RemoveItem.bind(null, customerId)}>
                      <input
                        type="hidden"
                        name="productId"
                        value={item.productId._id.toString()}
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </form>

                    <div className="flex items-center gap-2">
                      <form action={DecrementItem.bind(null, customerId)}>
                        <input
                          type="hidden"
                          name="productId"
                          value={item.productId._id.toString()}
                        />
                        <button
                          type="submit"
                          className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} strokeWidth={2} />
                        </button>
                      </form>
                      <span className="text-sm font-semibold text-gray-900 w-5 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <form action={IncrementItem.bind(null, customerId)}>
                        <input
                          type="hidden"
                          name="productId"
                          value={item.productId._id.toString()}
                        />
                        <button
                          type="submit"
                          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <Plus
                            size={12}
                            strokeWidth={2}
                            className="text-white"
                          />
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
        {/* Wallet */}
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.05)] mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {customerId ? "Pay with Wallet" : "Wallet"}
              </p>
              <p className="text-xs text-gray-400">
                Balance: CA${fmt(UserData?.walletBalance ?? 0)}
              </p>
            </div>
          </div>
          <div>
            <TopUpDialog component="checkout" customerId={customerId} />
          </div>
        </div>

        {/* Bill */}
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Bill Details
          </p>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900 tabular-nums">
                CA${fmt(totals.subtotal)}
              </span>
            </div>
            <TaxRows />

            {showDisposable && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Disposable fee</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  CA${fmt(totals.disposable)}
                </span>
              </div>
            )}
            <SubsidyCart />
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 tabular-nums">
                CA${fmt(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 pt-4 ${customerId ? "pb-22" : "pb-5"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">
              CA${fmt(totals.total)}
            </p>
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
          <span className="text-gray-400 font-normal text-lg">
            ({items.length + subItems.length})
          </span>
        </div>

        <div className="mb-6">
          <ProgressBarCart
            total={progressTotal}
            customerId={customerId}
            giftWalletBalance={giftWalletBalance}
          />
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
                  <div
                    key={item.productId._id}
                    className={`flex items-center gap-5 px-6 py-4 ${i !== items.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      {hasImage ? (
                        <Image
                          src={item.productId.images?.[0]?.url ?? ""}
                          alt={item.productId.name}
                          width={72}
                          height={72}
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
                      <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-3">
                        {item.productId.name}
                        {item.productId.subsidised && (
                          <AddtoSubsidyBtn
                            ProductId={item.productId._id.toString()}
                            customerId={customerId}
                          />
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.productId.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <form action={DecrementItem.bind(null, customerId)}>
                        <input
                          type="hidden"
                          name="productId"
                          value={item.productId._id.toString()}
                        />
                        <button
                          type="submit"
                          className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={13} strokeWidth={2} />
                        </button>
                      </form>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <form action={IncrementItem.bind(null, customerId)}>
                        <input
                          type="hidden"
                          name="productId"
                          value={item.productId._id.toString()}
                        />
                        <button
                          type="submit"
                          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <Plus
                            size={13}
                            strokeWidth={2}
                            className="text-white"
                          />
                        </button>
                      </form>
                    </div>

                    <p className="text-sm font-bold text-gray-900 w-24 text-right tabular-nums">
                      CA${fmt(afterMarkup)}
                    </p>

                    <form action={RemoveItem.bind(null, customerId)}>
                      <input
                        type="hidden"
                        name="productId"
                        value={item.productId._id.toString()}
                      />
                      <button
                        type="submit"
                        className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>

            <SubsidyItemsSection subItems={subItems} customerId={customerId} />

            {/* Wallet */}

            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {customerId ? "Pay with Wallet" : "Wallet"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Current balance: CA${fmt(UserData?.walletBalance ?? 0)}
                  </p>
                </div>
              </div>
              <div>
                <TopUpDialog component="checkout" customerId={customerId} />
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-72 shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Order Summary
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    CA${fmt(totals.subtotal)}
                  </span>
                </div>
                <TaxRows />

                {showDisposable && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Disposable fee</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      CA${fmt(totals.disposable)}
                    </span>
                  </div>
                )}
                <SubsidyCart />
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    CA${fmt(totals.total)}
                  </span>
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
