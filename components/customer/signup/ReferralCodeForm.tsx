"use client";

import { KeyRound } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useActionState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { validateReferralCodeAction } from "@/actions/customer/validateReferralCode.actions";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { referralCodeAtom, stepAtom } from "@/atoms/customer/signUp";

const initialState = {
  success: false,
  message: "",
  referralCodeAtom: "",
};

export function ReferralCodeForm() {
  const setStep = useSetAtom(stepAtom);
  const setReferralCode = useSetAtom(referralCodeAtom);
  const [state, formAction, isPending] = useActionState(
    validateReferralCodeAction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        if (state.referralCode) {
          toast.success(state.message);
          setReferralCode(state.referralCode);
          setStep("signUpForm");
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="w-full space-y-6">
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="code"
          name="code"
          placeholder="e.g. WELCOME2024"
          required
          minLength={10}
          maxLength={12}
          className="pl-10"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Spinner /> : "Continue"}
      </Button>
    </form>
  );
}
