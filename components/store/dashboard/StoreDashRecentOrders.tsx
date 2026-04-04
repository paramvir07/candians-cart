"use client";

import { StoreRecentOrder } from "@/actions/store/getStoreDashboard.actions";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface StoreDashRecentOrdersProps {
  orders: StoreRecentOrder[];
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

function getStatusBadge(status: string, paymentMode: string) {
  if (paymentMode === "pending") {
    return { label: "Pending", className: "bg-amber-100 text-amber-700" };
  }
  if (status === "completed") {
    return { label: "Completed", className: "bg-green-100 text-green-700" };
  }
  return { label: "Pending", className: "bg-blue-100 text-blue-700" };
}

const DEFAULT_LIMIT = 5;

export default function StoreDashRecentOrders({
  orders,
  limit = DEFAULT_LIMIT,
}: StoreDashRecentOrdersProps) {
  const visibleOrders = orders.slice(0, limit);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          Recent Orders
        </h2>
        <Link
          href="/store/orders"
          className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/40">
              <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Customer
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
            {visibleOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No orders yet
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const badge = getStatusBadge(order.status, order.paymentMode);
                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-5 sm:px-6 py-3.5 font-semibold text-gray-800 max-w-[160px] truncate">
                      {order.customerName}
                    </td>
                    <td className="px-3 py-3.5 text-gray-600 font-medium tabular-nums">
                      {formatCents(order.amount)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-center">
                      <button className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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