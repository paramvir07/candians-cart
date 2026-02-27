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
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3 p-3 w-full max-w-7xl mx-auto">
        {/* Back — mobile */}
        <Link href="/customer">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 sm:hidden rounded-xl hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        {/* Logo — desktop */}
        <div className="shrink-0 hidden sm:flex">
          <Logo />
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              autoFocus
              className="pl-10 pr-10 rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-green-500 h-11"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3 text-slate-600" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 h-11 font-semibold shrink-0 hidden sm:flex gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </form>
      </div>
    </div>
  );
}
