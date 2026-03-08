import { getWalletTopUpHistory } from "@/actions/common/getWalletRechargeHistory.action";
import {
  WalletHistoryClient,
} from "@/components/customer/walletHistory/WalletHistoryClient";
import { WalletStatsHeader } from "@/components/customer/walletHistory/WalletStatsHeader";
import { unifyTransactions } from "@/lib/walletHistory";
import { History } from "lucide-react";

const WalletHistoryPage = async () => {
  const walletHistoryResponse = await getWalletTopUpHistory();

  const walletHistory = walletHistoryResponse.walletTopUpHistory;

  const transactions = walletHistory
    ? unifyTransactions(
        walletHistory.stripeTopUps ?? [],
        walletHistory.cashierTopUps ?? [],
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first container, centered on larger screens */}
      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-6 pb-3">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <History size={18} className="text-primary" />
              <h1 className="text-xl font-bold tracking-tight">History</h1>
            </div>
          </div>

          {/* Stats card */}
          {transactions.length > 0 && (
            <WalletStatsHeader transactions={transactions} />
          )}
        </div>

        {/* Main Content */}
        <div className="mt-4">
          {!walletHistoryResponse.success ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  Failed to load history
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {walletHistoryResponse.message}
                </p>
              </div>
            </div>
          ) : (
            /* Client shell — handles search, tabs, modal */
            <WalletHistoryClient transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletHistoryPage;
