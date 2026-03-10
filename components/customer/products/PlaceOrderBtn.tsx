"use client";

import { PlaceOrder } from "@/actions/customer/ProductAndStore/Cart.Action";
import { SubsidyValue } from "@/atoms/customer/CartAtom";
import { Button } from "@/components/ui/button";
import { PaymentMode } from "@/types/customer/OrdersClient";
import { useAtom } from "jotai";
import { ArrowRight, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PlaceOrderBtn = ({
  customerId,
  compact = false,
  paymentMode,
}: {
  customerId?: string;
  compact?: boolean;
  paymentMode: PaymentMode;
}) => {
  const router = useRouter();
  const [SubsidyVal] = useAtom(SubsidyValue);

  const handlePlaceOrder = async () => {
    const placeOrder = customerId
      ? await PlaceOrder({
          customerId,
          paymentMode,
          subsidyVal: SubsidyVal,
          getCashierId: true,
        })
      : await PlaceOrder({
          subsidyVal: SubsidyVal,
        });

    if (placeOrder.success) {
      toast.success(placeOrder.message);
      router.push(customerId ? `/cashier/customer/${customerId}` : "/");
    } else {
      toast.error(placeOrder.error);
    }
  };

  const handlePayAtStore = async () => {
    const placeOrder = await PlaceOrder({
      status: "pending",
      paymentMode: "pending",
      subsidyVal: SubsidyVal,
    });

    if (placeOrder.success) {
      toast.success(placeOrder.message);
      router.push("/");
    } else {
      toast.error(placeOrder.error);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-2 w-40">
        <Button
          onClick={handlePlaceOrder}
          className="w-full py-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
        >
          Place Order
          <ArrowRight className="w-4 h-4" />
        </Button>

        {!customerId && (
          <Button
            onClick={handlePayAtStore}
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
      <Button
        onClick={handlePlaceOrder}
        className="w-full py-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
      >
        Place Order
        <ArrowRight className="w-4 h-4" />
      </Button>
      {!customerId && (
        <Button
          onClick={handlePayAtStore}
          variant="outline"
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
