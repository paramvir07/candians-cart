"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { StoreDocument } from "@/types/store/store";
import { CustomerFilters } from "@/actions/admin/customers/getCustomers.action";
import type { EventParticipantStatus } from "@/db/models/customer/customer.model";

const THREE_STATE = ["any", "yes", "no"] as const;
type ThreeState = (typeof THREE_STATE)[number];

const boolToState = (v: boolean | undefined): ThreeState =>
  v === undefined ? "any" : v ? "yes" : "no";

const stateToBool = (v: ThreeState): boolean | undefined =>
  v === "any" ? undefined : v === "yes";

function ThreeStateToggle({
  value,
  onChange,
}: {
  value: ThreeState;
  onChange: (v: ThreeState) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden text-xs shrink-0">
      {THREE_STATE.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`px-2.5 py-1.5 font-medium transition-colors ${
            value === s
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          {s === "any" ? "Any" : s === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

/** Number of filters currently applied — used for the badge on the trigger button. */
export function countActiveCustomerFilters(f: CustomerFilters): number {
  let n = 0;
  if (f.storeId) n++;
  if (f.walletMin !== undefined || f.walletMax !== undefined) n++;
  if (f.referralCodeEnabled !== undefined) n++;
  if (f.placedFirstOrder !== undefined) n++;
  if (f.eventParticipant) n++;
  if (f.city) n++;
  if (f.hasCartItems !== undefined) n++;
  return n;
}

interface CustomerFiltersSheetProps {
  filters: CustomerFilters;
  onApply: (filters: CustomerFilters) => void;
  stores: StoreDocument[];
  eventParticipantOptions: EventParticipantStatus[];
  cityOptions: string[];
}

export function CustomerFiltersSheet({
  filters,
  onApply,
  stores,
  eventParticipantOptions,
  cityOptions,
}: CustomerFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CustomerFilters>(filters);

  // Re-sync draft with the applied filters whenever the sheet is (re)opened
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const activeCount = countActiveCustomerFilters(filters);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft({});
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 relative shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filter Customers</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-4">
          {/* Store */}
          <div className="space-y-2">
            <Label>Store</Label>
            <Select
              value={draft.storeId ?? "all"}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  storeId: v === "all" ? undefined : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stores</SelectItem>
                {stores.map((s) => (
                  <SelectItem key={s._id.toString()} value={s._id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wallet balance range */}
          <div className="space-y-2">
            <Label>Wallet Balance (CA$)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Min"
                value={
                  draft.walletMin !== undefined
                    ? (draft.walletMin / 100).toString()
                    : ""
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    walletMin:
                      e.target.value === ""
                        ? undefined
                        : Math.round(Number(e.target.value) * 100),
                  }))
                }
              />
              <span className="text-muted-foreground text-xs shrink-0">to</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Max"
                value={
                  draft.walletMax !== undefined
                    ? (draft.walletMax / 100).toString()
                    : ""
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    walletMax:
                      e.target.value === ""
                        ? undefined
                        : Math.round(Number(e.target.value) * 100),
                  }))
                }
              />
            </div>
          </div>

          {/* Referral code enabled */}
          <div className="flex items-center justify-between">
            <Label>Referral Code Enabled</Label>
            <ThreeStateToggle
              value={boolToState(draft.referralCodeEnabled)}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  referralCodeEnabled: stateToBool(v),
                }))
              }
            />
          </div>

          {/* Placed first order */}
          <div className="flex items-center justify-between">
            <Label>Placed First Order</Label>
            <ThreeStateToggle
              value={boolToState(draft.placedFirstOrder)}
              onChange={(v) =>
                setDraft((d) => ({ ...d, placedFirstOrder: stateToBool(v) }))
              }
            />
          </div>

          {/* Has items in cart */}
          <div className="flex items-center justify-between">
            <Label>Has Items In Cart</Label>
            <ThreeStateToggle
              value={boolToState(draft.hasCartItems)}
              onChange={(v) =>
                setDraft((d) => ({ ...d, hasCartItems: stateToBool(v) }))
              }
            />
          </div>

          {/* Event participation */}
          <div className="space-y-2">
            <Label>Event Participation</Label>
            <Select
              value={draft.eventParticipant ?? "any"}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  eventParticipant:
                    v === "any" ? undefined : (v as EventParticipantStatus),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {eventParticipantOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>City</Label>
            <Select
              value={draft.city ?? "any"}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, city: v === "any" ? undefined : v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any city" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="any">Any city</SelectItem>
                {cityOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
