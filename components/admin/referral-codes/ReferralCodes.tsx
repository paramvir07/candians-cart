"use client";

import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReferralCode } from "@/types/admin/referralCode";
import { ReferralCodeDialogForm } from "./ReferralCodeDialogForm";

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

export function ReferralCodes({ data }: { data: ReferralCode[] }) {
  return (
    <div className="w-full">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {/* Desktop / Tablet table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Code</TableHead>
                <TableHead className="w-[20%]">Uses</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
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
                    colSpan={5}
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
      </div>
    </div>
  );
}
