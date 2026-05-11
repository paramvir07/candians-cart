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

const initialState = { success: false, message: "" };

type SignupFormProps = {
  userRole: UserRole;
  stores?: StoreDocument[];
  className?: string;
};

export function SignupForm({ userRole, stores, className }: SignupFormProps) {
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

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        userRole ? router.push(`/${userRole}`) : router.push("/customer/login");
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

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
      <form action={formAction} className="flex flex-col gap-3">
        {/* Name */}
        <Input
          id="name"
          type="text"
          name="name"
          placeholder={store ? "Store Name" : "Full Name"}
          required
          className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
        />

        {/* Email */}
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          required
          className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
        />

        {/* Password */}
        <div className="relative">
          <Input
            id="password"
            name="password"
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
        <p className="text-[11px] text-muted-foreground -mt-1 px-1">
          Min. 8 chars with uppercase, number & special character.
        </p>

        {/* Address */}
        {!admin && (
          <Input
            id="address"
            type="text"
            name="address"
            placeholder={
              store ? "Full Store Address" : "Address (e.g. 308-123 Main St)"
            }
            required={customer || store || cashier}
            className={cn(
              "h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary",
            )}
          />
        )}

        {/* City + Province — customer only */}
        {/* {customer && (
          <div className="flex gap-3">
            <Input
              id="city"
              type="text"
              name="city"
              placeholder="City"
              required
              className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Input
              id="province"
              type="text"
              name="province"
              placeholder="Province"
              required
              className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary w-28"
            />
          </div>
        )} */}
        {/* City + Province — customer only */}
{customer && (
  <div className="flex gap-3">
    <select
      id="city"
      name="city"
      required
      defaultValue=""
      className="flex-1 h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="" disabled>City</option>
      {[
        "Vancouver", "Burnaby", "New Westminster", "Coquitlam",
        "Port Coquitlam", "Port Moody", "Surrey", "Delta", "Langley",
        "Maple Ridge", "Pitt Meadows", "Abbotsford", "Mission",
        "Chilliwack", "Agassiz", "Hope",
      ].map((city) => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>

    <select
      id="province"
      name="province"
      required
      defaultValue="BC"
      className="w-28 h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="BC">BC</option>
    </select>
  </div>
)}

        {/* Mobile */}
        {!admin && (
          <Input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="Mobile Number (10 digits)"
            required={customer || store || cashier}
            pattern="[0-9]{10}"
            maxLength={10}
            className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
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
          <>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/customer/login"
                className="text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE: image top, form slides up ── */}
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

        {/* Form card — overlaps image */}
        <div className="relative z-10 -mt-45 flex-1 bg-background rounded-t-3xl px-6 pt-8 pb-12 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          {formContent}
        </div>
      </div>

      {/* ── DESKTOP: plain form, carousel handled by page ── */}
      <div className={cn("hidden lg:block w-full max-w-sm", className)}>
        {formContent}
      </div>
    </>
  );
}
