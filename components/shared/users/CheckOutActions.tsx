// /components/customer/checkout/CheckoutActions.tsx
"use client";

import { useState } from "react";
import PlaceOrderBtn from "@/components/customer/products/PlaceOrderBtn";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { PaymentMode } from "@/types/customer/OrdersClient";

export default function CheckoutActions({
  customerId,
  compact,
}: {
  customerId?: string;
  compact?: boolean;
}) {
  const isCashier = customerId;

  // cashier can choose; customer uses default (wallet here — change if you want)
  const [method, setMethod] = useState<PaymentMode>(PaymentMode.CARD);

  const paymentMode = isCashier ? method : PaymentMode.WALLET;

  return (
    <div className="space-y-3">
      {isCashier && (
        <PaymentMethodSelector
          value={method}
          onChange={setMethod}
          compact={compact}
        />
      )}

      <PlaceOrderBtn
        customerId={customerId}
        compact={compact}
        paymentMode={paymentMode}
      />
    </div>
  );
}
