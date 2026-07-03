"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { Phone, ArrowLeft, ShieldCheck } from "lucide-react";
import { sendPhoneOTPAction } from "@/actions/auth/verifiyPhone.actions";
import { authClient } from "@/lib/auth/auth-client";

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
  const abortRef = useRef<AbortController | null>(null);

  // Countdown timer
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

  // WebOTP API — auto-reads OTP from SMS on Android Chrome
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
          if (digits.length === 6) {
            handleVerifyCode(digits);
          }
        }
      })
      .catch(() => {});

    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Strip +1 or 1 prefix if browser autofills full E.164
  let raw = e.target.value.replace(/\D/g, "");
  if (raw.length === 11 && raw.startsWith("1")) {
    raw = raw.slice(1);
  }
  const digits = raw.slice(0, 10);

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

  const handleVerifyCode = (code: string) => {
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
        toast.success("Phone verified! Welcome to Candian's Cart");
        // Give revalidation time to complete, then hard navigate
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.href = "/customer";
      }
    });
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    handleVerifyCode(code);
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
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
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
        <div className="mb-8">
          <Logo variant="icon" href="/" />
        </div>

        {step === "phone" ? (
          <>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Phone className="w-5 h-5 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Verify your phone
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              Hi {firstName}! We need to verify your phone number before you can
              access the app.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOTP();
              }}
              className="flex flex-col gap-3"
            >
              <div className="flex gap-2">
                <div className="h-12 px-3 flex items-center justify-center rounded-xl border border-border bg-muted text-sm font-medium text-foreground shrink-0 select-none">
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
              <p className="text-[11px] text-muted-foreground px-1">
                Enter your Canadian mobile number. We'll send a 6-digit code via
                SMS.
              </p>

              <Button
                type="submit"
                disabled={isPendingSend || !e164Phone}
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {isPendingSend ? <Spinner /> : "Send verification code"}
              </Button>
            </form>
          </>
        ) : (
          <>
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
                handleVerify();
              }}
              className="flex flex-col gap-5"
            >
              <div
                className="grid gap-2"
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
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {isPendingVerify ? <Spinner /> : "Verify phone number"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
