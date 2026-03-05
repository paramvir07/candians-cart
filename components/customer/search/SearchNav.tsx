"use client";
// components/customer/search/SearchNav.tsx

import { useState, useTransition } from "react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, X, Loader2, ShoppingCartIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Customer } from "@/types/customer/customer";
import { fmt, fmtShort } from "@/lib/fomatPrice";

interface SearchNavProps {
  customerId?: string;
  initialQuery?: string;
  onQueryChange: (q: string) => void;
  customerData: Customer;
  cartCount: number;
}

export function SearchNav({
  customerId,
  initialQuery = "",
  onQueryChange,
  customerData,
  cartCount
}: SearchNavProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

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

  const initials = customerData.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <nav
      className={`flex items-center justify-between sticky top-0 z-30 py-4 px-4 ${!customerId ? "shadow-md " : ""}`}
    >
      {/* Back Button — Mobile - Redirtects to home page*/}
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

      {/* Search Form (Matches the flex-1 mx-6 layout from Navbar) */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 md:mx-6 flex items-center justify-center w-full min-w-0"
      >
        <div className="relative w-full flex justify-center md:w-2/3">
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus
            className="w-full"
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
      </form>
      {!customerId && (
        <>
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

            {/* Wallet + Avatar always visible */}
            <Link href="/customer/wallet" className="hidden sm:block">
              <Button
                variant="default"
                className="flex items-center gap-1 px-3"
              >
                <Wallet className="w-5 h-5" />
                {fmt(customerData.walletBalance)}
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
        </>
      )}
    </nav>
  );
}