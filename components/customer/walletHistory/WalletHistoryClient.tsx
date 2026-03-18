"use client";

import { useState, useMemo } from "react";
import { TransactionItem } from "./TransactionItem";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Inbox } from "lucide-react";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";

interface WalletHistoryClientProps {
  transactions: UnifiedTransaction[];
}

export function WalletHistoryClient({
  transactions,
}: WalletHistoryClientProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UnifiedTransaction | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.sublabel.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.paymentMode?.toLowerCase().includes(q),
    );
  }, [search, transactions]);

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, date, type or..."
          className="pl-9 pr-10 h-10 rounded-xl bg-muted/50 border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fresh" className="w-full mt-3">
        <TabsList className="lg:hidden w-full bg-transparent p-0 h-auto border-b border-border/50 rounded-none gap-0">
          <TabsTrigger
            value="fresh"
            className="flex h-10 flex-1 items-center justify-center rounded-md border-b-2 border-transparent px-3 text-sm font-medium leading-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Fresh
          </TabsTrigger>

          <TabsTrigger
            value="analysis"
            className="flex h-10 flex-1 items-center justify-center rounded-md border-b-2 border-transparent px-3 text-sm font-medium leading-none text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Fresh */}
        <TabsContent value="fresh" className="mt-0 focus-visible:outline-none">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Inbox size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No transactions found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search
                    ? "Try a different search term"
                    : "Your history will appear here"}
                </p>
              </div>
            </div>
          ) : (
            /* On md+ show as a subtle table-like list with header */
            <div className="mt-2">
              {/* Column headers — only on sm+ */}
              <div className="hidden sm:grid grid-cols-[auto_1fr_120px_100px] gap-3 px-3 py-2 mb-1">
                <div className="w-10" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Transaction
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Date
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Amount
                </span>
              </div>
              <div className="divide-y divide-border/30 -mx-1">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    className="w-full text-left"
                    onClick={() => setSelected(t)}
                  >
                    <TransactionItem transaction={t} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Analysis */}
        <TabsContent
          value="analysis"
          className="mt-4 focus-visible:outline-none"
        >
          <AnalyticsPanel transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <TransactionDetailModal
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
