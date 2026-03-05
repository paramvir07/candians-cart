import { ISubsidyItems } from "@/db/models/customer/cart.model";
import { Tag } from "lucide-react";
import Image from "next/image";

const fmt = (cents: number) => (cents / 100).toFixed(2);

export const SubsidyItemsSection = ({ subItems }: { subItems: ISubsidyItems[] }) => {
  if (!subItems || subItems.length === 0) return null;

  const totalSubsidy = subItems.reduce((sum, item) => sum + item.subsidy, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-emerald-500" />
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Subsidised Items
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
          CA${fmt(totalSubsidy)} saved
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {subItems.map((item, i) => (
          <div
            key={item.productId._id?.toString() ?? i}
            className="flex items-center gap-4 px-4 sm:px-6 py-3.5"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
              <Image
                src={item.productId.images?.[0]?.url ?? "/placeholder.jpg"}
                alt={item.productId.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {item.productId.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.productId.category} · qty {item.quantity}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-gray-900 tabular-nums">
                CA${fmt(item.afterSubsidy)}
              </p>
              <p className="text-[11px] text-gray-400 line-through tabular-nums mt-0.5">
                CA${fmt(item.TotalPrice)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};