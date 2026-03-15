import { getWalletTopUpHistory } from "@/actions/common/getWalletRechargeHistory.action";
import { AnalyticsPanel } from "@/components/customer/walletHistory/AnalyticsPanel";
import { WalletHistoryClient } from "@/components/customer/walletHistory/WalletHistoryClient";
import { WalletStatsHeader } from "@/components/customer/walletHistory/WalletStatsHeader";
import { Button } from "@/components/ui/button";
import { unifyTransactions } from "@/lib/walletHistory";
import { History, AlertTriangle, ChevronLeft } from "lucide-react";
import Link from "next/link";

const WalletHistoryPage = async () => {
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">Failed to load history</p>
            <p className="text-xs text-muted-foreground mt-1">
              {walletHistoryResponse.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/*
        Layout strategy:
        - Mobile  (<md):  Single column, full-width card
        - Tablet  (md):   Single column, centered max-w-lg
        - Desktop (lg+):  Two-column — transaction list left, analytics panel right (sticky)
      */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Page header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/customer/wallet">
              <Button className="rounded-full" variant="outline" size="icon">
                <ChevronLeft size={25} />
              </Button>
            </Link>
            <History size={28} className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Wallet top up history
            </h1>
          </div>

          {/* Stats card — full width on mobile/tablet, constrained on desktop */}
          {transactions.length > 0 && (
            <WalletStatsHeader transactions={transactions} />
          )}
        </div>

        {/* Body — responsive two-column on lg+ */}
        <div className="mt-4 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 xl:grid-cols-[1fr_380px]">
          {/* LEFT: Transaction list (main) */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
            <WalletHistoryClient transactions={transactions} />
          </div>

          {/* RIGHT: Analytics sidebar — hidden on mobile (shown inside tabs),
                      shown as sticky sidebar on lg+ */}
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
      </div>
    </div>
  );
};

export default WalletHistoryPage;
