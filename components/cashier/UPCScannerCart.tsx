"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ScanBarcode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { searchProductsByUPC } from "@/actions/common/searchProducts.action";
import { AddtoCart } from "@/actions/customer/ProductAndStore/Cart.Action";
import { useRouter } from "next/navigation";

const OBJECT_ID_OR_UPC_RE = /^[a-zA-Z0-9\-]{2,}$/;
const MIN_WEIGHT_QTY = 0.1;
const MAX_WEIGHT_QTY = 99;

interface UPCScannerProps {
  customerId: string;
  storeId: string;
}

interface PendingWeightProduct {
  _id: string;
  name: string;
  UOM: string;
}

export const UPCScannerCart = ({ customerId, storeId }: UPCScannerProps) => {
  const [upc, setUpc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");
  const isHandlingRef = useRef(false);
  const isInputFocusedRef = useRef(false);

  const [pendingProduct, setPendingProduct] =
    useState<PendingWeightProduct | null>(null);
  const [qtyInput, setQtyInput] = useState("");
  const [isSubmittingQty, setIsSubmittingQty] = useState(false);

  const router = useRouter();

  const focusInput = () => {
    let attempts = 0;
    const tryFocus = () => {
      attempts += 1;
      const el = inputRef.current;
      if (el && document.activeElement !== el) {
        el.focus();
      }
      if (attempts < 4 && document.activeElement !== inputRef.current) {
        requestAnimationFrame(tryFocus);
      }
    };
    requestAnimationFrame(tryFocus);
  };

  useEffect(() => {
    focusInput();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocusedRef.current) return;

      const active = document.activeElement;
      const isTypingElsewhere =
        !!active &&
        active !== document.body &&
        active !== inputRef.current &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable);

      if (isTypingElsewhere) return;

      if (e.key === "Enter") {
        const buf = scanBufferRef.current.trim();
        scanBufferRef.current = "";
        if (buf) {
          handleScan(buf);
        }
        return;
      }
      if (e.key.length === 1) {
        scanBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [storeId, customerId]);

  const finishScan = () => {
    setIsLoading(false);
    setUpc("");
    isHandlingRef.current = false;
    focusInput();
  };

  // All normalization happens here, once, right before it leaves the
  // component — never inside the input's own change handler.
  const handleScan = async (rawValue: string) => {
    const trimmed = rawValue.trim().toUpperCase();
    if (!trimmed) return;
    if (!OBJECT_ID_OR_UPC_RE.test(trimmed)) {
      toast.error(`Invalid UPC "${trimmed}"`);
      return;
    }
    if (isHandlingRef.current) return;
    isHandlingRef.current = true;

    setIsLoading(true);
    try {
      const res = await searchProductsByUPC(trimmed, storeId);
      const results = res.success && res.data ? res.data : [];

      if (results.length === 0) {
        toast.error("No product found for this barcode");
        finishScan();
      } else if (results.length === 1) {
        const product = results[0];

        if (product.isMeasuredInWeight) {
          setQtyInput("");
          setPendingProduct({ _id: product._id as string, name: product.name, UOM: product.UOM ?? 'kg/lb'});
          setIsLoading(false);
          setUpc("");
        } else {
          await AddtoCart(product._id as string, customerId);
          toast.success(`${product.name} added to cart`);
          router.refresh();
          finishScan();
        }
      } else {
        toast.error("Multiple products found — try a more specific barcode");
        finishScan();
      }
    } catch {
      toast.error("Failed to add product");
      finishScan();
    }
  };

  const handleQtyDialogChange = (open: boolean) => {
    if (!open) {
      setPendingProduct(null);
      setQtyInput("");
      finishScan();
    }
  };

  const handleConfirmWeightQty = async () => {
    if (!pendingProduct) return;

    const isPiece = pendingProduct.UOM === "pc";
    const minQty = isPiece ? 1 : MIN_WEIGHT_QTY;

    const qty = isPiece ? parseInt(qtyInput, 10) : parseFloat(qtyInput);
    if (
      Number.isNaN(qty) ||
      qty < minQty ||
      qty > MAX_WEIGHT_QTY ||
      (isPiece && !Number.isInteger(qty))
    ) {
      toast.error(`Enter a whole number between 1 and ${MAX_WEIGHT_QTY}`);
      return;
    }

    setIsSubmittingQty(true);
    try {
      await AddtoCart(pendingProduct._id, customerId, qty);
      toast.success(`${pendingProduct.name} added to cart`);
      router.refresh();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setIsSubmittingQty(false);
      setPendingProduct(null);
      setQtyInput("");
      finishScan();
    }
  };

  const isPiece = pendingProduct?.UOM === "pc";

  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <ScanBarcode className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
        <Input
          ref={inputRef}
          value={upc}
          onFocus={() => {
            isInputFocusedRef.current = true;
          }}
          onBlur={() => {
            isInputFocusedRef.current = false;
          }}
          onChange={(e) => setUpc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleScan(upc);
            }
          }}
          placeholder="Scan or type UPC…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={isLoading || !!pendingProduct}
          className="border-0 bg-transparent focus-visible:ring-0 text-sm h-7 px-0 placeholder:text-muted-foreground/50"
        />
      </div>

      <Dialog open={!!pendingProduct} onOpenChange={handleQtyDialogChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter quantity</DialogTitle>
            <DialogDescription>
              {pendingProduct?.name} is sold by weight. Enter the quantity.
            </DialogDescription>
          </DialogHeader>

          <Input
            type="number"
            inputMode={isPiece ? "numeric" : "decimal"}
            step={isPiece ? "1" : "0.01"}
            min={isPiece ? 1 : MIN_WEIGHT_QTY}
            max={MAX_WEIGHT_QTY}
            autoFocus
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmWeightQty();
              }
            }}
            placeholder={isPiece ? `1 – ${MAX_WEIGHT_QTY}` : `${MIN_WEIGHT_QTY} – ${MAX_WEIGHT_QTY}`}
            disabled={isSubmittingQty}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleQtyDialogChange(false)}
              disabled={isSubmittingQty}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmWeightQty} disabled={isSubmittingQty}>
              {isSubmittingQty ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add to cart"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};