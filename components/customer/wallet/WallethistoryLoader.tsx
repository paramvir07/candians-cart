import { getWalletTopUpHistory } from "@/actions/common/getWalletRechargeHistory.action";
import { AnalyticsPanel } from "@/components/customer/walletHistory/AnalyticsPanel";
import { WalletHistoryClient } from "@/components/customer/walletHistory/WalletHistoryClient";
import { WalletStatsHeader } from "@/components/customer/walletHistory/WalletStatsHeader";
import { unifyTransactions } from "@/lib/walletHistory";
import { AlertTriangle } from "lucide-react";

export async function WalletHistoryLoader() {
  const walletHistoryResponse = await getWalletTopUpHistory();
  const walletHistory = walletHistoryResponse.walletTopUpHistory;

  const transactions = walletHistory
    ? unifyTransactions(
        walletHistory.stripeTopUps ?? [],
        walletHistory.walletTopUps ?? [],
      )
    : [];

  if (!walletHistoryResponse.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto py-16">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold">Failed to load history</p>
          <p className="text-xs text-muted-foreground mt-1">
            {walletHistoryResponse.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {transactions.length > 0 && (
        <WalletStatsHeader transactions={transactions} />
      )}

      <div className="mt-4 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 xl:grid-cols-[1fr_380px]">
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
          <WalletHistoryClient transactions={transactions} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(theme(spacing.6)+theme(spacing.4)+180px)] bg-card rounded-2xl border border-border/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold">Analysis</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {transactions.length} transactions
              </span>
            </div>
            <AnalyticsPanel transactions={transactions} />
          </div>
        </aside>
      </div>
    </>
  );
}