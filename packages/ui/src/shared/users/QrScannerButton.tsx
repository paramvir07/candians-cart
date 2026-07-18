"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, X, ScanLine, Barcode } from "lucide-react";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false },
);

type UsedFor = "qr" | "barcode" | "orders";

export type QrScannerButtonProps = {
  onScan: (value: string) => void;
  usedFor?: UsedFor;
  className?: string;
  /** Controlled open state — pass true to open programmatically */
  open?: boolean;
  /** Called when the dialog wants to close */
  onOpenChange?: (open: boolean) => void;
};

export default function QrScannerButton({
  onScan,
  usedFor = "qr",
  className = "",
  open: controlledOpen,
  onOpenChange,
}: QrScannerButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const isBarcode = usedFor === "barcode";
  const scanOrders = usedFor === "orders";

  const label = isBarcode ? "Scan Barcode" : "Scan QR";
  const dialogTitle = isBarcode
    ? "Scan Product Barcode"
    : scanOrders
      ? "Scan Customer Order QR"
      : "Scan Customer QR";

  const hint = isBarcode
    ? "Point the camera at the product barcode — detects automatically."
    : scanOrders
      ? "Align the customer's order QR code inside the frame — detects automatically."
      : "Align the customer's QR code inside the frame — detects automatically.";

  function handleClose() {
    setOpen(false);
  }

  function handleScan(results: { rawValue: string; format?: string }[]) {
    if (results && results.length > 0) {
      const detected = results[0];
      let value = detected.rawValue;

      // UPC-A barcodes are physically identical to EAN-13 with a leading zero.
      // Some browsers/devices decode them as EAN-13 and prepend a "0", turning a
      // 12-digit UPC into a 13-digit value. Strip that phantom leading zero so the
      // raw UPC printed on the product is returned as-is.
      if (
        isBarcode &&
        detected.format === "ean_13" &&
        value.length === 13 &&
        value.startsWith("0")
      ) {
        value = value.slice(1);
      }

      if (value) {
        handleClose();
        onScan(value);
      }
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className={`shadow-sm gap-1.5 shrink-0 ${className}`}
        type="button"
        onClick={() => setOpen(true)}
      >
        {isBarcode ? (
          <Barcode className="w-4 h-4" />
        ) : (
          <QrCode className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
        <DialogContent
          className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl"
          aria-describedby={undefined}
        >
          <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2 space-y-0">
            <DialogTitle className="text-base flex items-center gap-2 font-semibold">
              <ScanLine className="w-4 h-4 text-primary" />
              {dialogTitle}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              type="button"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {open && (
            <div className="overflow-hidden rounded-b-2xl">
              <Scanner
                onScan={handleScan}
                onError={(err) => console.error("Scanner error:", err)}
                constraints={{ facingMode: "environment" }}
                components={{ finder: true }}
                formats={
                  isBarcode
                    ? [
                        "ean_13",
                        "ean_8",
                        "upc_a",
                        "upc_e",
                        "code_128",
                        "code_39",
                        "itf",
                      ]
                    : undefined
                }
                styles={{
                  container: { width: "100%", paddingTop: 0 },
                  video: {
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                  },
                }}
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center py-3 px-4">
            {hint}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
