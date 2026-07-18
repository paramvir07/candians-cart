"use client";

import { StoreOrder } from "@/actions/admin/analytics/store/getStoreDetail.action";
import { Eye } from "lucide-react";
import Link from "next/link";

interface StoreRecentOrdersProps {
  orders: StoreOrder[];
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

function getOrderBadge(status: string) {
  if (status === "pending") {
    return { label: "Pending", className: "bg-amber-100 text-amber-700" };
  }
  if (status === "completed") {
    return { label: "Paid", className: "bg-green-100 text-green-700" };
  }
}

export default function StoreRecentOrders({
  orders,
  storeId,
}: StoreRecentOrdersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          Recent Orders
        </h2>
        <Link
          href={`/admin/store/${storeId}/orders`}
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
                Order
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
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const badge = getOrderBadge(
                  order.status
                );
                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-5 sm:px-6 py-3.5 font-semibold text-gray-800 font-mono text-xs sm:text-sm">
                      {order.orderRef}
                    </td>
                    <td className="px-3 py-3.5 text-gray-600 font-medium tabular-nums">
                      {formatCents(order.amount)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge?.className}`}
                      >
                        {badge?.label}
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
