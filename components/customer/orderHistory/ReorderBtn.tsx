"use client";
import {
  cancelPendingOrder,
  completePendingOrder,
  ReOrder,
} from "@/actions/customer/ProductAndStore/Order.Action";
import { Button } from "@/components/ui/button";
import { CircleX, Download, PackageCheck, RotateCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PaymentMethodSelector from "@/components/shared/users/PaymentMethodSelector";
import { PaymentMode } from "@/types/customer/OrdersClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ReorderBtn = ({
  OrderId,
  customerId,
  orderStatus,
  allOrders,
  orderCustomerId,
}: {
  OrderId: string;
  customerId?: string;
  orderStatus?: "pending" | "completed" | "cancelled";
  allOrders?: boolean;
  orderCustomerId?: string;
}) => {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMode>(PaymentMode.CARD);
  const handleReOrder = async () => {
    const res = await ReOrder(OrderId);

    if (res.success) {
      toast.success(res.message);
      router.push(
        customerId
          ? `/cashier/customer/${customerId}/cart`
          : allOrders
            ? `/cashier/customer/${orderCustomerId}/cart`
            : "/customer/cart",
      );
    } else {
      toast.error(res.message);
    }
  };

  const handleCompletePendingOrder = async () => {
    const response = await completePendingOrder(
      OrderId,
      customerId ? customerId : allOrders ? orderCustomerId : undefined,
      method,
    );

    if (response?.success) {
      toast.success(response.message);
      
    } else {
      toast.error(response.message);
    }
  };

  const handleCancelOrder = async () => {
    const response = await cancelPendingOrder(
      OrderId,
      customerId ? customerId : allOrders ? orderCustomerId : undefined,
    );

    if (response?.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleDownloadInvoice = async () => {
    const res = await fetch(`/api/invoice/${OrderId}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${OrderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
        onClick={handleDownloadInvoice}
      >
        <Download size={14} />
        <span className="hidden sm:inline text-sm">Invoice</span>
      </Button>

      <Button
        onClick={handleReOrder}
        size="icon"
        className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
      >
        <RotateCw size={14} />
        <span className="hidden sm:inline text-sm">Reorder</span>
      </Button>

      {allOrders && (
        <Link href={`/cashier/customer/${orderCustomerId}`}>
          <Button size="icon" className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0">
            <RotateCw size={14} />
            <span className="hidden sm:inline text-sm">View Customer</span>
          </Button>
        </Link>
      )}

      {orderStatus === "pending" && (customerId || allOrders) && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
            >
              <PackageCheck size={14} />
              <span className="hidden sm:inline text-sm">Complete order</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Complete pending order</DialogTitle>
              <DialogDescription>
                Select payment method to complete the pending order
              </DialogDescription>
            </DialogHeader>
            <PaymentMethodSelector value={method} onChange={setMethod} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={handleCompletePendingOrder}>
                Complete order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {orderStatus === "pending" && (
        <Button
          onClick={handleCancelOrder}
          size="icon"
          className="sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
        >
          <CircleX size={14} />
          <span className="hidden sm:inline text-sm">Cancel</span>
        </Button>
      )}
    </div>
  );
};

export default ReorderBtn;
