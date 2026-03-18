import {
  IStripeTopUp,
  IWalletTopUp,
  UnifiedTransaction,
} from "@/types/customer/WalletHistory";

export function formatCurrency(
  amountInCents: number,
  currency = "cad",
): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

export function formatFullDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

// ─── Label helpers per paymentMode ─────────────────────────────────────────────

function cashierLabel(paymentMode: "cash" | "card" | "gift"): {
  label: string;
  sublabel: string;
} {
  switch (paymentMode) {
    case "gift":
      return {
        label: "Gift Top-Up",
        sublabel: "Special Bonus Recieved 🎉",
      };
    case "cash":
      return {
        label: "In-Store Top Up",
        sublabel: "Paid with cash at counter",
      };
    case "card":
      return {
        label: "In-Store Top Up",
        sublabel: "Paid by card at counter",
      };
  }
}

// ─── Unify ─────────────────────────────────────────────────────────────────────

export function unifyTransactions(
  stripeTopUps: IStripeTopUp[],
  cashierTopUps: IWalletTopUp[],
): UnifiedTransaction[] {
  const stripe: UnifiedTransaction[] = stripeTopUps.map((t) => ({
    id: t._id,
    type: "stripe",
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    paymentMode: "online",
    createdAt: t.createdAt,
    label: "Online Top Up",
    sublabel: "Secure online payment",
    referenceId: t.checkoutSessionId,
  }));

  const cashier: UnifiedTransaction[] = cashierTopUps.map((t) => {
    const { label, sublabel } = cashierLabel(t.paymentMode);
    return {
      id: t._id,
      type: "cashier",
      amount: t.value,
      currency: "cad",
      status: "completed",
      paymentMode: t.paymentMode,
      createdAt: t.createdAt,
      label,
      sublabel,
      referenceId: t._id,
    };
  });

  return [...stripe, ...cashier].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export function getAnalytics(transactions: UnifiedTransaction[]) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const online = transactions
    .filter((t) => t.type === "stripe")
    .reduce((sum, t) => sum + t.amount, 0);
  const inStore = transactions
    .filter((t) => t.type === "cashier" && t.paymentMode !== "gift")
    .reduce((sum, t) => sum + t.amount, 0);
  const giftTransactions = transactions.filter((t) => t.paymentMode === "gift");
  const gift = giftTransactions.reduce((sum, t) => sum + t.amount, 0);
  const giftCount = giftTransactions.length;

  const onlinePct = total > 0 ? Math.round((online / total) * 100) : 0;
  const inStorePct = total > 0 ? Math.round((inStore / total) * 100) : 0;
  const giftPct = total > 0 ? 100 - onlinePct - inStorePct : 0;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleString("en-CA", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      amount: 0,
    };
  });

  transactions.forEach((t) => {
    const d = new Date(t.createdAt);
    const m = months.find(
      (mo) => mo.month === d.getMonth() && mo.year === d.getFullYear(),
    );
    if (m) m.amount += t.amount;
  });

  return {
    total,
    online,
    inStore,
    gifts: gift,
    giftCount,
    onlinePct,
    inStorePct,
    giftPct,
    months,
  };
}
