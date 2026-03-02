"use client";
// components/customer/search/SearchNav.tsx

import { useState, useTransition } from "react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchNavProps {
  initialQuery?: string;
  onQueryChange: (q: string) => void;
}

export function SearchNav({
  initialQuery = "",
  onQueryChange,
}: SearchNavProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

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

  return (
    <nav className="flex items-center justify-between px-4 py-4 shadow-sm bg-white sticky top-0 z-30">
      {/* Back Button — Mobile - Redirtects to home page*/}
      <Link href="/" className="md:hidden mr-3">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </Link>

      {/* Logo — Desktop matches Navbar */}
      <div className="hidden md:flex shrink-0">
        <Logo />
      </div>

      {/* Search Form (Matches the flex-1 mx-6 layout from Navbar) */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 md:mx-6 flex items-center justify-center w-full"
      >
        <div className="relative w-full flex">
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus
            className="rounded-r-none w-full"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleChange("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors z-10"
            >
              <X className="h-3 w-3 text-slate-600" />
            </button>
          )}
          <Button
            type="submit"
            variant="outline"
            className="rounded-l-none px-4 shrink-0 bg-slate-50 hover:bg-slate-100"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>

      {/* Invisible spacer to perfectly balance the right side of the layout on Desktop so the search bar stays centered like in the Navbar */}
      <div className="hidden md:block w-45 shrink-0 pointer-events-none"></div>
    </nav>
  );
}