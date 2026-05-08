"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Store,
  Mail,
  MapPin,
  Phone,
  Users,
  ChevronLeft,
  Check,
  Clock3,
  Globe,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { IStore, ITimeRange } from "@/db/models/store/store.model";
import { editStoreProfile } from "@/actions/store/EditStore.action";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────────

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const DAYS = [
  { key: "mon", label: "Monday",    short: "Mon" },
  { key: "tue", label: "Tuesday",   short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday",  short: "Thu" },
  { key: "fri", label: "Friday",    short: "Fri" },
  { key: "sat", label: "Saturday",  short: "Sat" },
  { key: "sun", label: "Sunday",    short: "Sun" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

export interface StoreFormPayload {
  email: string;
  name: string;
  address: string;
  mobile: string;
  hours: Record<DayKey, ITimeRange | null>;
}

// ─── sub-components ───────────────────────────────────────────────────────────

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
  ...props
}: { icon: React.ElementType } & React.ComponentProps<typeof Input>) {
  return (
    <div className="relative group">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
      <Input
        {...props}
        className={`pl-10 h-11 rounded-xl border-border/60 bg-background focus-visible:ring-1 focus-visible:ring-primary ${props.className ?? ""}`}
      />
    </div>
  );
}

// ─── single-shift day row ─────────────────────────────────────────────────────

function DayHoursRow({
  day,
  range,
  onChange,
}: {
  day: { key: DayKey; label: string; short: string };
  range: ITimeRange | null;
  onChange: (range: ITimeRange | null) => void;
}) {
  const isOpen = range !== null;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2.5 w-[130px] shrink-0">
        <Switch
          checked={isOpen}
          onCheckedChange={(v) =>
            onChange(v ? { open: 9 * 60, close: 17 * 60 } : null)
          }
          className="data-[state=checked]:bg-primary shrink-0"
        />
        <span
          className={`text-sm font-medium transition-colors ${
            isOpen ? "text-foreground" : "text-muted-foreground/40"
          }`}
        >
          {day.label}
        </span>
      </div>

      {isOpen && range ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="time"
            value={minsToTime(range.open)}
            onChange={(e) =>
              onChange({ ...range, open: timeToMins(e.target.value) })
            }
            className="h-9 px-2.5 rounded-lg border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tabular-nums flex-1 min-w-0"
          />
          <span className="text-muted-foreground/40 text-xs shrink-0">–</span>
          <input
            type="time"
            value={minsToTime(range.close)}
            onChange={(e) =>
              onChange({ ...range, close: timeToMins(e.target.value) })
            }
            className="h-9 px-2.5 rounded-lg border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary tabular-nums flex-1 min-w-0"
          />
        </div>
      ) : (
        <span className="text-[11px] text-muted-foreground/35 italic">
          Closed
        </span>
      )}
    </div>
  );
}

// ─── collapsible hours summary ────────────────────────────────────────────────

function HoursSummary({
  hours,
  openDaysCount,
}: {
  hours: Record<DayKey, ITimeRange | null>;
  openDaysCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-border/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-muted-foreground/40" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Hours
          </p>
          <span className="text-[10px] text-muted-foreground/40 ml-1">
            {openDaysCount}/{DAYS.length} open
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-1.5">
          {DAYS.map((day) => {
            const r = hours[day.key];
            return (
              <div
                key={day.key}
                className="flex items-center justify-between text-xs"
              >
                <span
                  className={
                    r ? "text-foreground font-medium" : "text-muted-foreground/35"
                  }
                >
                  {day.short}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {r
                    ? `${minsToTime(r.open)} – ${minsToTime(r.close)}`
                    : "Closed"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── save button (shared between desktop footer and mobile bar) ───────────────

function SaveButton({
  onClick,
  disabled,
  isPending,
  className,
}: {
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 font-bold text-sm rounded-full bg-primary text-background transition-all
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:enabled:opacity-85 active:enabled:scale-[0.98] ${className ?? ""}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" strokeWidth={2.5} />
      )}
      {isPending ? "Saving…" : "Save Changes"}
    </button>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function EditStorePage({ Data }: { Data: IStore }) {
  const initialRef = useRef({
    name: Data.name,
    address: Data.address,
    mobile: Data.mobile,
  });

  const initialHoursRef = useRef<Record<DayKey, ITimeRange | null>>(
    (() => {
      const result = {} as Record<DayKey, ITimeRange | null>;

      for (const d of DAYS) {
        const arr = Data.hours[d.key];
        result[d.key] = arr && arr.length > 0 ? arr[0] : null;
      }

      return result;
    })()
  );

  const [fields, setFields] = useState({ ...initialRef.current });
  const [hours, setHours] = useState<Record<DayKey, ITimeRange | null>>({
    ...initialHoursRef.current,
  });
  const [isPending, startTransition] = useTransition();
  const [saveVersion, setSaveVersion] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const isDirty = useMemo(() => {
    if (
      fields.name !== initialRef.current.name ||
      fields.address !== initialRef.current.address ||
      fields.mobile !== initialRef.current.mobile
    )
      return true;

    for (const d of DAYS) {
      const a = initialHoursRef.current[d.key];
      const b = hours[d.key];

      if (a === null && b === null) continue;
      if (a === null || b === null) return true;
      if (!a && !b) continue;
      if (!a || !b) return true;
      if (a.open !== b.open || a.close !== b.close) return true;
    }

    return false;
  }, [fields, hours, saveVersion]);

  const isDisabled = !isDirty || isPending;

  // ── submit ──
  const handleSubmit = () => {
    // --- Validation ---
    const trimmedName = fields.name.trim();
    const trimmedAddress = fields.address.trim();
    const trimmedMobile = fields.mobile.trim();

    if (!trimmedName) {
      toast.error("Store name cannot be empty.");
      return;
    }
    if (!trimmedAddress) {
      toast.error("Address cannot be empty.");
      return;
    }
    if (!trimmedMobile) {
      toast.error("Phone number cannot be empty.");
      return;
    }
    if (!/^\d{10}$/.test(trimmedMobile)) {
      toast.error("Phone number must be exactly 10 digits (no spaces or letters).");
      return;
    }
    // -----------------

    if (isDisabled) return;

    const payload: StoreFormPayload = {
      email: Data.email,
      name: trimmedName,
      address: trimmedAddress,
      mobile: trimmedMobile,
      hours,
    };

    startTransition(async () => {
      try {
        const result = await editStoreProfile(payload);
        if (result.success) {
          initialRef.current = {
            name: trimmedName,
            address: trimmedAddress,
            mobile: trimmedMobile,
          };

          initialHoursRef.current = { ...hours };

          setSaveVersion((v) => v + 1);

          toast.success(result.message ?? "Store updated successfully");
        } else {
          toast.error(result.message ?? "Failed to update store");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  // ── derived ──
  const initials = useMemo(
    () =>
      fields.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [fields.name]
  );

  const openDaysCount = DAYS.filter((d) => hours[d.key] !== null).length;

  // ── render ──
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <Link
            href="/store/settings"
            className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-secondary/60 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <h1 className="text-sm font-bold tracking-tight">Edit Store</h1>
        </div>

        <div className="flex flex-col gap-5 sm:grid sm:grid-cols-[1fr_300px] sm:items-start">
          {/* ── PREVIEW — top on mobile, sticky right on desktop ── */}
          <div className="order-first sm:order-last sm:sticky sm:top-20 rounded-3xl border border-border/60 bg-card overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-border/40">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Store Preview
              </p>
            </div>

            <div className="px-5 py-5 flex flex-col items-center text-center gap-3">
              <Avatar className="h-20 w-20 rounded-3xl border-2 border-border/40">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(fields.name)}`}
                  className="rounded-3xl"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-bold text-foreground text-base leading-none">
                  {fields.name || "Store Name"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {Data.email}
                </p>
              </div>

              <div className="w-full pt-3 border-t border-border/40 space-y-2 text-left">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  <span>{fields.mobile || "—"}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
                  <span className="leading-snug">{fields.address || "—"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  <span>{Data.members.length} Team Members</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  <span>{Data.timezone}</span>
                </div>
              </div>
            </div>

            <HoursSummary hours={hours} openDaysCount={openDaysCount} />
          </div>

          {/* ── FORM — bottom on mobile, left on desktop ── */}
          <div className="order-last sm:order-first rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
            {/* Email read-only */}
            <div className="px-6 py-5">
              <SectionLabel>Store Account</SectionLabel>
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                <Input
                  disabled
                  value={Data.email}
                  className="pl-10 h-11 rounded-xl border-border/40 bg-secondary/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {/* Store details */}
            <div className="px-6 py-5 space-y-4">
              <SectionLabel>Store Details</SectionLabel>

              <div>
                <FieldLabel>Store Name</FieldLabel>
                <IconInput
                  icon={Store}
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Store Name"
                />
              </div>

              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <IconInput
                  icon={Phone}
                  name="mobile"
                  value={fields.mobile}
                  onChange={handleChange}
                  placeholder="6041234567"
                  className="font-mono tracking-wider"
                />
              </div>

              <div>
                <FieldLabel>Address</FieldLabel>
                <IconInput
                  icon={MapPin}
                  name="address"
                  value={fields.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            {/* Store hours */}
            <div className="px-6 py-5">
              <SectionLabel>Store Hours</SectionLabel>
              {DAYS.map((day) => (
                <DayHoursRow
                  key={day.key}
                  day={day}
                  range={hours[day.key]}
                  onChange={(r) =>
                    setHours((prev) => ({ ...prev, [day.key]: r }))
                  }
                />
              ))}
            </div>

            {/* Desktop save footer */}
            <div className="hidden sm:flex px-6 py-4 items-center justify-between bg-secondary/20">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <Clock3 className="h-3.5 w-3.5" />
                <span>
                  {isPending
                    ? "Saving changes…"
                    : isDirty
                    ? "You have unsaved changes"
                    : "No changes made"}
                </span>
              </div>
              <SaveButton
                onClick={handleSubmit}
                disabled={isDisabled}
                isPending={isPending}
                className="h-9 px-5"
              />
            </div>
          </div>
        </div>

        {/* Mobile sticky save bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 px-4 py-3 bg-background/90 backdrop-blur-md border-t border-border/40 z-50">
          <SaveButton
            onClick={handleSubmit}
            disabled={isDisabled}
            isPending={isPending}
            className="w-full h-12"
          />
        </div>

        {/* Spacer to clear mobile sticky bar */}
        <div className="sm:hidden h-20" />
      </div>
    </div>
  );
}