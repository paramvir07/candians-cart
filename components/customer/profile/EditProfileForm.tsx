"use client";

import {
  useActionState,
  useEffect,
  useState,
  useCallback,
  useTransition,
  useRef,
} from "react";
import {
  editUserProfile,
  type ProfileState,
} from "@/actions/customer/userEdit.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Building2,
  Map,
  Check,
  ChevronLeft,
  Clock,
  KeyRoundIcon,
  ShieldCheck,
  X,
  Loader2,
  Hash,
} from "lucide-react";
import { Customer } from "@/types/customer/customer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CUSTOMER_CITIES, CUSTOMER_PROVINCES } from "@/lib/customer/location";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { sendPhoneOTPAction } from "@/actions/auth/verifiyPhone.actions";

type FormUserData = Pick<
  Customer,
  "name" | "email" | "address" | "city" | "province" | "postalCode" | "mobile"
>;
type EditableFields = Omit<FormUserData, "email"> & {
  mobile: string;
  postalCode: string;
};

const initialState: ProfileState = { message: null, errors: {} };
type PhoneVerifyStep = "idle" | "sending" | "otp" | "verifying";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-muted-foreground mb-1.5">
      {children}
    </label>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
      {children}
    </p>
  );
}
function IconInput({
  icon: Icon,
  error,
  ...props
}: { icon: React.ElementType; error?: string } & React.ComponentProps<
  typeof Input
>) {
  return (
    <div>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
        <Input
          {...props}
          className={`pl-10 h-11 rounded-xl border-border/60 bg-card focus-visible:ring-1 focus-visible:ring-primary ${props.className ?? ""}`}
        />
      </div>
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}
function IconSelect({
  icon: Icon,
  error,
  children,
  ...props
}: {
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
} & React.ComponentProps<"select">) {
  return (
    <div>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
        <select
          {...props}
          className={`w-full pl-10 pr-3 h-11 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary ${props.className ?? ""}`}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}

// Phone OTP Modal
function PhoneVerifyModal({
  newPhone,
  e164Phone,
  onVerified,
  onCancel,
}: {
  newPhone: string;
  e164Phone: string;
  onVerified: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<PhoneVerifyStep>("idle");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
          if (digits.length === 6) doVerify(digits);
        }
      })
      .catch(() => {});
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const sendOTP = async () => {
    setStep("sending");
    const result = await sendPhoneOTPAction(e164Phone);
    if (result.success) {
      toast.success("Verification code sent!");
      setStep("otp");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      toast.error(result.message);
      setStep("idle");
    }
  };

  const doVerify = async (code?: string) => {
    const finalCode = code ?? otp.join("");
    if (finalCode.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    setStep("verifying");
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: e164Phone,
      code: finalCode,
      disableSession: false,
    });
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      otpRefs.current[0]?.focus();
    } else {
      toast.success("Phone number updated successfully!");
      onVerified();
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
      doVerify();
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
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
    const result = await sendPhoneOTPAction(e164Phone);
    if (result.success) {
      toast.success("New code sent!");
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      otpRefs.current[0]?.focus();
    } else toast.error(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">
                Verify New Number
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {newPhone}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-6 space-y-5">
          {(step === "idle" || step === "sending") && (
            <>
              <p className="text-sm text-muted-foreground">
                We'll send a 6-digit code to{" "}
                <span className="font-semibold text-foreground">
                  {newPhone}
                </span>{" "}
                to confirm it's yours before saving.
              </p>
              <button
                onClick={sendOTP}
                disabled={step === "sending"}
                className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {step === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send verification code"
                )}
              </button>
            </>
          )}
          {(step === "otp" || step === "verifying") && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                doVerify();
              }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-foreground">
                  {newPhone}
                </span>
                .
              </p>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
                onPaste={handlePaste}
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
                      "w-full aspect-square rounded-xl border text-center text-xl font-semibold border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors",
                      digit && "border-primary/50 bg-primary/5",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Didn't receive it?{" "}
                {resendTimer > 0 ? (
                  <span className="text-foreground font-medium">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend code
                  </button>
                )}
              </p>
              <button
                type="submit"
                disabled={step === "verifying" || otp.join("").length !== 6}
                className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {step === "verifying" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify & Save"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Form
export default function EditProfileForm({ user }: { user: FormUserData }) {
  const [state, formAction] = useActionState(editUserProfile, initialState);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingE164, setPendingE164] = useState("");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const formatMobile = (val: string) => {
    let raw = val.replace(/\D/g, "");
    if (raw.length === 11 && raw.startsWith("1")) raw = raw.slice(1);
    const digits = raw.slice(0, 10);
    if (digits.length >= 7)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length >= 4) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length >= 1) return `(${digits}`;
    return digits;
  };

  // mobile from customer model may be E.164 (+16041234567) — format it for display
  const formatStoredMobile = (val: string) => {
    if (!val) return "";
    // If E.164, strip +1 then format
    if (val.startsWith("+1")) return formatMobile(val.slice(2));
    return formatMobile(val);
  };

  const trimmed: FormUserData = {
    name: user.name.trim(),
    email: user.email.trim(),
    address: user.address.trim(),
    city: user.city.trim(),
    province: user.province.trim(),
    postalCode: (user.postalCode ?? "").trim(),
    mobile: (user.mobile ?? "").trim(),
  };

  const [fields, setFields] = useState<EditableFields>({
    name: trimmed.name,
    address: trimmed.address,
    city: trimmed.city,
    province: trimmed.province || "BC",
    postalCode: trimmed.postalCode,
    // Format stored mobile (E.164 or display format) for the input
    mobile: formatStoredMobile(trimmed.mobile ?? ""),
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === "mobile") {
        setFields((prev) => ({ ...prev, mobile: formatMobile(value) }));
        return;
      }
      if (name === "postalCode") {
        const clean = value.replace(/\s/g, "").toUpperCase().slice(0, 6);
        const formatted =
          clean.length > 3 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
        setFields((prev) => ({ ...prev, postalCode: formatted }));
        return;
      }
      setFields((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const mobileChanged =
    fields.mobile.trim() !== formatStoredMobile(trimmed.mobile ?? "");
  const hasChanges =
    fields.name.trim() !== trimmed.name ||
    fields.address.trim() !== trimmed.address ||
    fields.city.trim() !== trimmed.city ||
    fields.province.trim() !== trimmed.province ||
    fields.postalCode.trim() !== trimmed.postalCode ||
    mobileChanged;

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/customer/profile");
      } else toast.error(state.message);
    }
  }, [state]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!hasChanges) return;
      const form = e.currentTarget;
      const fd = new FormData(form);
      (Object.keys(fields) as (keyof EditableFields)[]).forEach((key) => {
        fd.set(key, (fields[key] ?? "").trim());
      });

      if (mobileChanged) {
        const digits = fields.mobile.replace(/\D/g, "");
        const e164 = digits.length === 10 ? `+1${digits}` : "";
        if (!e164) {
          toast.error("Please enter a valid 10-digit phone number");
          return;
        }
        setPendingE164(e164);
        setPendingFormData(fd);
        setShowPhoneModal(true);
        return;
      }
      startTransition(() => formAction(fd));
    },
    [fields, hasChanges, mobileChanged, formAction],
  );

  const handlePhoneVerified = useCallback(() => {
    setShowPhoneModal(false);
    if (pendingFormData) startTransition(() => formAction(pendingFormData));
  }, [pendingFormData, formAction]);

  const initials = trimmed.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const previewName = fields.name.trim() || trimmed.name;
  const previewMobile = fields.mobile.trim() || "—";
  // UPDATE previewAddress to include postal code:
  const previewAddress =
    [
      fields.address.trim(),
      fields.city.trim(),
      fields.province.trim(),
      fields.postalCode.trim(),
    ]
      .filter(Boolean)
      .join(", ") || "—";

  // Shared form fields JSX
  const personalFields = (
    <div className="space-y-4">
      <SectionLabel>Personal Info</SectionLabel>
      <div>
        <FieldLabel>Full Name</FieldLabel>
        <IconInput
          icon={User}
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
          error={state?.errors?.name?.[0]}
        />
      </div>
      <div>
        <FieldLabel>Mobile Number</FieldLabel>
        <IconInput
          icon={Phone}
          name="mobile"
          type="tel"
          autoComplete="tel"
          value={fields.mobile}
          onChange={handleChange}
          maxLength={14}
          required
          placeholder="e.g. (604) 123-4567"
        />
        {mobileChanged && (
          <p className="text-[11px] text-primary mt-1.5 px-1 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> You'll need to verify this new
            number
          </p>
        )}
      </div>
    </div>
  );

  const addressFields = (
    <div className="space-y-4">
      <SectionLabel>Address</SectionLabel>
      <div>
        <FieldLabel>Street Address</FieldLabel>
        <IconInput
          icon={MapPin}
          name="address"
          type="text"
          value={fields.address}
          onChange={handleChange}
          required
          placeholder="e.g. 123 Main St"
          error={state?.errors?.address?.[0]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>City</FieldLabel>
          <IconSelect
            icon={Building2}
            name="city"
            value={fields.city}
            onChange={handleChange}
            required
            error={state?.errors?.city?.[0]}
          >
            <option value="" disabled>
              Select City
            </option>
            {CUSTOMER_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </IconSelect>
        </div>
        <div>
          <FieldLabel>Province</FieldLabel>
          <IconSelect
            icon={Map}
            name="province"
            value={fields.province}
            onChange={handleChange}
            required
            error={state?.errors?.province?.[0]}
          >
            {CUSTOMER_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </IconSelect>
        </div>
      </div>
      <div>
        <FieldLabel>Postal Code</FieldLabel>
        <IconInput
          icon={Hash}
          name="postalCode"
          type="text"
          value={fields.postalCode}
          onChange={handleChange}
          required
          placeholder="e.g. V2S 3K1"
          maxLength={7}
          className="uppercase font-mono placeholder:normal-case placeholder:tracking-normal"
          error={state?.errors?.postalCode?.[0]}
        />
      </div>
    </div>
  );

  const accountFields = (
    <div>
      <SectionLabel>Account</SectionLabel>
      <FieldLabel>Email</FieldLabel>
      <div className="relative mb-4">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
        <Input
          type="email"
          defaultValue={trimmed.email}
          disabled
          className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed"
        />
        <Link
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-white bg-primary px-2 py-1 rounded-full"
          href="/customer/change-email"
        >
          Change email
        </Link>
      </div>
      <FieldLabel>Password</FieldLabel>
      <div className="relative">
        <KeyRoundIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••••••••"
          disabled
          className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed"
        />
        <Link
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-white bg-primary px-2 py-1 rounded-full"
          href="/customer/change-password"
        >
          Change Password
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-background">
      {showPhoneModal && (
        <PhoneVerifyModal
          newPhone={fields.mobile}
          e164Phone={pendingE164}
          onVerified={handlePhoneVerified}
          onCancel={() => setShowPhoneModal(false)}
        />
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Link
            href="/customer/profile"
            className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-secondary/60 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <h1 className="text-sm font-bold tracking-tight">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* DESKTOP */}
          <div className="hidden sm:grid grid-cols-[1fr_300px] gap-5 items-start">
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              <div className="px-6 py-5">{accountFields}</div>
              <div className="px-6 py-5">{personalFields}</div>
              <div className="px-6 py-5">{addressFields}</div>
              <div className="px-6 py-4 flex items-center justify-between bg-secondary/20">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Changes save immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/customer/profile"
                    className="h-9 px-4 rounded-full border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all flex items-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isPending || !hasChanges}
                    className="h-9 px-5 rounded-full bg-primary text-background text-sm font-bold flex items-center gap-1.5 hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Spinner className="h-4 w-4" /> Saving…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2.5} /> Save
                        changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden sticky top-20">
              <div className="px-5 pt-5 pb-3 border-b border-border/40">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Preview
                </p>
              </div>
              <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                <Avatar className="h-20 w-20 rounded-3xl border-2 border-border/40">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-foreground text-base leading-none">
                    {previewName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    {trimmed.email}
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-border/40 space-y-2.5 text-left">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    <span>{previewMobile}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
                    <span className="leading-snug break-words">
                      {previewAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE */}
          <div className="sm:hidden flex flex-col gap-4">
            <div className="flex items-center gap-4 px-1">
              <Avatar className="h-14 w-14 rounded-2xl border border-border/60 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-foreground leading-none truncate">
                  {previewName}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {trimmed.email}
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              <div className="px-5 py-5">{accountFields}</div>
              <div className="px-5 py-5">{personalFields}</div>
              <div className="px-5 py-5">{addressFields}</div>
            </div>
            <button
              type="submit"
              disabled={isPending || !hasChanges}
              className="w-full h-12 rounded-full bg-primary text-background text-sm font-bold flex items-center justify-center gap-2 hover:opacity-85 disabled:scale-100 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Spinner className="h-4 w-4" /> Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
