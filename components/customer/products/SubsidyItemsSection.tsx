import { ISubsidyItems } from "@/db/models/customer/cart.model";
import { Tag } from "lucide-react";
import Image from "next/image";
import CartActionBtns from "./CartActionBtns";
import { CategoryIllustration } from "../shared/CategoryIllustration";

const fmt = (cents: number) => (cents / 100).toFixed(2);

export const SubsidyItemsSection = ({
  subItems,
  customerId,
}: {
  subItems: ISubsidyItems[];
  customerId?: string;
}) => {
  if (!subItems || subItems.length === 0) return null;

  const totalSubsidy = subItems.reduce((sum, item) => sum + item.subsidy, 0);
  let leftOffSubsidy = 0;
  return (
    <>
      {/* ── MOBILE ── */}
      <div className="md:hidden mb-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest">
              Subsidised Items
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
            CA${fmt(totalSubsidy)} saved
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {subItems.map((item, i) => {
            const hasImage = item.productId.images?.[0]?.url;
            const productId = item.productId._id?.toString() ?? String(i);
            let AfterSubsidy = item.TotalPrice * item.quantity - item.subsidy;
            leftOffSubsidy = item.TotalPrice * item.quantity - AfterSubsidy;
            if (AfterSubsidy < 0) {
              leftOffSubsidy = AfterSubsidy + item.subsidy;
              AfterSubsidy = 0;
            }
            return (
              <div
                key={productId}
                className="bg-white rounded-2xl p-4 flex gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 border-l-[3px] border-l-emerald-400"
              >
                <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                  {hasImage ? (
                    <Image
                      src={item.productId.images?.[0]?.url ?? ""}
                      alt={item.productId.name}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CategoryIllustration
                      category={item.productId.category}
                      className="w-full h-full"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.productId.name}
                    </p>
                    <Tag className="w-3 h-3 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.productId.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                      CA${fmt(AfterSubsidy)}
                    </p>
                    <p className="text-xs text-gray-400 line-through tabular-nums">
                      CA${fmt(item.TotalPrice * item.quantity)}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      −CA${fmt(item.subsidy)}
                    </span>
                  </div>

                  <CartActionBtns
                    variant="mobile"
                    quantity={item.quantity}
                    beforeSubsidy={item.TotalPrice}
                    subsidy={item.subsidy}
                    productId={productId}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Subsidised Items
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
            CA${fmt(leftOffSubsidy)} saved
          </span>
        </div>

        {subItems.map((item, i) => {
          const hasImage = item.productId.images?.[0]?.url;
          const productId = item.productId._id?.toString() ?? String(i);
          return (
            <div
              key={productId}
              className={`flex items-center gap-5 px-6 py-4 ${i !== subItems.length - 1 ? "border-b border-gray-50" : ""}`}
            >
              <div className="relative w-18 h-18 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                {hasImage ? (
                  <Image
                    src={item.productId.images?.[0]?.url ?? ""}
                    alt={item.productId.name}
                    width={72}
                    height={72}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CategoryIllustration
                    category={item.productId.category}
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.productId.name}
                  </p>
                  <Tag className="w-3 h-3 text-emerald-500 shrink-0" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.productId.category}
                </p>
              </div>

              <CartActionBtns
                variant="desktop"
                subsidy={item.subsidy}
                quantity={item.quantity}
                beforeSubsidy={item.TotalPrice}
                productId={item.productId._id.toString()}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
