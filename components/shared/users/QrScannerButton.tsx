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
import { QrCode, X, ScanLine } from "lucide-react";

// MUST be dynamically imported with ssr:false — library uses browser APIs
// that don't exist during Next.js server rendering
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false },
);

type QrScannerButtonProps = {
  onScan: (value: string) => void;
};

export default function QrScannerButton({ onScan }: QrScannerButtonProps) {
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  function handleScan(results: { rawValue: string }[]) {
    if (results && results.length > 0) {
      const value = results[0].rawValue;
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
        className="shadow-sm gap-1.5 shrink-0"
        type="button"
        onClick={() => setOpen(true)}
      >
        <QrCode className="w-4 h-4" />
        <span className="hidden sm:inline">Scan QR</span>
      </Button>

      <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2 space-y-0">
            <DialogTitle className="text-base flex items-center gap-2 font-semibold">
              <ScanLine className="w-4 h-4 text-primary" />
              Scan Customer QR
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

          {/* Scanner — only mounts when dialog is open, so camera starts fresh each time */}
          {open && (
            <div className="overflow-hidden rounded-b-2xl">
              <Scanner
                onScan={handleScan}
                onError={(err) => console.error("QR Scanner error:", err)}
                constraints={{
                  facingMode: "environment", // rear camera on phones
                }}
                components={{
                  finder: true,
                }}
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
            Align the customer's QR code inside the frame — detects
            automatically.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
