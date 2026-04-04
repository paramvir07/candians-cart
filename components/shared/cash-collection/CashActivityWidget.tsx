import Link from "next/link";
import { Banknote, ShoppingCart, Wallet } from "lucide-react";
import { CashActivity } from "@/actions/common/getCashActivities.action";

interface CashActivityWidgetProps {
  activities: CashActivity[];
  /** "View all" link — e.g. /admin/cash-collection or /store/cash-collection */
  viewAllHref: string;
  /** Optional: show store column (admin all-stores view) */
  showStore?: boolean;
  /** Max number of activities to display. Defaults to 5. */
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

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function TypeBadge({ type }: { type: CashActivity["type"] }) {
  if (type === "order") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
        <ShoppingCart className="w-2.5 h-2.5" />
        Order
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
      <Wallet className="w-2.5 h-2.5" />
      Top-Up
    </span>
  );
}

const DEFAULT_LIMIT = 5;

export default function CashActivityWidget({
  activities,
  viewAllHref,
  showStore = false,
  limit = DEFAULT_LIMIT,
}: CashActivityWidgetProps) {
  const visibleActivities = activities.slice(0, limit);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-50 p-1.5 rounded-lg">
            <Banknote className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Cash Collection</h2>
        </div>
        <Link
          href={viewAllHref}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Rows */}
      <div className="flex-1 divide-y divide-gray-50">
        {visibleActivities.length === 0 ? (
          <div className="py-12 text-center">
            <Banknote className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No cash activities yet</p>
          </div>
        ) : (
          visibleActivities.map((a) => (
            <div
              key={`${a.type}-${a.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors"
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  a.type === "order" ? "bg-emerald-50" : "bg-blue-50"
                }`}
              >
                {a.type === "order" ? (
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Wallet className="w-3.5 h-3.5 text-blue-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                    {a.customerName}
                  </p>
                  <TypeBadge type={a.type} />
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span className="truncate">{a.cashierName}</span>
                  {showStore && a.storeName && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="truncate max-w-[80px]">{a.storeName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Amount + time */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {formatCents(a.amount)}
                </p>
                <p className="text-xs text-gray-400">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}