"use client";

import { RecentOrder } from "@/actions/admin/analytics/store/allStoresData.action";
import { MoreHorizontal, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface RecentOrdersProps {
  orders: RecentOrder[];
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

function shortenId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

function getOrderBadge(status: string) {
  if (status === "pending") {
    return { label: "Pending", className: "bg-amber-100 text-amber-700" };
  }
  if (status === "completed") {
    return { label: "Paid", className: "bg-green-100 text-green-700" };
  }
  return { label: "Confirmed", className: "bg-teal-100 text-teal-700" };
}

export default function RecentOrders({ orders }: RecentOrdersProps) {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Recent Orders
          </h2>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Store
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const badge = getOrderBadge(order.status);
                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/store/${order.storeId}/orders`}
                        className="font-mono text-xs font-semibold text-gray-400 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded-md transition-colors"
                      >
                        {shortenId(order.orderId)}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-gray-800 max-w-[130px] truncate">
                      {order.storeName}
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
                    <td className="px-4 py-3.5 text-right">
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
