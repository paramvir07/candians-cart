"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signupAction } from "@/actions/auth/signup.actions";
import { Eye, EyeOff } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useAtom } from "jotai";
import {
  budgetAtom,
  referralCodeAtom,
  storeIdAtom,
} from "@/atoms/customer/signUp";
import SelectStore from "../customer/signup/SelectStore";
import StoreSelected from "../customer/signup/StoreSelected";
import { StoreDocument } from "@/types/store/store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Logo from "../shared/Logo";
import { CUSTOMER_PROVINCE } from "@/lib/customer/location";
import {
  AddressAutocomplete,
  ParsedAddress,
} from "../shared/AddressAutocomplete";
import { HEARD_ABOUT_US_OPTIONS } from "@/lib/customer/heardAboutUs";

const initialState = { success: false, message: "" };

type SignupFormProps = {
  userRole: UserRole;
  stores?: StoreDocument[];
  className?: string;
  heardParam?: string;
};

export function SignupForm({
  userRole,
  stores,
  className,
  heardParam = "",
}: SignupFormProps) {
  const [budget] = useAtom(budgetAtom);
  const [storeId] = useAtom(storeIdAtom);
  const [referralCode] = useAtom(referralCodeAtom);

  const customer = userRole === "customer";
  const admin = userRole === "admin";
  const store = userRole === "store";
  const cashier = userRole === "cashier";

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    signupAction.bind(null, userRole),
    initialState,
  );

  const [addressData, setAddressData] = useState<{
    address: string;
    aptUnit: string;
    city: string;
    province: string;
    postalCode: string;
  }>({
    address: "",
    aptUnit: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const handleAddressSelect = (parsed: ParsedAddress) => {
    setAddressData((prev) => ({
      ...prev,
      address: parsed.streetAddress || "",
      city: parsed.city || "",
      province: parsed.province === CUSTOMER_PROVINCE ? parsed.province : "",
      postalCode: parsed.postalCode || "",
    }));
  };

  const handleAddressClear = () => {
    setAddressData((prev) => ({
      ...prev,
      address: "",
      city: "",
      province: "",
      postalCode: "",
    }));
  };

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        if (customer) {
          router.push("/verify-phone");
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state, customer, router]);

  const heading = store
    ? "Register a new store"
    : admin
      ? "Register a new admin"
      : cashier
        ? "Register a new cashier"
        : "Create your account";

  const subheading = store
    ? "Enter store details below to get started"
    : admin
      ? "Enter admin details to create access"
      : cashier
        ? "Enter cashier details to register"
        : "Join the Candian's Cart family today";

  const formContent = (
    <>
      {/* Logo + heading */}
      <div className="mb-7">
        <div className="h-12 flex items-center justify-left mb-6">
          <Logo variant="icon" href="/" />
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          {heading}
        </h1>

        <p className="text-sm text-muted-foreground">{subheading}</p>
      </div>

      {/* Form */}
      <form
        action={formAction}
        onSubmit={(e) => {
          if (customer && !addressData.address) {
            e.preventDefault();
            toast.error("Please select your address from the dropdown.");
          }
        }}
        className="flex flex-col gap-3.5"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-[11px] text-muted-foreground mb-1.5"
          >
            {store ? "Store name" : "Full name"}
          </label>

          <Input
            id="name"
            type="text"
            name="name"
            placeholder={
              store ? "e.g. Candian's Cart Surrey" : "e.g. John Smith"
            }
            required
            className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] text-muted-foreground mb-1.5"
          >
            Email address
          </label>

          <Input
            id="email"
            type="email"
            name="email"
            placeholder="e.g. john@example.com"
            required
            className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] text-muted-foreground mb-1.5"
          >
            Password
          </label>

          <div className="relative">
            <Input
              id="password"
              name="password"
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])(?=\S+$).{8,}"
              type={showPassword ? "text" : "password"}
              placeholder="e.g. John@123"
              required
              className="h-12 rounded-xl border-border bg-background px-4 pr-11 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />

            <Button
              variant="ghost"
              type="button"
              size="icon"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors h-auto w-auto p-0"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-1.5 px-0.5">
            Min. 8 characters with uppercase, number & special character.
          </p>
        </div>

        {/* Address */}
        {!admin && (
          <>
            {customer ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1.5">
                      Street address{" "}
                      <span className="text-muted-foreground/60">
                        — search &amp; pick from list
                      </span>
                    </label>

                    <AddressAutocomplete
                      defaultValue={addressData.address}
                      allowedProvince={CUSTOMER_PROVINCE}
                      onSelect={handleAddressSelect}
                      onClear={handleAddressClear}
                      placeholder="e.g. 123 Main St"
                      className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="aptUnit"
                      className="block text-[11px] text-muted-foreground mb-1.5"
                    >
                      Apt / Unit / Suite{" "}
                      <span className="text-muted-foreground/50">
                        (optional)
                      </span>
                    </label>

                    <Input
                      id="aptUnit"
                      type="text"
                      value={addressData.aptUnit}
                      onChange={(e) =>
                        setAddressData((prev) => ({
                          ...prev,
                          aptUnit: e.target.value,
                        }))
                      }
                      placeholder="e.g. 305"
                      maxLength={30}
                      autoComplete="address-line2"
                      className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Hidden inputs carry values to the server action */}
                <input
                  type="hidden"
                  name="aptUnit"
                  value={addressData.aptUnit.trim()}
                />
                <input
                  type="hidden"
                  name="address"
                  value={addressData.address.trim()}
                />
                <input type="hidden" name="city" value={addressData.city} />
                <input
                  type="hidden"
                  name="province"
                  value={addressData.province}
                />
                <input
                  type="hidden"
                  name="postalCode"
                  value={addressData.postalCode}
                />
              </>
            ) : (
              <div>
                <label
                  htmlFor="address"
                  className="block text-[11px] text-muted-foreground mb-1.5"
                >
                  {store ? "Store address" : "Address"}
                </label>

                <Input
                  id="address"
                  type="text"
                  name="address"
                  placeholder={
                    store ? "e.g. 123 Main St, Surrey" : "e.g. 305-123 Main St"
                  }
                  required
                  className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            )}
          </>
        )}

        {customer && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                City
              </label>
              <Input
                name="city"
                value={addressData.city}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="City"
                className="h-12 rounded-xl border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                Province
              </label>
              <Input
                name="province"
                value={addressData.province}
                onChange={(e) =>
                  setAddressData((prev) => ({
                    ...prev,
                    province: e.target.value.toUpperCase().slice(0, 2),
                  }))
                }
                placeholder="BC"
                maxLength={2}
                className="h-12 rounded-xl border-border bg-background px-3 text-sm uppercase placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground/70 mb-1.5">
                Postal Code
              </label>
              <Input
                name="postalCode"
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
                className="h-12 rounded-xl border-border bg-background px-3 text-sm uppercase font-mono placeholder:normal-case placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Heard about us */}
        {customer && (
          <>
            {heardParam ? (
              <input type="hidden" name="heardAboutUs" value={heardParam} />
            ) : (
              <div>
                <label
                  htmlFor="heardAboutUs"
                  className="block text-[11px] text-muted-foreground mb-1.5"
                >
                  How did you hear about us?
                </label>

                <select
                  id="heardAboutUs"
                  name="heardAboutUs"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>
                    Select an option
                  </option>

                  {HEARD_ABOUT_US_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Mobile */}
        {!admin && !customer && (
          <div>
            <label
              htmlFor="mobile"
              className="block text-[11px] text-muted-foreground mb-1.5"
            >
              Mobile number
            </label>

            <Input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="e.g. (604) 123-4567"
              required={store || cashier}
              maxLength={14}
              className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                let formatted = digits;

                if (digits.length >= 7) {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(
                    3,
                    6,
                  )}-${digits.slice(6)}`;
                } else if (digits.length >= 4) {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                } else if (digits.length >= 1) {
                  formatted = `(${digits}`;
                }

                e.target.value = formatted;
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  const input = e.currentTarget;
                  const pos = input.selectionStart ?? 0;

                  if ([")", " ", "-"].includes(input.value[pos - 1])) {
                    e.preventDefault();
                    input.value =
                      input.value.slice(0, pos - 1) + input.value.slice(pos);
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                }
              }}
              pattern="\(\d{3}\) \d{3}-\d{4}"
            />
          </div>
        )}

        {/* Cashier store picker */}
        {cashier && (
          <>
            <SelectStore stores={stores || []} userRole="cashier" />
            <StoreSelected userRole="cashier" />
          </>
        )}

        {/* Hidden customer fields */}
        {customer && (
          <>
            <Input
              id="monthlyBudget"
              type="hidden"
              name="monthlyBudget"
              value={budget ?? ""}
              required
            />

            <Input
              id="referralCode"
              type="hidden"
              name="referralCode"
              value={referralCode ?? ""}
              required
            />
          </>
        )}

        {(customer || cashier) && (
          <Input
            id="associatedStore"
            type="hidden"
            name="associatedStore"
            value={storeId.toString() || ""}
            required={customer || cashier}
          />
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all mt-2 flex items-center justify-center"
        >
          {isPending ? <Spinner /> : "Create Account"}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-1.5">
        {customer && (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/customer/login"
              className="text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE ── */}
      <div
        className={cn(
          "flex flex-col w-full lg:hidden min-h-screen overflow-hidden",
          className,
        )}
      >
        <div className="relative w-full h-[40vh] shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80"
            alt="Fresh groceries"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative z-10 -mt-45 flex-1 bg-background rounded-t-3xl px-6 pt-8 pb-12 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          {formContent}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className={cn("hidden lg:block w-full max-w-sm", className)}>
        {formContent}
      </div>
    </>
  );
}
