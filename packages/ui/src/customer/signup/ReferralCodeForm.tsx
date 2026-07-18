"use client";

import NextLink from "next/link";
import { ChevronRight, KeyRound } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useActionState, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { validateReferralCodeAction } from "@/actions/customer/validateReferralCode.actions";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { referralCodeAtom, stepAtom } from "@/atoms/customer/signUp";

const initialState = {
  success: false,
  message: "",
  referralCode: "",
};

export function ReferralCodeForm({
  initialReferralCode = "",
}: {
  initialReferralCode?: string;
}) {
  const setStep = useSetAtom(stepAtom);
  const setReferralCode = useSetAtom(referralCodeAtom);

  const [value, setValue] = useState(initialReferralCode.toUpperCase());

  const [state, formAction, isPending] = useActionState(
    validateReferralCodeAction,
    initialState,
  );

  useEffect(() => {
    if (initialReferralCode) {
      setValue(initialReferralCode.toUpperCase());
    }
  }, [initialReferralCode]);

  useEffect(() => {
    if (!state.message) return;

    if (state.success && state.referralCode) {
      toast.success(state.message);
      setReferralCode(state.referralCode);
      setStep("location");
    } else {
      toast.error(state.message);
    }
  }, [state, setReferralCode, setStep]);

  const maxLength = 12;
  const minLength = 8;
  const charCount = value.length;
  const isReady = charCount >= minLength;

  return (
    <div className="w-full space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <div className="relative group">
            <KeyRound className="absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />

            <Input
              id="code"
              name="code"
              placeholder="e.g. WELCOMETOCC"
              required
              minLength={minLength}
              maxLength={maxLength}
              value={value}
              onChange={(e) => setValue(e.target.value.trim().toUpperCase())}
              className="h-11 rounded-xl border-border pl-10 pr-14 font-mono text-sm uppercase tracking-[0.2em] transition-all placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />

            <div
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs tabular-nums transition-colors ${
                charCount === 0
                  ? "text-muted-foreground/40"
                  : isReady
                    ? "text-emerald-500"
                    : "text-amber-500"
              }`}
            >
              {charCount}/{maxLength}
            </div>
          </div>

          <div className="flex gap-1">
            {Array.from({ length: maxLength }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${
                  i < charCount
                    ? isReady
                      ? "bg-emerald-500"
                      : "bg-amber-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !isReady}
          className="h-11 w-full rounded-full font-semibold shadow-md shadow-primary/20 transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Validating…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Need a referral code?{" "}
        <NextLink href="/referrals" className="text-primary font-semibold underline underline-offset-2">
          Request one here
        </NextLink>{" "}
        from an existing customer.
      </p>
    </div>
  );
}
