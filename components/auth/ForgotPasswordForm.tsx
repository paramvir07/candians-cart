"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import {
  sendForgotPasswordOTPAction,
  verifyForgotPasswordOTPAction,
  resetPasswordWithPhoneAction,
} from "@/actions/auth/forgotPassword.actions";
import {
  Phone,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { getPasswordChecks } from "@/zod/schemas/customer/customerSignup";

type Step = "phone" | "otp" | "password";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");

  // Phone step
  const [phoneNumber, setPhoneNumber] = useState("");
  const [e164Phone, setE164Phone] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);

  // OTP step
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Password step
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const passwordChecks = getPasswordChecks(newPassword);
  const isPasswordStrong = passwordChecks.every((check) => check.valid);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [resendTimer]);

  // WebOTP API
  useEffect(() => {
    if (step !== "otp") return;
    if (!("OTPCredential" in window)) return;
    abortRef.current = new AbortController();
    navigator.credentials
      .get({
        // @ts-ignore
        otp: { transport: ["sms"] },
        signal: abortRef.current.signal,
      })
      .then((c: any) => {
        if (c?.code) {
          const digits = c.code.replace(/\D/g, "").slice(0, 6);
          const filled = digits.split("").concat(Array(6).fill("")).slice(0, 6);
          setOtp(filled);
          if (digits.length === 6) handleVerifyOTP(digits);
        }
      })
      .catch(() => {});
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Phone formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length === 11 && raw.startsWith("1")) raw = raw.slice(1);
    const digits = raw.slice(0, 10);
    let formatted = digits;
    if (digits.length >= 7)
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    else if (digits.length >= 4)
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    else if (digits.length >= 1) formatted = `(${digits}`;
    setPhoneNumber(formatted);
    setE164Phone(digits.length === 10 ? `+1${digits}` : "");
  };

  const handleSendOTP = async () => {
    if (!e164Phone) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setSendingOTP(true);
    const result = await sendForgotPasswordOTPAction(e164Phone);
    setSendingOTP(false);
    if (result.success) {
      toast.success("Verification code sent!");
      setStep("otp");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      toast.error(result.message);
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    const finalCode = code ?? otp.join("");
    if (finalCode.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setVerifyingOTP(true);
    const result = await verifyForgotPasswordOTPAction(e164Phone, finalCode);
    setVerifyingOTP(false);
    if (result.success && result.resetToken) {
      setResetToken(result.resetToken);
      setStep("password");
    } else {
      toast.error(result.message);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const n = [...otp];
    n[i] = digit;
    setOtp(n);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOTP();
    }
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const n = [...otp];
    for (let i = 0; i < 6; i++) n[i] = pasted[i] || "";
    setOtp(n);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setSendingOTP(true);
    const result = await sendForgotPasswordOTPAction(e164Phone);
    setSendingOTP(false);
    if (result.success) {
      toast.success("New code sent!");
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } else {
      toast.error(result.message);
    }
  };

  const handleResetPassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      toast.error("New password does not meet the strength requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setSavingPassword(true);

    const result = await resetPasswordWithPhoneAction(resetToken, newPassword);

    setSavingPassword(false);

    if (result.success) {
      toast.success(result.message);
      setSuccess(true);
    } else {
      toast.error(result.message);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col items-center justify-center text-center space-y-5 sm:min-h-[calc(100vh-5rem)]">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Password updated!
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              You can now sign in with your new password.
            </p>
          </div>
          <Button
            className="w-full h-11 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            onClick={() => router.push("/customer/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center sm:min-h-[calc(100vh-5rem)]">
        {/* Logo */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <Logo variant="icon" href="/" />
        </div>

        {/* Step 1: Phone */}
        {step === "phone" && (
          <>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Forgot password?
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              Enter your verified phone number and we'll send you a code to
              reset your password.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOTP();
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-2">
                <div className="flex h-12 items-center justify-center rounded-xl border border-border bg-muted px-2 text-sm font-medium select-none">
                  🇨🇦 +1
                </div>
                <Input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(604) 123-4567"
                  className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary flex-1"
                />
              </div>
              <Button
                type="submit"
                disabled={sendingOTP || !e164Phone}
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {sendingOTP ? <Spinner /> : "Send verification code"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Remembered it?{" "}
              <a
                href="/customer/login"
                className="text-primary hover:underline font-medium"
              >
                Back to login
              </a>
            </p>
          </>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <>
            <button
              onClick={() => {
                setStep("phone");
                setOtp(["", "", "", "", "", ""]);
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={15} /> Change number
            </button>

            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Enter the code
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              Sent to{" "}
              <span className="font-medium text-foreground">{phoneNumber}</span>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOTP();
              }}
              className="flex flex-col gap-5"
            >
              <div
                className="grid grid-cols-6 gap-1.5 sm:gap-2"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={cn(
                      "h-11 w-full rounded-xl border text-center text-lg font-semibold sm:h-12 sm:text-xl",
                      "border-border bg-background text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors",
                      digit && "border-primary/50 bg-primary/5",
                    )}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground -mt-1">
                Didn't receive it?{" "}
                {resendTimer > 0 ? (
                  <span className="text-foreground font-medium">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={sendingOTP}
                    className="text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    {sendingOTP ? "Sending..." : "Resend code"}
                  </button>
                )}
              </p>

              <Button
                type="submit"
                disabled={verifyingOTP || otp.join("").length !== 6}
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {verifyingOTP ? <Spinner /> : "Verify code"}
              </Button>
            </form>
          </>
        )}

        {/* Step 3: New password */}
        {step === "password" && (
          <>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              Choose a strong password for your account.
            </p>

            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-4"
            >
              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong new password"
                    autoComplete="new-password"
                    minLength={8}
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-3 rounded-2xl border border-border/60 bg-secondary/30 px-3 py-3 sm:px-4 space-y-2">
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                    Password must include:
                  </p>

                  <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-x-3">
                    {passwordChecks.map((check) => {
                      const shouldShowError =
                        newPassword.length > 0 && !check.valid;

                      return (
                        <div
                          key={check.label}
                          className="flex min-w-0 items-center gap-2 text-[11px]"
                        >
                          {check.valid ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          ) : (
                            <Circle
                              className={
                                shouldShowError
                                  ? "h-3.5 w-3.5 text-red-400 shrink-0"
                                  : "h-3.5 w-3.5 text-muted-foreground/50 shrink-0"
                              }
                            />
                          )}

                          <span
                            className={
                              check.valid
                                ? "min-w-0 font-medium text-primary"
                                : shouldShowError
                                  ? "min-w-0 font-medium text-red-400"
                                  : "min-w-0 font-medium text-muted-foreground"
                            }
                          >
                            {check.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p
                    className={
                      passwordsMatch
                        ? "mt-1.5 text-[11px] font-medium text-primary"
                        : "mt-1.5 text-[11px] font-medium text-red-400"
                    }
                  >
                    {passwordsMatch
                      ? "Passwords match."
                      : "Passwords do not match."}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={
                  savingPassword || !isPasswordStrong || !passwordsMatch
                }
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all mt-1"
              >
                {savingPassword ? <Spinner /> : "Update password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
