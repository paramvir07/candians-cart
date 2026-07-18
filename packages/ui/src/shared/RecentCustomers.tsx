import Link from "next/link";
import { Users, MapPin, Store, ArrowRight } from "lucide-react";
import type { RecentCustomer } from "@/actions/admin/analytics/getRecentCustomers.action";

interface RecentCustomersProps {
  customers: RecentCustomer[];
  /** Link target for "View all" — defaults to /admin/customers */
  viewAllHref?: string;
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

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic avatar bg from name
const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];
function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function RecentCustomers({
  customers,
  viewAllHref = "/admin/customers",
}: RecentCustomersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-pink-50 p-1.5 rounded-lg">
            <Users className="w-4 h-4 text-pink-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Recent Customers
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 divide-y divide-gray-50">
        {customers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No customers yet</p>
          </div>
        ) : (
          customers.map((c) => (
            <Link
              key={c.customerId}
              href={`/admin/customers/${c.customerId}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors group"
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(c.name)}`}
              >
                {initials(c.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                  {c.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {c.city}
                      {c.province ? `, ${c.province}` : ""}
                    </span>
                  </div>
                  {c.storeName && (
                    <>
                      <span className="text-gray-200">·</span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Store className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[90px]">
                          {c.storeName}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Time + arrow */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-gray-400">
                  {timeAgo(c.joinedAt)}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
