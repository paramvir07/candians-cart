"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, X, ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Customer } from "@/types/customer/customer";
import { fmtShort } from "@/lib/fomatPrice";

// Lazy-load so camera APIs don't break SSR
const QrScannerButton = dynamic(
  () => import("@/components/shared/users/QrScannerButton"),
  { ssr: false },
);

interface SearchNavProps {
  customerId?: string;
  initialQuery?: string;
  onQueryChange: (q: string) => void;
  /** Called when the barcode scanner successfully reads a value */
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

  const handleChange = (val: string) => {
    setQuery(val);
    startTransition(() => {
      onQueryChange(val);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(query);
  };

  // When a barcode is scanned, fill the search box and trigger search
  const handleBarcodeScan = (value: string) => {
    handleChange(value);
    if (onBarcodeScan) onBarcodeScan(value);
  };

  const initials = customerData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav
      className={`flex items-center justify-between sticky top-0 z-30 py-4 px-4 bg-white ${
        !customerId ? "shadow-md" : ""
      }`}
    >
      {!customerId && (
        <>
          <Link href="/" className="md:hidden mr-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="hidden md:flex shrink-0">
            <Logo />
          </div>
        </>
      )}

      {/* Search form + barcode scanner */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 md:mx-6 flex items-center gap-2 min-w-0"
      >
        <div className="relative flex-1 min-w-0">
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus
            className="w-full pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors z-10"
            >
              <X className="h-3 w-3 text-slate-600" />
            </button>
          )}
        </div>

        {/* Barcode scanner — fills search on scan */}
        <QrScannerButton usedFor="barcode" onScan={handleBarcodeScan} />
      </form>

      {!customerId && (
        <div className="flex items-center gap-3 shrink-0 ml-3 md:ml-0">
          <div className="hidden md:flex items-center gap-3">
            <Link href="/customer/cart">
              <Button variant="outline" className="relative p-2">
                <ShoppingCartIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          <Link href="/customer/wallet" className="hidden sm:block">
            <Button variant="default" className="flex items-center gap-1 px-3">
              <Wallet className="w-5 h-5" />$
              {(customerData.walletBalance / 100).toFixed(2)}
            </Button>
          </Link>

          <Link href="/customer/profile">
            <Avatar className="relative h-8 w-8 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-2xl">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(customerData.name)}`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl lg:text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      )}
    </nav>
  );
}
