"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ChevronLeft,
  ShieldCheck,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sendPhoneOTPAction } from "@/actions/auth/verifiyPhone.actions";

type Step = "verify-phone" | "otp" | "password";

type Props = {
  phoneNumber: string; // verified phone number from session, e.g. "+16041234567"
};

export default function ChangePasswordForm({ phoneNumber }: Props) {
  const router = useRouter();

  // ── Step state ──
  const [step, setStep] = useState<Step>("verify-phone");

  // ── OTP state ──
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [isPendingSend, startSend] = useTransition();
  const [isPendingVerify, startVerify] = useTransition();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Password state ──
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Masked phone for display: +16041234567 → (604) ***-**67
const maskedPhone = phoneNumber
  ? phoneNumber
      .replace(/\D/g, "") // removes +, (, ), -, spaces
      .replace(/^1?(\d{3})(\d{3})(\d{2})(\d{2})$/, "($1) ***-**$4")
  : "";

  // ── Countdown timer ──
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [resendTimer]);

  // ── WebOTP API for Android Chrome ──
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
      .then((credential: any) => {
        if (credential?.code) {
          const digits = credential.code.replace(/\D/g, "").slice(0, 6);
          const filled = digits.split("").concat(Array(6).fill("")).slice(0, 6);
          setOtp(filled);
          if (digits.length === 6) handleVerifyOTP(digits);
        }
      })
      .catch(() => {});
    return () => abortRef.current?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleSendOTP = () => {
    startSend(async () => {
      const result = await sendPhoneOTPAction(phoneNumber);
      if (result.success) {
        toast.success("Verification code sent!");
        setOtpSent(true);
        setStep("otp");
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleVerifyOTP = (code?: string) => {
    const finalCode = code ?? otp.join("");
    if (finalCode.length !== 6) { toast.error("Please enter the full 6-digit code"); return; }
    startVerify(async () => {
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber,
        code: finalCode,
        disableSession: false,
      });
      if (error) {
        toast.error("Invalid or expired code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        toast.success("Phone verified! You can now change your password.");
        setStep("password");
      }
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "Enter") { e.preventDefault(); handleVerifyOTP(); }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    startSend(async () => {
      const result = await sendPhoneOTPAction(phoneNumber);
      if (result.success) {
        toast.success("New code sent!");
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(30);
        otpRefs.current[0]?.focus();
      } else {
        toast.error(result.message);
      }
    });
  };

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { setError("New passwords don't match."); return; }
    if (next.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Something went wrong.");
    } else {
      setSuccess(true);
    }
  }

  const passwordFields = [
    { label: "Current password", value: current, setter: setCurrent, show: showCurrent, toggle: () => setShowCurrent((v) => !v), placeholder: "Enter your current password" },
    { label: "New password", value: next, setter: setNext, show: showNext, toggle: () => setShowNext((v) => !v), placeholder: "At least 8 characters" },
    { label: "Confirm new password", value: confirm, setter: setConfirm, show: showConfirm, toggle: () => setShowConfirm((v) => !v), placeholder: "Repeat your new password" },
  ];

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Password updated!</h1>
          <p className="text-sm text-muted-foreground">
            You've been signed out of all other devices for your security.
          </p>
          <Button
            className="w-full h-11 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            onClick={() => router.push("/customer/profile")}
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/60">
        <Link
          href="/customer/profile/edit"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Change Password</h1>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-5">

          {/* ── Step 1: Send OTP ── */}
          {step === "verify-phone" && (
            <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div
                className="px-5 sm:px-6 py-4 border-b border-border/60 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, oklch(0.9669 0.0287 158.0617) 0%, oklch(1 0 0) 100%)" }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-widest">Verify It's You</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">We'll send a code to your phone first</p>
                </div>
              </div>
              <div className="px-5 sm:px-6 py-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Before changing your password, we need to confirm it's really you. We'll send a 6-digit code to your verified number ending in{" "}
                  <span className="font-semibold text-foreground">{maskedPhone}</span>.
                </p>
                <Button
                  onClick={handleSendOTP}
                  disabled={isPendingSend}
                  className="w-full h-11 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  {isPendingSend ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : "Send verification code"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Enter OTP ── */}
          {step === "otp" && (
            <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div
                className="px-5 sm:px-6 py-4 border-b border-border/60 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, oklch(0.9669 0.0287 158.0617) 0%, oklch(1 0 0) 100%)" }}
              >
                <button
                  onClick={() => { setStep("verify-phone"); setOtp(["", "", "", "", "", ""]); }}
                  className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-primary" />
                </button>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-widest">Enter Code</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sent to {maskedPhone}</p>
                </div>
              </div>
              <div className="px-5 sm:px-6 py-6 space-y-5">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code we sent to <span className="font-semibold text-foreground">{maskedPhone}</span>.
                </p>

                {/* OTP boxes */}
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
                  <div
                    className="grid gap-2 mb-4"
                    style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={cn(
                          "w-full aspect-square rounded-xl border text-center text-xl font-semibold",
                          "border-border bg-background text-foreground",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                          "transition-colors",
                          digit && "border-primary/50 bg-primary/5"
                        )}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Didn't receive it?{" "}
                    {resendTimer > 0 ? (
                      <span className="text-foreground font-medium">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isPendingSend}
                        className="text-primary hover:underline font-medium disabled:opacity-50"
                      >
                        {isPendingSend ? "Sending..." : "Resend code"}
                      </button>
                    )}
                  </p>

                  <Button
                    type="submit"
                    disabled={isPendingVerify || otp.join("").length !== 6}
                    className="w-full h-11 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    {isPendingVerify ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying…</> : "Verify & Continue"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ── Step 3: Change Password ── */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <div
                  className="px-5 sm:px-6 py-4 border-b border-border/60 flex items-center gap-3"
                  style={{ background: "linear-gradient(135deg, oklch(0.9669 0.0287 158.0617) 0%, oklch(1 0 0) 100%)" }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <KeyRound className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-widest">Security</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Update your account password</p>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-5 space-y-4">
                  {passwordFields.map(({ label, value, setter, show, toggle, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          required
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                        >
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium px-1">{error}</p>}

              <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  🔒 For your security, all other active sessions will be signed out when you update your password.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 gap-3">
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px]">i</span>
                  Changes save immediately
                </span>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none h-10 px-5 rounded-full text-sm font-semibold"
                    onClick={() => router.push("/customer/profile/edit")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none h-10 px-6 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save changes"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}