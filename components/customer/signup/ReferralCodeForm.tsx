"use client";

import { KeyRound, Sparkles, Users } from "lucide-react";
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

export function ReferralCodeForm() {
  const setStep = useSetAtom(stepAtom);
  const setReferralCode = useSetAtom(referralCodeAtom);
  const [value, setValue] = useState("");
  const [state, formAction, isPending] = useActionState(
    validateReferralCodeAction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      if (state.success && state.referralCode) {
        toast.success(state.message);
        setReferralCode(state.referralCode);
        setStep("signUpForm");
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const charCount = value.length;
  const maxLength = 12;
  const minLength = 10;
  const isReady = charCount >= minLength;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Enter Referral Code</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You'll need a referral code from an existing family member to join.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Input with character counter */}
        <div className="space-y-1.5">
          <div className="relative group">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 z-10" />
            <Input
              id="code"
              name="code"
              placeholder="e.g. WELCOME2024"
              required
              minLength={minLength}
              maxLength={maxLength}
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              className="pl-10 pr-14 h-11 text-sm tracking-[0.2em] uppercase placeholder:tracking-normal placeholder:normal-case placeholder:text-muted-foreground font-mono focus:border-primary transition-all"
            />
            {/* Character counter badge */}
            <div
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums transition-colors ${
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

          {/* Segmented progress bar */}
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
          className="w-full h-11 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:scale-100"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" /> Validating…
            </span>
          ) : (
            "Continue →"
          )}
        </Button>
      </form>

      {/* Helper text */}
      {/* <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 flex items-start gap-3">
        <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Don't have a code?{" "}
          <a
            href="/family-sponsors"
            className="text-primary hover:underline underline-offset-4 font-medium"
          >
            Find a sponsor family in your city
          </a>{" "}
          to get access to Canadian's Cart.
        </p>
      </div> */}
    </div>
  );
}
