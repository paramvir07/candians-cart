"use client";

import { useState } from "react";
import QrCodeClient from "@/components/customer/profile/QrCodeClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Copy, QrCode, ReceiptText, X } from "lucide-react";

const QrCodeButton = ({ orderId }: { orderId: string }) => {
  const [copied, setCopied] = useState(false);

  const formattedOrderId = orderId.toString().slice(-7).padStart(7, "0");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedOrderId);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy order ID:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="shrink-0 gap-2 rounded-full px-3 sm:px-4 shadow-sm transition hover:shadow-md w-auto max-sm:h-9"
        >
          <QrCode size={16} />
          <span className="text-sm font-medium">QR Code</span>
        </Button>
      </DialogTrigger>

      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />

      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[300px] rounded-2xl border-0 p-0 shadow-xl overflow-hidden">
        <DialogClose asChild>
          <button className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-muted-foreground backdrop-blur transition hover:bg-white hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="bg-gradient-to-b from-muted/60 via-background to-background px-4 pb-4 pt-5">
          <DialogHeader className="items-center text-center space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-semibold">
              Your Order QR Code
            </DialogTitle>

            <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-[260px]">
              Show this QR code to the cashier to view your order.
            </DialogDescription>
          </DialogHeader>

          {/* QR */}
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl border bg-white p-3 shadow-sm">
              <QrCodeClient id={orderId.toString()} />
            </div>
          </div>

          {/* Order ID */}
          <div className="mt-4 rounded-xl border bg-muted/40  py-2.5">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <ReceiptText className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-[0.15em]">
                Order ID
              </span>
            </div>

            <div className="mt-1 flex items-center justify-center gap-2">
              <p className="text-lg sm:text-xl font-semibold tracking-[0.09em] uppercase">
                {formattedOrderId}
              </p>

              <Button
                size="icon"
                variant="secondary"
                onClick={handleCopy}
                className="h-7 w-7 rounded-full"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] sm:text-xs text-muted-foreground">
            Ask cashier to scan or enter the ID.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeButton;