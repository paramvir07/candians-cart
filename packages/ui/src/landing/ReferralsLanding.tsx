"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { X, ChevronDown, Search, PartyPopper } from "lucide-react";
import {
  SendReferralRequest,
  getAlreadySentMemberIds,
} from "@/actions/customer/ReferralRequest.Action";
import {
  UserRound,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  MessageCircle,
  Wallet,
  MapPin,
  Building2,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  name: string;
  phoneNumber: string;
  email?: string;
  budget: string;
  province: string;
  city: string;
}

interface ReferralUser {
  _id: string;
  name: string;
  uses: number;
  maxUses: number | null;
}

type SentMap = Record<string, "idle" | "pending" | "sent" | "already_sent">;

const LS_KEY = "referral_user_info";
const LS_SUBMITTED = "referral_form_submitted";

const BC_CITIES = [
  "Vancouver",
  "Surrey",
  "Burnaby",
  "Richmond",
  "Abbotsford",
  "Coquitlam",
  "Kelowna",
  "Langley",
  "Saanich",
  "Delta",
  "Nanaimo",
  "Kamloops",
  "Chilliwack",
  "Maple Ridge",
  "New Westminster",
  "Port Coquitlam",
  "North Vancouver",
  "West Vancouver",
  "Victoria",
  "Prince George",
  "Vernon",
  "Courtenay",
  "Penticton",
  "Campbell River",
  "Mission",
  "Port Moody",
  "Squamish",
  "White Rock",
  "Fort St. John",
  "Duncan",
  "Nelson",
  "Cranbrook",
  "Whistler",
];

// ─── Canadian Phone Field ─────────────────────────────────────────────────────

/**
 * Shows a locked 🇨🇦 +1 prefix. The user types only the 10-digit local number.
 * The value surfaced upward (and stored) is always "+1XXXXXXXXXX".
 */
function CanadianPhoneField({
  value,
  error,
  onChange,
}: {
  value: string; // full value including "+1", e.g. "+16045550123"
  error?: string;
  onChange: (v: string) => void; // emits "+1XXXXXXXXXX"
}) {
  // Strip "+1" prefix for display inside the input
  const local = value.startsWith("+1") ? value.slice(2) : value;

  const handleChange = (raw: string) => {
    // Allow only digits, max 10
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    onChange(digits ? `+1${digits}` : "");
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.8rem] font-semibold text-foreground flex items-center gap-1">
        Phone number
        <span className="text-destructive">*</span>
      </label>
      <div
        className="flex rounded-lg border overflow-hidden transition-colors focus-within:border-primary bg-background"
        style={{ borderColor: error ? "var(--destructive)" : "var(--input)" }}
      >
        {/* Prefix badge — not interactive */}
        <div className="flex items-center gap-1.5 px-3 bg-secondary border-r border-border flex-shrink-0 select-none">
          <span className="text-base leading-none">🇨🇦</span>
          <span className="text-sm font-semibold text-foreground">+1</span>
        </div>
        {/* Local number input */}
        <input
          type="tel"
          inputMode="numeric"
          placeholder="604 555 0123"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 py-2.5 px-3 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      {error && (
        <span className="text-[0.75rem] text-destructive flex items-center gap-1">
          <ShieldCheck size={11} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Province Field (locked to BC) ────────────────────────────────────────────

function ProvinceField() {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.8rem] font-semibold text-foreground flex items-center gap-1">
        Province
        <span className="text-destructive">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <MapPin size={14} className="text-muted-foreground" />
        </span>
        <div className="w-full py-2.5 pl-9 pr-9 rounded-lg border border-input bg-muted/40 text-sm text-foreground cursor-not-allowed select-none flex items-center justify-between">
          <span>British Columbia</span>
        </div>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown size={14} className="text-muted-foreground/50" />
        </span>
      </div>
      <span className="text-[0.72rem] text-muted-foreground">
        Currently only available in British Columbia.
      </span>
    </div>
  );
}

// ─── City Field (searchable dropdown, BC cities only) ─────────────────────────

function CityField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Revert visible text to last committed value if user didn't pick one
        setQuery(value ?? "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BC_CITIES;
    return BC_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1" ref={wrapperRef}>
      <label className="text-[0.8rem] font-semibold text-foreground flex items-center gap-1">
        City
        <span className="text-destructive">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Building2 size={14} className="text-muted-foreground" />
        </span>
        <input
          type="text"
          placeholder="Search for your city"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // Clear committed value until user picks a valid option again
            if (value) onChange("");
          }}
          className={`w-full py-2.5 pl-9 pr-9 rounded-lg border text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary ${
            error ? "border-destructive" : "border-input"
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search size={13} className="text-muted-foreground/60" />
        </span>

        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3.5 py-2.5 text-sm text-muted-foreground">
                No matching cities.
              </div>
            ) : (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full text-left px-3.5 py-2 text-sm hover:bg-secondary transition-colors ${
                    city === value
                      ? "bg-secondary font-semibold text-primary"
                      : "text-foreground"
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <span className="text-[0.75rem] text-destructive flex items-center gap-1">
          <ShieldCheck size={11} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Budget Field (numbers only) ──────────────────────────────────────────────

function BudgetField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const handleChange = (raw: string) => {
    // Allow only digits (no decimals/letters/symbols)
    const digits = raw.replace(/\D/g, "");
    onChange(digits);
  };

  return (
    <FormField
      label="Budget"
      labelSuffix="CAD"
      placeholder="e.g. 5000"
      icon={<Wallet size={14} className="text-muted-foreground" />}
      required
      value={value}
      error={error}
      onChange={handleChange}
      inputMode="numeric"
    />
  );
}

// ─── Info Gate Form (rendered inside Dialog) ─────────────────────────────────

function InfoGateForm({
  onSave,
  prefill,
}: {
  onSave: (info: UserInfo) => void;
  prefill: UserInfo | null;
}) {
  const [form, setForm] = useState<UserInfo>(
    prefill ?? {
      name: "",
      phoneNumber: "",
      email: "",
      budget: "",
      province: "BC",
      city: "",
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});

  useEffect(() => {
    if (prefill) setForm(prefill);
  }, [prefill]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof UserInfo, string>> = {};
    if (!form.name.trim()) next.name = "Name is required.";

    // Must be +1 followed by exactly 10 digits
    if (!/^\+1\d{10}$/.test(form.phoneNumber))
      next.phoneNumber = "Enter a valid 10-digit Canadian number.";

    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";

    // Budget: numbers only, required
    if (!form.budget?.trim() || !/^\d+$/.test(form.budget))
      next.budget = "Enter a valid number.";

    if (!form.city?.trim()) next.city = "Select a city.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const finalForm: UserInfo = { ...form, province: "BC" };
    localStorage.setItem(LS_KEY, JSON.stringify(finalForm));
    localStorage.setItem(LS_SUBMITTED, "1");
    onSave(finalForm);
  };

    return (
        <div className="flex flex-col">
          {/* Fields */}
          <div className="flex flex-col gap-4 mb-6 mt-2">
            <FormField
              label="Full name"
              placeholder="Jane Smith"
              icon={<UserRound size={14} className="text-muted-foreground" />}
              required
              value={form.name}
              error={errors.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />

            <CanadianPhoneField
              value={form.phoneNumber}
              error={errors.phoneNumber}
              onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
            />

            <FormField
              label="Email address"
              placeholder="jane@example.com"
              type="email"
              icon={<Mail size={14} className="text-muted-foreground" />}
              required
              value={form.email ?? ""}
              error={errors.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <ProvinceField />
              <CityField
                value={form.city ?? ""}
                error={errors.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />
            </div>

            <BudgetField
              value={form.budget ?? ""}
              error={errors.budget}
              onChange={(v) => setForm((f) => ({ ...f, budget: v }))}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Continue
          </button>

          <p className="text-center text-[0.72rem] text-muted-foreground mt-4">
            Already have a code?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-semibold underline underline-offset-2"
            >
              Sign up here
            </Link>
          </p>
        </div>
      );
}


// ─── Form Field ───────────────────────────────────────────────────────────────

function FormField({
  label,
  labelSuffix,
  placeholder,
  value,
  error,
  type = "text",
  required = false,
  icon,
  onChange,
  inputMode,
}: {
  label: string;
  labelSuffix?: string;
  placeholder: string;
  value: string;
  error?: string;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
  onChange: (v: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.8rem] font-semibold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {labelSuffix && (
          <span className="text-muted-foreground font-normal ml-0.5">
            ({labelSuffix})
          </span>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-2.5 rounded-lg border text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary ${
            icon ? "pl-9 pr-3.5" : "px-3.5"
          } ${error ? "border-destructive" : "border-input"}`}
        />
      </div>
      {error && (
        <span className="text-[0.75rem] text-destructive flex items-center gap-1">
          <ShieldCheck size={11} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({
  user,
  userInfo,
  status,
  onSent,
  onRequireInfo,
}: {
  user: ReferralUser;
  userInfo: UserInfo | null;
  status: SentMap[string];
  onSent: () => void;
  onRequireInfo: (pendingMemberId: string) => void;
}) {
  const [localStatus, setLocalStatus] = useState<SentMap[string]>(status);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarUrl = `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(
    user.name
  )}`;

  const doSend = async (info: UserInfo) => {
    setLocalStatus("pending");
    try {
      const res = await SendReferralRequest(info, user._id);
      if (res.success) {
        const next = res.message === "already_sent" ? "already_sent" : "sent";
        setLocalStatus(next);
        if (next === "sent") onSent();
      } else {
        setLocalStatus("idle");
      }
    } catch {
      setLocalStatus("idle");
    }
  };

  const handleSend = async () => {
    if (localStatus !== "idle") return;
    if (!userInfo) {
      onRequireInfo(user._id);
      return;
    }
    await doSend(userInfo);
  };

  const isSentOrAlready = localStatus === "sent" || localStatus === "already_sent";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
        localStatus === "sent"
          ? "border-primary bg-secondary"
          : localStatus === "already_sent"
          ? "border-border bg-muted/40"
          : "border-border bg-card"
      }`}
    >
      {/* Avatar */}
      <Avatar
        className={`flex-shrink-0 h-9 w-9 rounded-full transition-opacity ${
          isSentOrAlready ? "opacity-40" : "opacity-100"
        }`}
      >
        <AvatarImage src={avatarUrl} className="rounded-full" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-full">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name + sub-label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-[0.7rem] text-muted-foreground mt-0.5">
          {user.uses} / {user.maxUses ?? "∞"} referrals used
        </p>
        {localStatus === "already_sent" && (
          <p className="text-[0.7rem] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            Request already sent
          </p>
        )}
        {localStatus === "sent" && (
          <p className="text-[0.7rem] text-primary mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={10} />
            Waiting for response
          </p>
        )}
      </div>

      {/* Action */}
      {localStatus === "sent" ? (
        <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-primary flex-shrink-0">
          <CheckCircle2 size={13} />
          Sent
        </span>
      ) : localStatus === "already_sent" ? (
        <span className="flex items-center gap-1 text-[0.72rem] font-medium text-muted-foreground flex-shrink-0">
          <Clock size={12} />
          Pending
        </span>
      ) : (
        <button
          onClick={handleSend}
          disabled={localStatus === "pending"}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-primary text-primary text-[0.78rem] font-semibold hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {localStatus === "pending" ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send size={12} />
              Send request
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Success Modal ─────────────────────────────────────────────────────────────

function SuccessModal({
  open,
  onOpenChange,
  userInfo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInfo: UserInfo | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogClose className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <X size={16} />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <PartyPopper size={22} className="text-primary" />
          </div>
          <DialogTitle className="text-center text-[1.25rem] font-bold leading-tight">
            Request sent!
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            We&apos;ll notify you the moment they respond. If they accept,
            here&apos;s exactly where your referral code will show up:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-2 mb-2">
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-card">
            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-primary">
              <Phone size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Text message</p>
              <p className="text-[0.72rem] text-muted-foreground truncate">
                {userInfo?.phoneNumber
                  ? `Sent to ${userInfo.phoneNumber}`
                  : "Sent to the phone number you provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-card">
            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-primary">
              <Mail size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Email</p>
              <p className="text-[0.72rem] text-muted-foreground truncate">
                {userInfo?.email
                  ? `Sent to ${userInfo.email}`
                  : "Sent to the email address you provided"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[0.72rem] text-muted-foreground">
          No action needed on your end — just keep an eye on your phone and
          inbox.
        </p>

        <DialogClose asChild>
          <button className="w-full mt-3 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Got it
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReferralsLanding({
  initialMembers,
}: {
  initialMembers: ReferralUser[];
}) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [prefill, setPrefill] = useState<UserInfo | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sentMap, setSentMap] = useState<SentMap>(() =>
    Object.fromEntries(initialMembers.map((m) => [m._id, "idle"]))
  );
  const [sentCount, setSentCount] = useState(0);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  // Success modal state
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const wasSubmitted = localStorage.getItem(LS_SUBMITTED) === "1";
      if (raw && wasSubmitted) {
        const parsed = JSON.parse(raw) as UserInfo;
        setUserInfo(parsed);
        setPrefill(parsed);

        getAlreadySentMemberIds(parsed.phoneNumber).then((res) => {
          if (res.success && res.data.length > 0) {
            setSentMap((prev) => {
              const next = { ...prev };
              res.data.forEach(({ memberId, accepted }) => {
                if (next[memberId] !== undefined && (accepted === null || accepted === true)) {
                  next[memberId] = "already_sent";
                }
              });
              return next;
            });
          }
        });
      } else if (raw) {
        setPrefill(JSON.parse(raw));
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  const handleReset = () => {
    setDialogOpen(true);
  };

  const handleSent = () => {
    setSentCount((c) => c + 1);
    setSuccessOpen(true);
  };

  // Triggered by a MemberCard when there's no saved info yet
  const handleRequireInfo = (memberId: string) => {
    setPendingMemberId(memberId);
    setDialogOpen(true);
  };

  // Called when the dialog form is submitted successfully
  const handleInfoSaved = async (info: UserInfo) => {
    setUserInfo(info);
    setPrefill(info);
    setDialogOpen(false);

    // Immediately send the request for the member that triggered the dialog
    if (pendingMemberId) {
      const memberId = pendingMemberId;
      setPendingMemberId(null);
      setSentMap((prev) => ({ ...prev, [memberId]: "pending" }));
      try {
        const res = await SendReferralRequest(info, memberId);
        if (res.success) {
          const next = res.message === "already_sent" ? "already_sent" : "sent";
          setSentMap((prev) => ({ ...prev, [memberId]: next }));
          if (next === "sent") handleSent();
        } else {
          setSentMap((prev) => ({ ...prev, [memberId]: "idle" }));
        }
      } catch {
        setSentMap((prev) => ({ ...prev, [memberId]: "idle" }));
      }
    }
  };

  // Still reading localStorage
  if (!hydrated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-14">
        <div className="flex flex-col gap-3 mb-8">
          <div className="w-28 h-3 rounded bg-muted animate-pulse" />
          <div className="w-64 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="w-full h-4 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-14 rounded-xl border border-border bg-muted animate-pulse mb-6" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card animate-pulse"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 h-4 rounded-md bg-muted" />
              <div className="w-24 h-8 rounded-lg bg-muted flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-block text-[0.68rem] font-bold tracking-widest uppercase text-primary mb-3">
          Request a referral
        </span>
        <h1 className="font-sans text-[1.8rem] font-bold text-foreground leading-tight mb-2">
          Find someone to vouch for you
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Send a request to any member below. If they accept, your referral
          code will be{" "}
          <strong className="text-foreground">
            sent to your phone & email automatically.
          </strong>
        </p>
      </div>

      {/* Sender identity strip — only shown once info is known */}
      {userInfo && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-secondary border border-border mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="flex-shrink-0 h-7 w-7 rounded-full">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(
                  userInfo.name
                )}`}
                className="rounded-full"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-[0.65rem] font-bold rounded-full">
                {userInfo.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {userInfo.name}
              </p>
              <p className="text-[0.7rem] text-muted-foreground truncate flex items-center gap-1">
                <Phone size={10} />
                {userInfo.phoneNumber}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[0.72rem] font-semibold text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 underline underline-offset-2"
          >
            Not you?
          </button>
        </div>
      )}

      {/* Sent counter */}
      {sentCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-lg bg-secondary border border-border">
          <MessageCircle size={14} className="text-primary flex-shrink-0" />
          <p className="text-xs text-secondary-foreground">
            <span className="font-semibold text-primary">{sentCount}</span>{" "}
            request{sentCount !== 1 ? "s" : ""} sent — You'll be notified when
            your request gets accepted.
          </p>
        </div>
      )}

      {/* Member list */}
      <div className="flex flex-col gap-2">
        {initialMembers.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-border rounded-xl">
            <Users size={28} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No members available right now.
            </p>
            <p className="text-xs text-muted-foreground mt-1">Check back later.</p>
          </div>
        ) : (
          initialMembers.map((u) => (
            <MemberCard
              key={u._id}
              user={u}
              userInfo={userInfo}
              status={sentMap[u._id] ?? "idle"}
              onSent={handleSent}
              onRequireInfo={handleRequireInfo}
            />
          ))
        )}
      </div>

      {/* Info Gate Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setPendingMemberId(null);
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogClose className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X size={16} />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader>
            <DialogTitle className="text-[1.25rem] font-bold leading-tight">
              One quick step
            </DialogTitle>
            <DialogDescription className="text-sm">
              We&apos;ll send your request and text you the referral code if it&apos;s accepted.
            </DialogDescription>
          </DialogHeader>

          <InfoGateForm onSave={handleInfoSaved} prefill={prefill} />
        </DialogContent>
      </Dialog>

      {/* Success Modal — replaces the old toast */}
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        userInfo={userInfo}
      />
    </div>
  );
}