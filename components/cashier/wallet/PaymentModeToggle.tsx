type PaymentMode = "cash" | "card" | "gift";
interface PaymentModeToggleProps {
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;
}

export function PaymentModeToggle({
  paymentMode,
  setPaymentMode,
}: PaymentModeToggleProps) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2.5">
        Payment Method
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPaymentMode("card")}
          className="rounded-xl py-2.5 text-sm transition-all active:scale-95"
          style={{
            background:
              paymentMode === "card"
                ? "var(--color-primary)"
                : "var(--color-secondary)",
            color:
              paymentMode === "card"
                ? "var(--color-primary-foreground)"
                : "var(--color-secondary-foreground)",
            fontWeight: paymentMode === "card" ? 700 : 500,
            transform: paymentMode === "card" ? "scale(1.04)" : "scale(1)",
            boxShadow:
              paymentMode === "card" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
          }}
        >
          Credit / Debit
        </button>

        <button
          onClick={() => setPaymentMode("cash")}
          className="rounded-xl py-2.5 text-sm transition-all active:scale-95"
          style={{
            background:
              paymentMode === "cash"
                ? "var(--color-primary)"
                : "var(--color-secondary)",
            color:
              paymentMode === "cash"
                ? "var(--color-primary-foreground)"
                : "var(--color-secondary-foreground)",
            fontWeight: paymentMode === "cash" ? 700 : 500,
            transform: paymentMode === "cash" ? "scale(1.04)" : "scale(1)",
            boxShadow:
              paymentMode === "cash" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
          }}
        >
          Cash
        </button>

        <button
          onClick={() => setPaymentMode("gift")}
          className="rounded-xl py-2.5 text-sm transition-all active:scale-95"
          style={{
            background:
              paymentMode === "gift"
                ? "var(--color-primary)"
                : "var(--color-secondary)",
            color:
              paymentMode === "gift"
                ? "var(--color-primary-foreground)"
                : "var(--color-secondary-foreground)",
            fontWeight: paymentMode === "gift" ? 700 : 500,
            transform: paymentMode === "gift" ? "scale(1.04)" : "scale(1)",
            boxShadow:
              paymentMode === "gift" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
          }}
        >
          Gift
        </button>
      </div>
    </div>
  );
}
