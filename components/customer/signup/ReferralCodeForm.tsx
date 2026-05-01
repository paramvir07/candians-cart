"use client";

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
    <div className="w-full space-y-4">
      <form action={formAction} className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
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
              className="pl-10 pr-14 h-11 rounded-xl text-sm tracking-[0.2em] uppercase placeholder:tracking-normal placeholder:normal-case placeholder:text-muted-foreground font-mono border-border focus-visible:ring-1 focus-visible:ring-primary transition-all"
            />
            {/* Character counter */}
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
          className="w-full h-11 rounded-full font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" /> Validating…
            </span>
          ) : (
            <div className="flex items-center gap-2">Continue <ChevronRight/></div>
          )}
        </Button>
      </form>

      {/* Helper note */}
      <p className="text-xs text-muted-foreground text-center">
        Need a code? Ask an existing Candian&apos;s Cart family member to share theirs.
      </p>
    </div>
  );
}