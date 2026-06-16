"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ScanBarcode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProductsByUPC } from "@/actions/common/searchProducts.action";
import { AddtoCart } from "@/actions/customer/ProductAndStore/Cart.Action";

const OBJECT_ID_OR_UPC_RE = /^[a-zA-Z0-9\-]{4,}$/;

interface UPCScannerProps {
  customerId: string;
  storeId: string;
}

export const UPCScannerCart = ({ customerId, storeId }: UPCScannerProps) => {
  const [upc, setUpc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");
    const isHandlingRef = useRef(false);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Hardware scanner support
  useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    const buf = scanBufferRef.current.trim();
    scanBufferRef.current = "";
    if (buf) {
      handleScan(buf);
      setUpc(""); // clear input so onKeyDown Enter sees nothing
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

const handleScan = async (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || !OBJECT_ID_OR_UPC_RE.test(trimmed)) return;
  if (isHandlingRef.current) return; // guard
  isHandlingRef.current = true;

  setIsLoading(true);
  setUpc(trimmed);

  try {
    const res = await searchProductsByUPC(trimmed, storeId);
    const results = res.success && res.data ? res.data : [];

    if (results.length === 0) {
      toast.error("No product found for this barcode");
    } else if (results.length === 1) {
      await AddtoCart(results[0]._id as string, customerId);
      toast.success(`${results[0].name} added to cart`);
    } else {
      toast.error("Multiple products found — try a more specific barcode");
    }
  } catch {
    toast.error("Failed to add product");
  } finally {
    setIsLoading(false);
    setUpc("");
    isHandlingRef.current = false; // reset
    inputRef.current?.focus();
  }
};

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {isLoading
          ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          : <ScanBarcode className="w-3.5 h-3.5 text-primary" />
        }
      </div>
      <Input
        ref={inputRef}
        value={upc}
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
        disabled={isLoading}
        className="border-0 bg-transparent focus-visible:ring-0 text-sm h-7 px-0 placeholder:text-muted-foreground/50"
      />
    </div>
  );
};