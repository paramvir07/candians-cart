"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import {
  sendPhoneOTPAction,
} from "@/actions/auth/verifiyPhone.actions";
import { Phone, ArrowLeft, ShieldCheck } from "lucide-react";

type Step = "phone" | "otp";

type Props = {
  userName: string;
};

export function VerifyPhoneClient({ userName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [e164Phone, setE164Phone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [isPendingSend, startSend] = useTransition();
  const [isPendingVerify, startVerify] = useTransition();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length >= 7) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 4) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length >= 1) {
      formatted = `(${digits}`;
    }
    setPhoneNumber(formatted);
    setE164Phone(digits.length === 10 ? `+1${digits}` : "");
  };

  const handleSendOTP = () => {
    if (!e164Phone) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    startSend(async () => {
      const result = await sendPhoneOTPAction(e164Phone);
      if (result.success) {
        toast.success("Verification code sent!");
        setStep("otp");
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        toast.error(result.message);
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

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

const handleVerify = () => {
  const code = otp.join("");
  if (code.length !== 6) {
    toast.error("Please enter the full 6-digit code");
    return;
  }
  startVerify(async () => {
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: e164Phone,
      code,
      disableSession: false,
    });
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } else {
      toast.success("Phone verified! Welcome to Candian’s Cart 🎉");
      router.push("/customer");
      router.refresh();
    }
  });
};

  const handleResend = () => {
    if (resendTimer > 0) return;
    startSend(async () => {
      const result = await sendPhoneOTPAction(e164Phone);
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

  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8">
          <Logo variant="icon" href="/" />
        </div>

        {step === "phone" ? (
          <>
            {/* Icon */}
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Phone className="w-5 h-5 text-primary" />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Verify your phone
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              Hi {firstName}! We need to verify your phone number before you can
              access the app.
            </p>

            {/* Phone input */}
            <div className="flex gap-2 mb-2">
              <div className="h-12 px-3 flex items-center justify-center rounded-xl border border-border bg-muted text-sm font-medium text-foreground shrink-0 select-none">
                🇨🇦 +1
              </div>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(604) 123-4567"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendOTP();
                }}
                className="h-12 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary flex-1"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mb-5 px-1">
              Enter your Canadian mobile number. We'll send a 6-digit code via
              SMS.
            </p>

            <Button
              onClick={handleSendOTP}
              disabled={isPendingSend || !e164Phone}
              className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {isPendingSend ? <Spinner /> : "Send verification code"}
            </Button>
          </>
        ) : (
          <>
            {/* Back */}
            <button
              onClick={() => {
                setStep("phone");
                setOtp(["", "", "", "", "", ""]);
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={15} />
              Change number
            </button>

            {/* Icon */}
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Enter the code
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              Sent to{" "}
              <span className="font-medium text-foreground">{phoneNumber}</span>
            </p>

            {/* OTP boxes — fixed width, no flex-1 to prevent layout shift */}
            <div
              className="grid gap-2 mb-5"
              style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
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
                    "w-full aspect-square rounded-xl border text-center text-xl font-semibold",
                    "border-border bg-background text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                    "transition-colors",
                    digit && "border-primary/50 bg-primary/5",
                  )}
                />
              ))}
            </div>

            {/* Resend */}
            <p className="text-xs text-muted-foreground mb-5">
              Didn't receive it?{" "}
              {resendTimer > 0 ? (
                <span className="text-foreground font-medium">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isPendingSend}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {isPendingSend ? "Sending..." : "Resend code"}
                </button>
              )}
            </p>

            <Button
              onClick={handleVerify}
              disabled={isPendingVerify || otp.join("").length !== 6}
              className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {isPendingVerify ? <Spinner /> : "Verify phone number"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
