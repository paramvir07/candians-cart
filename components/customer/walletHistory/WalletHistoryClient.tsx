"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedTransaction } from "@/types/customer/WalletHistory";
import { TransactionItem } from "./TransactionItem";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { TransactionDetailModal } from "./TransactionDetailModal";

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
      {/* Search bar */}
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, type or..."
          className="pl-9 pr-10 h-10 rounded-xl bg-muted/50 border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fresh" className="w-full mt-1">
        <TabsList className="w-full bg-transparent p-0 h-auto border-b border-border/50 rounded-none gap-0">
          <TabsTrigger
            value="fresh"
            className={cn(
              "flex-1 rounded-none border-b-2 border-transparent pb-2.5 pt-0 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground",
            )}
          >
            Fresh
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className={cn(
              "flex-1 rounded-none border-b-2 border-transparent pb-2.5 pt-0 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground",
            )}
          >
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Fresh Tab */}
        <TabsContent value="fresh" className="mt-0 focus-visible:outline-none">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Inbox size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No transactions found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search
                    ? "Try a different search term"
                    : "Your history will appear here"}
                </p>
              </div>
            </div>
          ) : (
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
          )}
        </TabsContent>

        {/* Analysis Tab */}
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
