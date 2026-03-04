"use client";

import { PaymentMode } from "@/types/customer/OrdersClient";

type Props = {
  value: PaymentMode;
  onChange: (method: PaymentMode) => void;
  compact?: boolean;
};

export default function PaymentMethodSelector({
  value,
  onChange,
  compact,
}: Props) {
  const btn =
    "flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition";

  const active = "bg-primary text-white border-primary";
  const inactive = "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";

  return (
    <div className="w-full pt-3">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Payment Method
      </p>

      <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-100">
        <button
          type="button"
          className={`${btn} ${
            value === PaymentMode.CASH ? active : inactive
          }`}
          onClick={() => onChange(PaymentMode.CASH)}
        >
          Cash
        </button>

        <button
          type="button"
          className={`${btn} ${
            value === PaymentMode.CARD ? active : inactive
          }`}
          onClick={() => onChange(PaymentMode.CARD)}
        >
          Debit / Credit
        </button>

        <button
          type="button"
          className={`${btn} ${
            value === PaymentMode.WALLET ? active : inactive
          }`}
          onClick={() => onChange(PaymentMode.WALLET)}
        >
          Wallet
        </button>
      </div>
    </div>
  );
}
