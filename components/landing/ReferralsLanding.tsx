"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";


// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  name: string;
  phoneNumber: string;
  email?: string;
}

interface ReferralUser {
  _id: string;
  name: string;
}

type SentMap = Record<string, "idle" | "pending" | "sent" | "already_sent">;

const LS_KEY = "referral_user_info";
const LS_SUBMITTED = "referral_form_submitted";

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
  value: string;           // full value including "+1", e.g. "+16045550123"
  error?: string;
  onChange: (v: string) => void;  // emits "+1XXXXXXXXXX"
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
      <div className="flex rounded-lg border overflow-hidden transition-colors focus-within:border-primary bg-background"
           style={{ borderColor: error ? "var(--destructive)" : "var(--input)" }}>
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

// ─── Info Gate Form ───────────────────────────────────────────────────────────

function InfoGate({
  onSave,
  prefill,
}: {
  onSave: (info: UserInfo) => void;
  prefill: UserInfo | null;
}) {
  const [form, setForm] = useState<UserInfo>(
    prefill ?? { name: "", phoneNumber: "", email: "" }
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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    localStorage.setItem(LS_SUBMITTED, "1");
    onSave(form);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md border border-border rounded-2xl p-8 bg-card shadow-sm">

        {/* Header */}
        <div className="mb-7">
          <span className="inline-block text-[0.68rem] font-bold tracking-widest uppercase text-primary mb-3">
            Request a referral
          </span>
          <h2 className="font-sans text-[1.65rem] font-bold text-foreground leading-tight mb-2">
            Who are you?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Canadian&apos;s Cart is invite-only. Fill in your details and send
            a request to an existing member — if they accept, your referral
            code will be sent <strong className="text-foreground">automatically to your phone number & email.</strong>
          </p>
        </div>

        {/* How it works */}
        <div className="bg-secondary rounded-xl px-4 py-3.5 mb-6 flex flex-col gap-3">
          {([
            { icon: UserRound, text: "Fill in your name and phone number below" },
            { icon: Users,     text: "Browse members and send one a request" },
            { icon: MessageCircle, text: "If accepted, a referral code is sent to your phone & email" },
          ] as const).map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon size={13} className="text-primary" />
              </div>
              <span className="text-xs text-secondary-foreground leading-snug pt-0.5">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 mb-6">
          <FormField
            label="Full name"
            placeholder="Jane Smith"
            icon={<UserRound size={14} className="text-muted-foreground" />}
            required
            value={form.name}
            error={errors.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />

          {/* Canadian phone with locked +1 prefix */}
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
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Send size={14} />
          Continue
        </button>

        <p className="text-center text-[0.72rem] text-muted-foreground mt-4">
          Already have a referral code?{" "}
          <a
            href="/sign-up"
            className="text-primary font-semibold underline underline-offset-2"
          >
            Sign up here
          </a>
        </p>
      </div>
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
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.8rem] font-semibold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {labelSuffix && (
          <span className="text-muted-foreground font-normal ml-0.5">({labelSuffix})</span>
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
}: {
  user: ReferralUser;
  userInfo: UserInfo;
  status: SentMap[string];
  onSent: () => void;
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

  const avatarUrl = `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(user.name)}`;

  const handleSend = async () => {
    if (localStatus !== "idle") return;
    setLocalStatus("pending");
    try {
      const res = await SendReferralRequest(userInfo, user._id);
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReferralsLanding({
  initialMembers,
}: {
  initialMembers: ReferralUser[];
}) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [prefill, setPrefill] = useState<UserInfo | null>(null);
  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const [sentMap, setSentMap] = useState<SentMap>(() =>
    Object.fromEntries(initialMembers.map((m) => [m._id, "idle"]))
  );
  const [sentCount, setSentCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const wasSubmitted = localStorage.getItem(LS_SUBMITTED) === "1";
      if (raw && wasSubmitted) {
        const parsed = JSON.parse(raw) as UserInfo;
        setUserInfo(parsed);
        setPrefill(parsed);
        setSubmitted(true);

        getAlreadySentMemberIds(parsed.phoneNumber).then((res) => {
          if (res.success && res.data.length > 0) {
            setSentMap((prev) => {
              const next = { ...prev };
                  res.data.forEach(({ memberId, accepted }) => {
                    if (next[memberId] !== undefined && (accepted === null || accepted ===true) ) {
                      next[memberId] = "already_sent";
                    }
                  });
              return next;
            });
          }
        });
      } else {
        if (raw) setPrefill(JSON.parse(raw));
        setSubmitted(false);
      }
    } catch {
      setSubmitted(false);
    }
  }, []);

  const handleSave = (info: UserInfo) => {
    setUserInfo(info);
    setPrefill(info);
    setSubmitted(true);
  };

  const handleReset = () => {
    localStorage.removeItem(LS_SUBMITTED);
    setUserInfo(null);
    setSubmitted(false);
    setSentCount(0);
  };

  const handleSent = () => {
    setSentCount((c) => c + 1);
    setToast("Request sent! You'll get a text with your referral code if they accept.");
    setTimeout(() => setToast(null), 4500);
  };

  // Still reading LS
  if (submitted === null) {
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

  if (!submitted || !userInfo) {
    return <InfoGate onSave={handleSave} prefill={prefill} />;
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
          code will be <strong className="text-foreground">sent to your phone & email automatically.</strong>
        </p>
      </div>

      {/* Sender identity strip */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-secondary border border-border mb-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="flex-shrink-0 h-7 w-7 rounded-full">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(userInfo.name)}`}
              className="rounded-full"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-[0.65rem] font-bold rounded-full">
              {userInfo.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{userInfo.name}</p>
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

      {/* Sent counter */}
      {sentCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-lg bg-secondary border border-border">
          <MessageCircle size={14} className="text-primary flex-shrink-0" />
          <p className="text-xs text-secondary-foreground">
            <span className="font-semibold text-primary">{sentCount}</span>{" "}
            request{sentCount !== 1 ? "s" : ""} sent — You'll be notified when your request gets accepted.
          </p>
        </div>
      )}

      {/* Member list */}
      <div className="flex flex-col gap-2">
        {initialMembers.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-border rounded-xl">
            <Users size={28} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No members available right now.</p>
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
            />
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-medium px-4 py-3 rounded-xl shadow-lg max-w-xs text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}