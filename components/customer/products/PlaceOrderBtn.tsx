"use client";

import {
  PlaceCustomerOrder,
  PlaceOrder,
} from "@/actions/customer/ProductAndStore/Cart.Action";
import { CartTotals } from "@/components/shared/users/CheckOutActions";
import { Button } from "@/components/ui/button";
import { PaymentMode } from "@/types/customer/OrdersClient";
import { useAtom } from "jotai";
import { ArrowRight, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PlaceOrderBtn = ({
  TotalCart,
  customerId,
  compact = false,
  paymentMode,
}: {
  customerId?: string;
  compact?: boolean;
  paymentMode: PaymentMode;
  TotalCart: CartTotals;
}) => {
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (!customerId) return;
    const placeOrder = await PlaceOrder({
      customerId,
      paymentMode,
      TotalCart,
    });

    if (placeOrder?.success) {
      toast.success(placeOrder?.message);
      router.push(`/cashier/customer/${customerId}`);
    } else {
      toast.error(placeOrder?.error);
    }
  };

  const handleCustomerOrder = async () => {
    const res = await PlaceCustomerOrder({ TotalCart });
    if (res.success) {
      toast.success(res.message);
      router.push("/");
    } else {
      toast.error(res.message);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-2 w-40">
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

  // default (non-compact) layout for normal pages if you use it elsewhere
  return (
    <div className="w-full mt-5 flex flex-col gap-2">
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
  );
};

export default PlaceOrderBtn;
