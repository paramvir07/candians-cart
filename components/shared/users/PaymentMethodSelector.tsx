"use client";

import { PaymentMode } from "@/types/customer/OrdersClient";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, Wallet } from "lucide-react";

type Props = {
  value: PaymentMode;
  onChange: (method: PaymentMode) => void;
  /** Pass the formatted total string e.g. "CA$112.81" so the component can render it inline */
  total?: string;
};

const PAYMENT_OPTIONS = [
  { mode: PaymentMode.CASH,   label: "Cash",   icon: Banknote   },
  { mode: PaymentMode.CARD,   label: "Card",   icon: CreditCard },
  { mode: PaymentMode.WALLET, label: "Wallet", icon: Wallet     },
] as const;

export default function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <div className="w-full space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        Payment Method
      </p>

      {/* Equal 3-col grid — never squishes, never clips */}
      <div className="grid grid-cols-3 gap-1.5">
        {PAYMENT_OPTIONS.map(({ mode, label, icon: Icon }) => {
          const isActive = value === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(mode)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-muted text-muted-foreground hover:border-primary/20 hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="text-[11px] font-semibold leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}