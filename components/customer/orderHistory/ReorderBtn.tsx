"use client";
import { ReOrder } from "@/actions/customer/ProductAndStore/Order.Action";
import { Button } from "@/components/ui/button";
import { Download, PackageCheck, RotateCw } from "lucide-react";
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

const ReorderBtn = ({
  OrderId,
  customerId,
  orderStatus,
}: {
  OrderId: string;
  customerId?: string;
  orderStatus?: "pending" | "completed" | "candelled";
}) => {
  const [method, setMethod] = useState<PaymentMode>(PaymentMode.CARD);
  const handleReOrder = async () => {
    const res = await ReOrder(OrderId);

    if (res?.success) {
      toast.success("Item(s) added to cart");
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

      {orderStatus === "pending" && customerId && (
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
              <Button type="submit">Complete order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReorderBtn;
