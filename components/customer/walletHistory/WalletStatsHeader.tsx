import { formatCurrency } from "@/lib/walletHistory";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";
import { Wallet, TrendingUp } from "lucide-react";

interface WalletStatsHeaderProps {
  transactions: UnifiedTransaction[];
}

export function WalletStatsHeader({ transactions }: WalletStatsHeaderProps) {
  const totalBalance = transactions.reduce((sum, t) => {
    if (t.status === "paid" || t.status === "completed") return sum + t.amount;
    return sum;
  }, 0);

  const thisMonth = transactions.filter((t) => {
    const now = new Date();
    const d = new Date(t.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const thisMonthTotal = thisMonth.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={15} className="opacity-80" />
            <span className="text-xs font-medium opacity-80">
              Total Topped Up
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {formatCurrency(totalBalance, "cad")}
          </p>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-2 text-right">
          <p className="text-[10px] opacity-75 mb-0.5">This month</p>
          <p className="text-sm font-semibold">
            {formatCurrency(thisMonthTotal, "cad")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <TrendingUp size={12} className="opacity-70" />
        <span className="text-xs opacity-70">
          {transactions.length} total transaction
          {transactions.length !== 1 ? "s" : ""} • {thisMonth.length} this month
        </span>
      </div>
    </div>
  );
}
