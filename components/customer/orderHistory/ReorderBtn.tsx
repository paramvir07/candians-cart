"use client";

import { downloadOrderInvoicePDF } from "./DownloadOrderInvoice";
import {
  cancelPendingOrder,
  completePendingOrder,
  ReOrder,
} from "@/actions/customer/ProductAndStore/Order.Action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  CircleX,
  Download,
  PackageCheck,
  RotateCw,
  User2,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QrCodeButton from "@/components/shared/users/orders/QrCodeButton";

type ModalState = "none" | "reorder" | "complete" | "cancel";

interface ReorderBtnProps {
  OrderId: string;
  customerId?: string;
  orderStatus?: "pending" | "completed" | "cancelled";
  allOrders?: boolean;
  orderCustomerId?: string;
  order?: any;
}

const ReorderBtn = ({
  OrderId,
  customerId,
  orderStatus,
  allOrders,
  orderCustomerId,
  order,
}: ReorderBtnProps) => {
  const router = useRouter();

  const [modal, setModal] = useState<ModalState>("none");
  const [loading, setLoading] = useState(false);

  const close = () => {
    if (loading) return;
    setModal("none");
  };

  const openComplete = () => {
    setModal("complete");
  };

  const handleReOrder = async () => {
    setLoading(true);
    try {
      const res = await ReOrder(OrderId);
      if (res.success) {
        toast.success(res.message);
        setModal("none");
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
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    try {
      const response = await completePendingOrder(
        OrderId,
        customerId ? customerId : allOrders ? orderCustomerId : undefined,
        "wallet",
      );

      if (response?.success) {
        toast.success(response.message);
        setModal("none");
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      const response = await cancelPendingOrder(
        OrderId,
        customerId ? customerId : allOrders ? orderCustomerId : undefined,
      );
      if (response?.success) {
        toast.success(response.message);
        setModal("none");
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) {
      toast.error("Order data is not available for invoice download.");
      return;
    }

    setLoading(true);
    try {
      await downloadOrderInvoicePDF(order);
      toast.success("Invoice downloaded successfully.");
    } catch (error) {
      console.error("Invoice generation failed", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download invoice.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Reorder Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={modal === "reorder"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center gap-3 pb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg">Reorder this?</DialogTitle>
              <DialogDescription className="leading-relaxed">
                All items from this order will be added to your cart so you can
                checkout again.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleReOrder}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
              {loading ? "Adding to cart…" : "Yes, reorder"}
            </Button>
            <Button
              variant="outline"
              onClick={close}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complete Order Dialog ──────────────────────────────────────────── */}
      <Dialog open={modal === "complete"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center gap-3 pb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <PackageCheck className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg">Confirm order</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Are you sure you want to complete the customer&apos;s order?
              </DialogDescription>
            </div>
          </DialogHeader>

          <Separator className="my-2" />

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleCompleteOrder}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Completing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm & complete
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={close}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Order Dialog ─────────────────────────────────────────────── */}
      <Dialog open={modal === "cancel"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center gap-3 pb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg">Cancel order?</DialogTitle>
              <DialogDescription className="leading-relaxed">
                This order will be permanently cancelled and cannot be undone.
                Any reserved items will be released.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleCancelOrder}
              disabled={loading}
              className="w-full gap-2 bg-red-500/90 hover:bg-red-500/80"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CircleX className="h-4 w-4" />
              )}
              {loading ? "Cancelling…" : "Yes, cancel order"}
            </Button>
            <Button
              variant="outline"
              onClick={close}
              disabled={loading}
              className="w-full"
            >
              Keep order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Action Buttons ──────────────────────────────────────────────────── */}
      <div className="flex w-full flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 gap-1.5 px-0 text-sm font-medium sm:w-auto sm:px-3"
          onClick={handleDownloadInvoice}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}

          <span className="hidden sm:inline">
            {loading ? "Generating..." : "Invoice"}
          </span>
        </Button>

        {!customerId && !allOrders && order && <QrCodeButton id={order._id} />}
        {allOrders && (
          <Button
            asChild
            size="icon"
            className="h-9 w-9 shrink-0 gap-1.5 px-0 text-sm font-medium sm:w-auto sm:px-3"
          >
            <Link href={`/cashier/customer/${orderCustomerId}/cart`}>
              <User2 className="h-4 w-4" />
              <span className="hidden sm:inline">View Customer</span>
            </Link>
          </Button>
        )}

        <Button
          size="sm"
          className="ml-auto h-9 shrink-0 gap-1.5 px-3 text-sm font-medium"
          onClick={() => setModal("reorder")}
        >
          <RotateCw className="h-4 w-4" />
          <span>Reorder</span>
        </Button>
      </div>
    </>
  );
};

export default ReorderBtn;
