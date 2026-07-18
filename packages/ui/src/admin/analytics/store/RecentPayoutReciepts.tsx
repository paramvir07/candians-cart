"use client";

import { RecentPayoutReceipt } from "@/actions/admin/analytics/store/allStoresData.action";
import { Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Changed from "next/router"

interface RecentPayoutReceiptsProps {
  recentPayoutReceipts: RecentPayoutReceipt[];
}

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function getReceiptBadge(status: string) {
  switch (status) {
    case "paid":
      return { label: "Settled", className: "bg-green-100 text-green-700" };
    case "pending":
      return { label: "Pending", className: "bg-amber-100 text-amber-700" };
    default:
      return { label: "Overdue", className: "bg-red-100 text-red-600" };
  }
}

export default function RecentPayoutReceipts({
  recentPayoutReceipts,
}: RecentPayoutReceiptsProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-100 p-1.5 rounded-lg">
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Recent Store Payouts
          </h2>
        </div>
        <Link
          href="/admin/store-payouts"
          className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm min-w-100">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Receipt No.
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Store
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentPayoutReceipts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No payout receipts yet
                </td>
              </tr>
            ) : (
              recentPayoutReceipts.map((receipt) => {
                const badge = getReceiptBadge(receipt.status);
                return (
                  <tr
                    key={receipt.payoutId}
                    // Updated to the correct Admin route and added cursor-pointer
                    onClick={() =>
                      router.push(
                        `/admin/store/${receipt.storeId}/payout-reciepts/${receipt.payoutId}`
                      )
                    }
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      {/* Changed from <Link> to <span> to prevent nested link click issues */}
                      <span className="font-mono text-xs font-semibold text-gray-400 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 px-2 py-1 rounded-md transition-colors inline-block">
                        {receipt.receiptNo}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-700 font-medium max-w-32.5 truncate">
                      {receipt.storeName}
                    </td>
                    <td className="px-3 py-3.5 text-gray-600 font-medium tabular-nums">
                      {formatCents(receipt.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.className}`}
                      >
                        {badge.label}
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