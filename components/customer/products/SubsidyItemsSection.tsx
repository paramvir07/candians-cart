import { ISubsidyItems } from "@/db/models/customer/cart.model";
import { Tag } from "lucide-react";
import Image from "next/image";
import CartActionBtns from "./CartActionBtns";
import { CategoryIllustration } from "../shared/CategoryIllustration";
import GetUsedSubsidy from "./getUsedSubsidy";

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
      <div className="md:hidden mb-5">
        {/* Section header */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.1)" }}>
              <Tag className="w-3 h-3" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: "var(--primary)" }}>
              Subsidised Items
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "oklch(0.6271 0.1699 149.2138 / 0.1)",
              color: "var(--primary)",
              border: "1px solid oklch(0.6271 0.1699 149.2138 / 0.2)",
            }}>
            CA${fmt(totalSubsidy)} saved
          </span>
          <GetUsedSubsidy usedSubsidy={totalSubsidy} subItemslength={subItems.length}/>
        </div>

        <div className="flex flex-col gap-2.5">
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
              <div key={productId} className="rounded-2xl overflow-hidden border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Green left accent */}
                <div className="flex gap-3 p-3 border-l-[3px]"
                  style={{ borderLeftColor: "var(--primary)" }}>
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
                    style={{ background: "var(--secondary)" }}>
                    {hasImage ? (
                      <Image src={item.productId.images?.[0]?.url ?? ""} alt={item.productId.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                    )}
                    {/* Subsidy badge on image */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "var(--primary)" }}>
                      <Tag className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                      {item.productId.name}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {item.productId.category}
                    </p>

                    <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                      <p className="text-sm font-black tabular-nums" style={{ color: "var(--primary)" }}>
                        CA${fmt(AfterSubsidy)}
                      </p>
                      <p className="text-xs tabular-nums line-through" style={{ color: "var(--muted-foreground)" }}>
                        CA${fmt(item.TotalPrice * item.quantity)}
                      </p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{
                          background: "oklch(0.6271 0.1699 149.2138 / 0.1)",
                          color: "var(--primary)",
                        }}>
                        −CA${fmt(item.subsidy)}
                      </span>
                    </div>

                    <CartActionBtns
                      customerId={customerId}
                      variant="mobile"
                      quantity={item.quantity}
                      beforeSubsidy={item.TotalPrice}
                      subsidy={item.subsidy}
                      productId={productId}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block rounded-2xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>

        {/* Header strip */}
        <div className="px-6 pt-5 pb-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.12)" }}>
              <Tag className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
              Subsidised Items
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "oklch(0.6271 0.1699 149.2138 / 0.1)",
              color: "var(--primary)",
              border: "1px solid oklch(0.6271 0.1699 149.2138 / 0.2)",
            }}>
            CA${fmt(leftOffSubsidy)} saved
          </span>
        </div>

        {subItems.map((item, i) => {
          const hasImage = item.productId.images?.[0]?.url;
          const productId = item.productId._id?.toString() ?? String(i);
          return (
            <div key={productId}
              className={`flex items-center gap-5 px-6 py-4 transition-colors hover:bg-[oklch(0.6271_0.1699_149.2138_/_0.02)] ${i !== subItems.length - 1 ? "border-b" : ""}`}
              style={{ borderColor: "var(--border)" }}>

              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
                style={{ background: "var(--secondary)" }}>
                {hasImage ? (
                  <Image src={item.productId.images?.[0]?.url ?? ""} alt={item.productId.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <CategoryIllustration category={item.productId.category} className="w-full h-full" />
                )}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--primary)" }}>
                  <Tag className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  {item.productId.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {item.productId.category}
                </p>
              </div>

              <CartActionBtns
                customerId={customerId}
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