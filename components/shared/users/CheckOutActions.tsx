"use client";
import PlaceOrderBtn from "@/components/customer/products/PlaceOrderBtn";

export interface CartTotals {
  subtotal: number;
  gst: number;
  pst: number;
  totalTax: number;
  disposable: number;
  total: number;
}

export default function CheckoutActions({
  TotalCart,
  customerId,
  compact,
}: {
  TotalCart: CartTotals;
  customerId?: string;
  compact?: boolean;
}) {
  const isCashier = customerId;
  const paymentMode = isCashier ? "wallet" : "pending";

  return (
    <div className="space-y-3">

      <PlaceOrderBtn
        TotalCart={TotalCart}
        customerId={customerId}
        compact={compact}
        paymentMode={paymentMode}
      />
    </div>
  );
}
