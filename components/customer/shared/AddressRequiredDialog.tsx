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
import { updateAddressAction } from "@/actions/customer/updateAddress.action";

export function AddressRequiredDialog() {
  const [isPending, startTransition] = useTransition();

  const [addressData, setAddressData] = useState({
    aptUnit: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

const isComplete =
  !!addressData.address &&
  !!addressData.city.trim() &&
  !!addressData.province.trim() &&
  !!addressData.postalCode.trim();

  const handleSelect = (parsed: ParsedAddress) => {
    setAddressData((prev) => ({
      ...prev,
      address: parsed.streetAddress || "",
      city: parsed.city || "",
      province: parsed.province === CUSTOMER_PROVINCE ? parsed.province : "",
      postalCode: parsed.postalCode || "",
    }));
  };

  const handleClear = () => {
    setAddressData((prev) => ({
      ...prev,
      address: "",
      city: "",
      province: "",
      postalCode: "",
    }));
  };

  const handleSave = () => {
    if (!isComplete) {
      toast.error("Please search and select your address from the dropdown.");
      return;
    }

    const fd = new FormData();

    fd.set("aptUnit", addressData.aptUnit.trim());
    fd.set("address", addressData.address.trim());
    fd.set("city", addressData.city);
    fd.set("province", addressData.province);
    fd.set("postalCode", addressData.postalCode);

    startTransition(async () => {
      const result = await updateAddressAction(undefined, fd);

      if (result.success) {
        toast.success(
          "Address added successfully! You can now continue shopping.",
        );
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border/60 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground leading-snug">
              Set your address
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-3">
          {/* Street Address */}
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">
              Street Address{" "}
              <span className="text-muted-foreground/60">
                — search &amp; pick from list
              </span>
            </label>

            <AddressAutocomplete
              defaultValue={addressData.address}
              allowedProvince={CUSTOMER_PROVINCE}
              onSelect={handleSelect}
              onClear={handleClear}
              placeholder="e.g. 123 Main St"
              className="h-11 rounded-xl border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>
          {/* Apt / Unit */}
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">
              Apt / Unit / Suite{" "}
              <span className="text-muted-foreground/50">(optional)</span>
            </label>

            <Input
              type="text"
              value={addressData.aptUnit}
              onChange={(e) =>
                setAddressData((prev) => ({
                  ...prev,
                  aptUnit: e.target.value,
                }))
              }
              placeholder="e.g. 308"
              maxLength={30}
              autoComplete="address-line2"
              className="h-11 rounded-xl border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          {/* City / Province / Postal — read-only */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                City
              </label>
              <Input
                value={addressData.city}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="City"
                className="h-11 rounded-xl border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                Province
              </label>
              <Input
                value={addressData.province}
                onChange={(e) =>
                  setAddressData((prev) => ({
                    ...prev,
                    province: e.target.value.toUpperCase().slice(0, 2),
                  }))
                }
                placeholder="BC"
                maxLength={2}
                className="h-11 rounded-xl border-border bg-background px-3 text-sm uppercase placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                Postal Code
              </label>
              <Input
                value={addressData.postalCode}
                onChange={(e) => {
                  let raw = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6);
                  if (raw.length > 3)
                    raw = `${raw.slice(0, 3)} ${raw.slice(3)}`;
                  setAddressData((prev) => ({ ...prev, postalCode: raw }));
                }}
                placeholder="V__ ___"
                maxLength={7}
                className="h-11 rounded-xl border-border bg-background px-3 text-sm uppercase font-mono placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
          {/* Preview */}
          <div className="min-h-[32px] px-0.5">
            {addressData.address && (
              <p className="text-[11px] text-muted-foreground break-words leading-snug">
                Saving as:{" "}
                <span className="font-semibold text-foreground font-mono">
                  {addressData.address}
                  {addressData.aptUnit
                    ? `, Apt/Unit ${addressData.aptUnit.trim()}`
                    : ""}
                  {addressData.city ? `, ${addressData.city}` : ""}
                  {addressData.province ? `, ${addressData.province}` : ""}
                  {addressData.postalCode ? ` ${addressData.postalCode}` : ""}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
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
