"use client";

import { StorePayoutReceipt } from "@/actions/admin/analytics/store/getStoreDetail.action";
import Link from "next/link";

interface StorePayoutReceiptsProps {
  receipts: StorePayoutReceipt[];
  storeId: string;
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

export default function StorePayoutReceipts({
  receipts,
  storeId,
}: StorePayoutReceiptsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          Recent Payouts
        </h2>
        <Link
          href={`/admin/store/${storeId}/payout-reciepts`}
          className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/40">
              <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Reciept no
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {receipts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No invoices yet
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => {
                const isPending = receipt.status === "pending";
                return (
                  <tr
                    key={receipt.payoutId}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 sm:px-6 py-3.5 font-mono text-xs sm:text-sm font-semibold text-gray-700">
                      {receipt.receiptNo}
                    </td>
                    <td className="px-3 py-3.5 text-gray-600 font-medium tabular-nums">
                      {formatCents(receipt.amount)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          isPending
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isPending ? "Pending" : "Settled"}
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
