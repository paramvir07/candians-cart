"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, X, ShoppingCartIcon, Wallet, Search } from "lucide-react";
import Link from "next/link";
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleChange = (val: string) => {
    setQuery(val);
    startTransition(() => {
      onQueryChange(val);
    });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onQueryChange(query);
  };

  const handleBarcodeScan = (value: string) => {
    handleChange(value);
    setIsMobileSearchOpen(true);
    if (onBarcodeScan) onBarcodeScan(value);
  };

  const initials = customerData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 h-14 relative">
        
        {/* Left Section: Logo & Back */}
        <div className={`flex items-center shrink-0 transition-all duration-300 ease-in-out ${isMobileSearchOpen ? "opacity-0 -translate-x-full w-0" : "opacity-100 translate-x-0"}`}>
          {!customerId && (
            <>
              <Link href="/" className="md:hidden mr-2">
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="hidden md:block shrink-0">
                <Logo />
              </div>
            </>
          )}
        </div>

        {/* Search Form Section */}
        <div 
          className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
            isMobileSearchOpen 
            ? "flex-1 opacity-100 translate-x-0" 
            : "hidden md:flex md:flex-1 md:max-w-2xl md:mx-4"
          }`}
        >
          {isMobileSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileSearchOpen(false)}
              className="md:hidden shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 min-w-0">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                autoFocus={isMobileSearchOpen}
                className="w-full pr-10 h-9 bg-secondary border-border rounded-xl focus-visible:ring-1 focus-visible:ring-primary transition-all duration-300"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center z-10"
                >
                  <X className="h-3 w-3 text-slate-600" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className={`flex items-center gap-2 shrink-0 transition-all duration-300 ease-in-out ${isMobileSearchOpen ? "opacity-0 translate-x-full w-0 pointer-events-none" : "opacity-100 translate-x-0"}`}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl w-9 h-9 bg-secondary border border-border"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="w-4 h-4 text-primary" />
          </Button>

          {!customerId && (
            <>
              <QrScannerButton usedFor="barcode" onScan={handleBarcodeScan} />
              <Link href="/customer/cart">
                <div className="relative w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 active:scale-[0.97] transition-all">
                  <ShoppingCartIcon className="w-[16px] h-[16px] text-primary" />
                  {(cartCount ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground border-2 border-background">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
              </Link>

              <Link href="/customer/wallet" className="hidden sm:block">
                <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-4 py-1.5 hover:bg-secondary/80 active:scale-[0.97] transition-all">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-primary font-semibold uppercase tracking-wide">Balance</span>
                    <span className="text-sm font-black text-foreground tracking-tight mt-0.5">
                      {fmtShort(customerData.walletBalance)}
                    </span>
                  </div>
                </div>
              </Link>
              
              <Link href="/customer/wallet" className="sm:hidden">
                <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
              </Link>

              <div className="w-px h-5 bg-border mx-1" />
              <NavAvatarMenu name={customerData.name} initials={initials} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}