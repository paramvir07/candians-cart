import { Package } from "lucide-react";
import { IMiscCartItem } from "@/db/models/customer/cart.model";
import MiscCartActionBtns from "./MiscCartActionBtns";

const fmt = (cents: number) => (cents / 100).toFixed(2);

interface MiscItemsSectionProps {
  miscItems: IMiscCartItem[];
  customerId?: string;
}

export function MiscItemsSection({ miscItems, customerId }: MiscItemsSectionProps) {
  if (!miscItems || miscItems.length === 0) return null;

  const miscTotal = miscItems.reduce((acc, item) => acc + item.priceAtAdd * item.quantity, 0);

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden mb-5">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.1)" }}>
              <Package className="w-3 h-3" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: "var(--primary)" }}>
              Misc Items
            </p>
          </div>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "oklch(0.6271 0.1699 149.2138 / 0.1)",
              color: "var(--primary)",
              border: "1px solid oklch(0.6271 0.1699 149.2138 / 0.2)",
            }}
          >
            CA${fmt(miscTotal)}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {miscItems.map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex gap-3 p-3 border-l-[3px]" style={{ borderLeftColor: "var(--primary)" }}>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                  <Package className="w-7 h-7" style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                    {item.itemId.productName}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    Miscellaneous
                  </p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <p className="text-sm font-black tabular-nums" style={{ color: "var(--primary)" }}>
                      CA${fmt(item.priceAtAdd * item.quantity)}
                    </p>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      CA${fmt(item.priceAtAdd)} ea.
                    </span>
                  </div>
                  <MiscCartActionBtns
                    itemId={item.itemId._id.toString()}
                    initialQty={item.quantity}
                    priceAtAdd={item.priceAtAdd}
                    customerId={customerId}
                    variant="mobile"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div
          className="px-6 pt-5 pb-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "oklch(0.6271 0.1699 149.2138 / 0.03)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.6271 0.1699 149.2138 / 0.12)" }}>
              <Package className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
              Misc Items
            </p>
          </div>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "oklch(0.6271 0.1699 149.2138 / 0.1)",
              color: "var(--primary)",
              border: "1px solid oklch(0.6271 0.1699 149.2138 / 0.2)",
            }}
          >
            CA${fmt(miscTotal)}
          </span>
        </div>

        {miscItems.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-5 px-6 py-4 transition-colors hover:bg-[oklch(0.6271_0.1699_149.2138_/_0.02)] ${i !== miscItems.length - 1 ? "border-b" : ""}`}
            style={{ borderColor: "var(--border)" }}
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--secondary)" }}>
              <Package className="w-7 h-7" style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                {item.itemId.productName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Miscellaneous
              </p>
            </div>

            <MiscCartActionBtns
              itemId={item.itemId._id.toString()}
              initialQty={item.quantity}
              priceAtAdd={item.priceAtAdd}
              customerId={customerId}
              variant="desktop"
            />
          </div>
        ))}
      </div>
    </>
  );
}