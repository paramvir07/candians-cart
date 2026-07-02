"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { MapPin } from "lucide-react";
import { CUSTOMER_PROVINCE } from "@/lib/customer/location";
import {
  AddressAutocomplete,
  ParsedAddress,
} from "@/components/shared/AddressAutocomplete";
import { editUserProfile } from "@/actions/customer/userEdit.action";

const UNIT_ADDRESS_SEPARATOR = "-";

function formatAddressWithUnit(street: string, unit: string) {
  const s = street.trim();
  const u = unit.trim();
  if (!u) return s;
  if (!s) return u;
  return `${u}${UNIT_ADDRESS_SEPARATOR}${s}`;
}

export function AddressRequiredDialog() {
  const [isPending, startTransition] = useTransition();
  const [addressData, setAddressData] = useState({
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [aptUnit, setAptUnit] = useState("");

  const composedAddress = formatAddressWithUnit(addressData.address, aptUnit);
  const isComplete =
    !!addressData.address &&
    !!addressData.city &&
    !!addressData.province &&
    !!addressData.postalCode;

  const handleSelect = (parsed: ParsedAddress) => {
    setAddressData({
      address: parsed.streetAddress || "",
      city: parsed.city || "",
      province: parsed.province === CUSTOMER_PROVINCE ? parsed.province : "",
      postalCode: parsed.postalCode || "",
    });
  };

  const handleClear = () => {
    setAddressData({ address: "", city: "", province: "", postalCode: "" });
  };

  const handleSave = () => {
    if (!isComplete) {
      toast.error("Please search and select your address from the dropdown.");
      return;
    }

    const fd = new FormData();
    fd.set("address", composedAddress);
    fd.set("city", addressData.city);
    fd.set("province", addressData.province);
    fd.set("postalCode", addressData.postalCode);

    startTransition(async () => {
      const result = await editUserProfile(undefined as any, fd);
      if (result.success) {
        toast.success("Address saved! Welcome to Canadian's Cart.");
        // Hard reload so the page re-fetches with the new address
        window.location.reload();
      } else {
        toast.error(
          result.message ?? "Failed to save address. Please try again.",
        );
      }
    });
  };

  return (
    // Full-screen overlay — no close button, no backdrop click dismiss
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4.5 w-4.5 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">
              Set your delivery address
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We need your address before you can shop. Search below and pick your
            exact address from the list — city, province, and postal code will
            fill in automatically.
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2">
            ⚠ We currently only deliver within British Columbia, Canada.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {/* Apt/Unit + Street Address */}
          <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1.5">
                Apt / Unit{" "}
                <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                type="text"
                value={aptUnit}
                onChange={(e) => setAptUnit(e.target.value)}
                placeholder="e.g. 305"
                maxLength={10}
                className="h-11 rounded-xl border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1.5">
                Street Address — search &amp; pick from list
              </label>
              <AddressAutocomplete
                defaultValue={addressData.address}
                allowedProvince={CUSTOMER_PROVINCE}
                onSelect={handleSelect}
                onClear={handleClear}
                placeholder="e.g. 2750 Fuller Street"
                className="h-11 rounded-xl border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          {/* City / Province / Postal — read-only, auto-filled */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                City
              </label>
              <Input
                readOnly
                tabIndex={-1}
                value={addressData.city}
                placeholder="City"
                className="h-11 rounded-xl border-border/40 bg-secondary/30 px-3 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                Province
              </label>
              <Input
                readOnly
                tabIndex={-1}
                value={addressData.province}
                placeholder="Province"
                className="h-11 rounded-xl border-border/40 bg-secondary/30 px-3 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                Postal Code
              </label>
              <Input
                readOnly
                tabIndex={-1}
                value={addressData.postalCode}
                placeholder="V__ ___ "
                className="h-11 rounded-xl border-border/40 bg-secondary/30 px-3 text-sm uppercase text-muted-foreground cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Composed address preview */}
          {composedAddress && (
            <p className="text-[11px] text-muted-foreground px-1">
              Saving as:{" "}
              <span className="font-semibold text-foreground font-mono">
                {composedAddress}, {addressData.city}, {addressData.province}{" "}
                {addressData.postalCode}
              </span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isComplete}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isPending ? (
              <>
                <Spinner className="h-4 w-4" /> Saving…
              </>
            ) : (
              "Save & Continue Shopping"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
