"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Wallet, Banknote, HelpCircle } from "lucide-react";
import type { PaymentBreakdown } from "@/actions/admin/analytics/analytics.action";
import { fmt } from "@/lib/fomatPrice";

function methodIcon(method: string) {
  if (method === "card") return <CreditCard className="w-4 h-4" />;
  if (method === "wallet") return <Wallet className="w-4 h-4" />;
  if (method === "cash") return <Banknote className="w-4 h-4" />;
  return <HelpCircle className="w-4 h-4" />;
}

const COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

export function PaymentBreakdownChart({ data }: { data: PaymentBreakdown[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment methods</CardTitle>
        <CardDescription>Breakdown of completed order payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No data yet
          </p>
        ) : (
          data.map((d, i) => (
            <div key={d.method} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {methodIcon(d.method)}
                  <span className="font-medium capitalize text-foreground">
                    {d.method}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {d.count.toLocaleString()} orders
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {d.pct}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${COLORS[i % COLORS.length]}`}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {fmt(d.revenue)} revenue
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
