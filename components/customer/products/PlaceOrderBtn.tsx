"use client";

import {
  PlaceOrder,
} from "@/actions/customer/ProductAndStore/Cart.Action";
import { CartTotals } from "@/components/shared/users/CheckOutActions";
import { Button } from "@/components/ui/button";
import { PaymentMode } from "@/types/customer/OrdersClient";
import { ArrowRight, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PlaceOrderBtn = ({
  TotalCart,
  customerId,
  compact = false,
  paymentMode,
}: {
  customerId?: string;
  compact?: boolean;
  paymentMode: "wallet" | "pending";
  TotalCart: CartTotals;
}) => {
  const router = useRouter();
  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    // Only apply sticky logic on mobile (< md breakpoint)
    const isMobile = window.innerWidth < 768;
    if (!isMobile || compact) return;

    const footer = document.querySelector("footer") ?? document.querySelector("[data-footer]");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.01 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [compact]);

  const handlePlaceOrder = async () => {
    if (!customerId) return;
    const placeOrder = await PlaceOrder({
      receivedCustomerId: customerId,
      paymentMode,
      TotalCart,
    });

    if (placeOrder.success) {
      toast.success(placeOrder.message);
      router.push(`/cashier/customer/${customerId}`);
    } else {
      toast.error(placeOrder.message);
    }
  };

  const handleCustomerOrder = async () => {
    const res = await PlaceOrder({ TotalCart });
    if (res.success) {
      toast.success(res.message);
      router.push("/customer");
    } else {
      toast.error(res.message);
    }
  };

  // ── compact mode (cashier sidebar etc.) — unchanged ──────────────────────
  if (compact) {
    return (
      <div className="flex flex-col mb-10  gap-2 w-full">
        {customerId && (
          <Button
            onClick={handlePlaceOrder}
            className="w-full py-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
          >
            Place Order
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        {!customerId && (
          <Button
            onClick={handleCustomerOrder}
            variant="outline"
            className="w-full py-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border-2"
          >
            Pay at Store
            <Store className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // ── full layout ───────────────────────────────────────────────────────────
  //
  // On desktop  → normal block button, nothing special.
  // On mobile   → flows with the cart naturally.
  //               Once the footer enters the viewport the button
  //               "docks" (position: sticky at the bottom of the scroll
  //               container) so it never overlaps the footer.
  //
  // The trick: we wrap in a sentinel div that is always in the DOM.
  // sticky bottom-0 inside the scrollable cart column keeps it pinned to the
  // bottom of the visible area without ever escaping the cart container,
  // so it naturally stops when the footer is reached.

  return (
    <>
      {/* Spacer so content doesn't jump when button becomes sticky */}
      <div className="w-full mt-5 md:mt-0" ref={footerRef}>
        <div
          className={[
            "w-full transition-all duration-200",
            // On mobile: sticky at bottom of scroll container until footer
            // On desktop: just a normal block
            !isFooterVisible
              ? "md:relative sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm pb-3 pt-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:pt-0 md:bg-transparent md:backdrop-blur-none"
              : "relative",
          ].join(" ")}
        >
          {customerId && (
            <Button
              onClick={handlePlaceOrder}
              className="w-full py-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              Place Order
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {!customerId && (
            <Button
              onClick={handleCustomerOrder}
              className="w-full py-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border-2"
            >
              Pay at Store
              <Store className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaceOrderBtn;