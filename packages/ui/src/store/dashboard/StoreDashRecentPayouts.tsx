"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { StoreRecentPayout } from "@/actions/store/getStoreDashboard.actions";

interface StoreDashRecentPayoutsProps {
  payouts: StoreRecentPayout[];
  limit?: number;
}

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const DEFAULT_LIMIT = 5;

export default function StoreDashRecentPayouts({
  payouts,
  limit = DEFAULT_LIMIT,
}: StoreDashRecentPayoutsProps) {
  const router = useRouter();
  const visiblePayouts = payouts.slice(0, limit);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gray-400" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Payouts</h2>
        </div>
        <Link
          href="/store/payouts"
          className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-90">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/40">
              <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Week
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visiblePayouts.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-sm text-gray-400">
                  No payouts yet
                </td>
              </tr>
            ) : (
              visiblePayouts.map((payout) => {
                const isPaid = payout.status === "paid";
                return (
                  <tr
                    key={payout.payoutId}
                    onClick={() => router.push(`/store/payouts/${payout.payoutId}`)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 sm:px-6 py-3.5 font-medium text-gray-700">
                      {payout.weekLabel}
                    </td>
                    <td className="px-3 py-3.5 font-semibold tabular-nums text-emerald-600">
                      {formatCents(payout.amount)}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}