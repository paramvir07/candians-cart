import { formatCurrency } from "@/lib/walletHistory";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";
import { Wallet, TrendingUp, ArrowUpRight, Gift } from "lucide-react";

interface WalletStatsHeaderProps {
  transactions: UnifiedTransaction[];
}

export function WalletStatsHeader({ transactions }: WalletStatsHeaderProps) {
  const completed = transactions.filter(
    (t) => t.status === "paid" || t.status === "completed",
  );

  // Total includes gifts
  const totalBalance = completed.reduce((sum, t) => sum + t.amount, 0);

  // Gifts
  const giftTransactions = completed.filter((t) => t.paymentMode === "gift");
  const giftTotal = giftTransactions.reduce((sum, t) => sum + t.amount, 0);

  // This month — includes gifts
  const now = new Date();
  const thisMonth = completed.filter((t) => {
    const d = new Date(t.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const thisMonthTotal = thisMonth.reduce((sum, t) => sum + t.amount, 0);

  const lastMonth = completed.filter((t) => {
    const d = new Date(t.createdAt);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
    );
  });
  const lastMonthTotal = lastMonth.reduce((sum, t) => sum + t.amount, 0);
  const growth =
    lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : null;

  // Online / in-store counts (gifts excluded from this split)
  const onlineCount = completed.filter(
    (t) => t.paymentMode === "online",
  ).length;
  const inStoreCount = completed.filter(
    (t) => t.paymentMode === "cash" || t.paymentMode === "card",
  ).length;

  return (
    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-5 text-primary-foreground">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet size={13} className="opacity-75" />
            <span className="text-xs font-medium opacity-75">
              Total Added to Wallet
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            {formatCurrency(totalBalance, "cad")}
          </p>
          {/* Gift sub-label */}
          {giftTotal > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Gift size={10} className="opacity-60" />
              <span className="text-xs opacity-60">
                incl. {formatCurrency(giftTotal, "cad")} in gifts
              </span>
            </div>
          )}
        </div>

        {/* This month box */}
        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-right shrink-0">
          <p className="text-[10px] opacity-70 mb-0.5">This month</p>
          <p className="text-sm sm:text-base font-semibold">
            {formatCurrency(thisMonthTotal, "cad")}
          </p>
          {growth !== null && (
            <div className="flex items-center justify-end gap-0.5 mt-0.5">
              <ArrowUpRight
                size={9}
                className={growth >= 0 ? "opacity-80" : "opacity-80 rotate-180"}
              />
              <span className="text-[9px] opacity-75">
                {Math.abs(growth)}% vs last mo.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={11} className="opacity-60" />
          <span className="text-xs opacity-70">
            {transactions.length} total · {thisMonth.length} this month
          </span>
        </div>
        <div className="h-3 w-px bg-white/20 hidden sm:block" />
        <span className="text-xs opacity-70 hidden sm:block">
          {onlineCount} online · {inStoreCount} in-store
          {giftTransactions.length > 0 &&
            ` · ${giftTransactions.length} gift${giftTransactions.length !== 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
}
