"use client";

import { useState } from "react";
import appIcon from "@/app/icon.jpg";
import { QRCodeSVG } from "qrcode.react";
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

type QrCodeButtonProps = {
  id: string;
};

const QrCodeButton = ({ id }: QrCodeButtonProps) => {
  const [copied, setCopied] = useState(false);

  const formattedId = id.slice(-7).padStart(7, "0");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedId);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy ID:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          id={`qr-code-button-${id}`}
          size="sm"
          className="h-9 w-auto shrink-0 gap-2 rounded-full px-3 shadow-sm transition hover:shadow-md sm:px-4"
        >
          <QrCode className="h-4 w-4" />
          <span className="text-sm font-medium">QR Code</span>
        </Button>
      </DialogTrigger>

      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />

      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[300px] overflow-hidden rounded-2xl border-0 p-0 shadow-xl">
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-muted-foreground backdrop-blur transition hover:bg-white hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="bg-gradient-to-b from-muted/60 via-background to-background px-4 pb-4 pt-5">
          <DialogHeader className="items-center space-y-1.5 text-center">
            <DialogTitle className="text-base font-semibold sm:text-lg">
              Your Order QR Code
            </DialogTitle>

            <DialogDescription className="max-w-[260px] text-xs text-muted-foreground sm:text-sm">
              Show this QR code to the cashier to view your order.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-center">
            <div className="flex h-[244px] w-[244px] items-center justify-center rounded-xl border bg-white p-3 shadow-sm">
              <QRCodeSVG
                value={id}
                size={220}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
                marginSize={2}
                imageSettings={{
                  src: appIcon.src,
                  width: 36,
                  height: 36,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-muted/40 py-2.5">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <ReceiptText className="h-3.5 w-3.5" />

              <span className="text-[10px] uppercase tracking-[0.15em]">
                Order ID
              </span>
            </div>

            <div className="mt-1 flex items-center justify-center gap-2">
              <p className="text-lg font-semibold uppercase tracking-[0.09em] sm:text-xl">
                {formattedId}
              </p>

              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleCopy}
                aria-label="Copy order ID"
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

          <p className="mt-3 text-center text-[10px] text-muted-foreground sm:text-xs">
            Ask cashier to scan or enter the ID.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeButton;
