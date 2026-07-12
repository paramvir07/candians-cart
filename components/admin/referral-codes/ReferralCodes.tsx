"use client";

import { useState, useTransition, useEffect  } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReferralCode } from "@/types/admin/referralCode";
import { ReferralCodeDialogForm } from "./ReferralCodeDialogForm";
import {
  getReferalCodesAction,
  ReferralCodeType,
} from "@/actions/admin/referalCode.actions";

function formatDate(d?: string | Date | null) {
  if (!d) return "Never";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function usageText(uses: number, maxUses: number | null) {
  return `${uses} / ${maxUses ?? "∞"}`;
}

function computeActive(row: ReferralCode) {
  if (!row.isActive) return false;
  if (!row.expiresAt) return true;
  const now = new Date();
  const expiresAt = new Date(row.expiresAt);
  return expiresAt > now;
}

function getPageList(current: number, total: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const delta = 1;

  const range: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  pages.push(1);
  if (range[0] > 2) pages.push("ellipsis");
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push("ellipsis");
  if (total > 1) pages.push(total);

  return pages;
}

interface ReferralCodesProps {
  data: ReferralCode[];
  totalPages: number;
  currentPage: number;
}

export function ReferralCodes({
  data: initialData,
  totalPages: initialTotalPages,
  currentPage: initialPage,
}: ReferralCodesProps) {
  const [data, setData] = useState(initialData);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [type, setType] = useState<ReferralCodeType>("all");
  const [isPending, startTransition] = useTransition();

  const pageList = getPageList(currentPage, totalPages);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [currentPage]);

  const fetchData = (p: number, t: ReferralCodeType) => {
    startTransition(async () => {
      const res = await getReferalCodesAction(p, 5, t);
      if (res.success) {
        setData(res.referralCodes);
        setTotalPages(res.totalPages);
        setCurrentPage(res.currentPage);
      }
    });
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    fetchData(p, type);
  };

  const changeType = (t: string) => {
    const nextType = t as ReferralCodeType;
    if (nextType === type) return;
    setType(nextType);
    fetchData(1, nextType);
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Tabs value={type} onValueChange={changeType}>
          <TabsList>
            <TabsTrigger value="all" disabled={isPending}>
              All
            </TabsTrigger>
            <TabsTrigger value="admin" disabled={isPending}>
              Admin
            </TabsTrigger>
            <TabsTrigger value="customer" disabled={isPending}>
              Customer
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm transition-opacity",
          isPending && "opacity-60",
        )}
      >
        {/* Desktop / Tablet table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Code</TableHead>
                <TableHead className="w-[15%]">Type</TableHead>
                <TableHead className="w-[15%]">Uses</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[15%]">Expires</TableHead>
                <TableHead className="w-[5%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((row) => {
                const active = computeActive(row);
                return (
                  <TableRow key={row._id.toString()}>
                    <TableCell className="font-semibold tracking-tight">
                      {row.code}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-xs capitalize",
                          row.type === "admin"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                        )}
                        variant="secondary"
                      >
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {usageText(row.uses ?? null, row.maxUses ?? null)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-xs",
                          active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                        )}
                        variant="secondary"
                      >
                        {active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(row.expiresAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ReferralCodeDialogForm usage="update" data={row} />
                    </TableCell>
                  </TableRow>
                );
              })}

              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No referral codes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <div className="divide-y">
            {data.map((row) => {
              const active = computeActive(row);
              return (
                <div key={row._id.toString()} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {row.code}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">
                        Type: {row.type}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Uses: {usageText(row.uses ?? null, row.maxUses ?? null)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expires: {formatDate(row.expiresAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-xs",
                          active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                        )}
                        variant="secondary"
                      >
                        {active ? "Active" : "Inactive"}
                      </Badge>
                      <ReferralCodeDialogForm usage="update" data={row} />
                    </div>
                  </div>
                </div>
              );
            })}

            {data.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No referral codes found.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    className={cn(
                      (currentPage === 1 || isPending) &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>

                {pageList.map((p, idx) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(p);
                        }}
                        className={cn(isPending && "pointer-events-none")}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    className={cn(
                      (currentPage === totalPages || isPending) &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}