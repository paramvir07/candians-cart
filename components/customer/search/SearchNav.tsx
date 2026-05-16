"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, X, ShoppingCart, Wallet } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Customer } from "@/types/customer/customer";
import { fmtShort } from "@/lib/fomatPrice";
import { NavAvatarMenu } from "../landing/NavMenu";

const QrScannerButton = dynamic(
  () => import("@/components/shared/users/QrScannerButton"),
  { ssr: false },
);

interface SearchNavProps {
  customerId?: string;
  initialQuery?: string;
  onQueryChange: (q: string) => void;
  onBarcodeScan?: (value: string) => void;
  customerData: Customer;
  cartCount: number;
}

export function SearchNav({
  customerId,
  initialQuery = "",
  onQueryChange,
  onBarcodeScan,
  customerData,
  cartCount,
}: SearchNavProps) {
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();
  const [scannerOpen, setScannerOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-open scanner when navigated here with ?scan=1 (from bottom nav Scan button)
  useEffect(() => {
    if (searchParams.get("scan") === "1") {
      setScannerOpen(true);
      // Clean up the URL so re-renders don't re-trigger it
      router.replace("/customer/search", { scroll: false });
    }
  }, []);
  // Scanner gun auto enter
  useEffect(() => {
    const THRESHOLD = 50; // ms — scanners are faster than any human

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const buf = scanBufferRef.current;
        scanBufferRef.current = "";

        if (buf.length >= 6) {
          e.preventDefault();
          e.stopPropagation();

          // Focus the input
          searchInputRef.current?.focus();

          // Replace whatever was there with the scanned value
          setQuery(buf);
          startTransition(() => onQueryChange(buf));
          onBarcodeScan?.(buf);

          // Select all so the barcode is visually highlighted
          setTimeout(() => searchInputRef.current?.select(), 0);
        }
        return;
      }

      if (e.key.length !== 1) return;

      // Reset buffer if gap is too large (human typing pace)
      if (gap > THRESHOLD) scanBufferRef.current = "";

      scanBufferRef.current += e.key;
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onQueryChange, onBarcodeScan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(query);
  };
  const handleChange = (val: string) => {
    setQuery(val);
    startTransition(() => onQueryChange(val));
  };
  const handleBarcodeScan = (value: string) => {
    handleChange(value);
    onBarcodeScan?.(value);
  };

  const initials = customerData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b border-border">
      <div className="flex items-center gap-5 px-3 sm:px-4 md:px-6 h-14">
        {/* LEFT */}
        <div className="flex items-center shrink-0">
          {!customerId && (
            <Link href="/customer" className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {!customerId && (
            <div className="hidden md:flex items-center">
              <Logo variant="icon" />
            </div>
          )}
        </div>

        {/* SEARCH */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-2 min-w-0"
        >
          <div className="relative flex-1 min-w-0">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              autoFocus
              className="h-9 w-full rounded-xl bg-muted border-transparent focus-visible:border-border pr-8 text-sm placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Scanner — controlled via state, no ref needed */}
          <div className="shrink-0">
            <QrScannerButton
              usedFor="barcode"
              onScan={handleBarcodeScan}
              open={scannerOpen}
              onOpenChange={setScannerOpen}
            />
          </div>
        </form>

        {/* RIGHT — desktop only */}
        {!customerId && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link href="/customer/cart">
              <Button
                variant="outline"
                size="icon"
                className="relative h-9 w-9 rounded-xl"
                aria-label="Cart"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-bold rounded-full border-2 border-background leading-none"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/customer/wallet">
              <div className="flex items-center gap-2 bg-muted hover:bg-muted/80 border border-border rounded-xl px-3 py-1.5 transition-colors cursor-pointer">
                <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Wallet className="h-3 w-3 text-primary-foreground" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Balance
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {fmtShort(customerData.walletBalance)}
                  </span>
                </div>
              </div>
            </Link>

            <Separator orientation="vertical" className="h-5 mx-1" />
            <NavAvatarMenu name={customerData.name} initials={initials} />
          </div>
        )}
      </div>
    </nav>
  );
}
