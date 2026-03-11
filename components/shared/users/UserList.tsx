"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types/customer/customer";
import { CalendarDays, Search, Users, X } from "lucide-react";
import CustomerCard from "./CustomerCard";
import QrScannerButton from "./QrScannerButton";
import { useRouter } from "next/navigation";

type StoreUserListProps = {
  myStoreCustomersData: Customer[];
  userRole?: string;
};

type SortOrder = "newest" | "oldest";

const UserList = ({ myStoreCustomersData, userRole }: StoreUserListProps) => {
  const cashierRole = userRole === "cashier";
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();

  const list = myStoreCustomersData.filter((c) => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c._id.toString().includes(q)
    );
  });

  // createdAt if valid; otherwise use Mongo ObjectId timestamp as fallback
  const getSortableTime = (c: Customer) => {
    const createdAtTime = new Date(c.createdAt as any).getTime();
    if (Number.isFinite(createdAtTime) && createdAtTime > 0)
      return createdAtTime;

    // MongoDB ObjectId: first 4 bytes = timestamp (seconds since epoch)
    const idStr = c._id?.toString?.() ?? "";
    if (/^[a-fA-F0-9]{24}$/.test(idStr)) {
      return parseInt(idStr.slice(0, 8), 16) * 1000;
    }

    return 0;
  };

  return list.sort((a, b) => {
    const aTime = getSortableTime(a);
    const bTime = getSortableTime(b);

    // newest => higher time first
    return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
  });
}, [myStoreCustomersData, search, sortOrder]);

  // Called by QrScannerButton after a successful scan
  const handleScanResult = (scannedId: string) => {
    setSearch(scannedId);
  };

  return (
    <div
      className={`space-y-3 mb-20 sm:mb-0 ${cashierRole ? "px-0 md:px-5" : ""}`}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-xl bg-card">
        {/* Row 1: title + count + sort */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold">
              Customer List
            </h1>
            <Badge variant="secondary" className="text-xs tabular-nums">
              {filtered.length}
              {filtered.length !== myStoreCustomersData.length && (
                <span className="text-muted-foreground ml-0.5">
                  /{myStoreCustomersData.length}
                </span>
              )}
            </Badge>
          </div>

          <Button
            variant={sortOrder === "oldest" ? "default" : "secondary"}
            size="sm"
            className="gap-1.5 text-xs h-8 px-2.5 shrink-0"
            onClick={() =>
              setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
            }
            type="button"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
          </Button>
        </div>

        {/* Row 2: search + QR button */}
        <div className="flex items-center gap-2 px-3 pb-3 sm:px-4">
          {/* Search input — takes full remaining width */}
          <div className="flex items-center flex-1 min-w-0 gap-2">
            {/* Search Icon OUTSIDE */}
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Input Wrapper */}
            <div className="relative flex-1 bg-accent/70 rounded-xl">
              <Input
                type="text"
                placeholder="Search name, email, phone or scan QR…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border-0 bg-transparent focus-visible:ring-1 text-sm h-9 pr-9"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* QR Scanner — injects scanned _id into search */}
          <QrScannerButton onScan={handleScanResult} />
        </div>
      </div>

      {/* ── Customer Grid ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Users className="w-10 h-10 opacity-20" />
          <p className="text-sm">No customers match your search</p>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              type="button"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((customer) => (
            <div
              className={cashierRole ? "hover:cursor-pointer" : ""}
              key={customer._id.toString()}
              onClick={() => {
                if (cashierRole) {
                  router.push(`cashier/customer/${customer._id}`);
                }
              }}
            >
              <CustomerCard customer={customer} userRole={userRole} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
