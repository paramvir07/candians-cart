"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Clock,
  Calendar,
  CalendarDays,
  Zap,
  ZapOff,
  Loader2,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPayoutScheduleAction,
  updatePayoutScheduleAction,
} from "@/actions/admin/payoutSchedule/UpdatePayoutSchedule.action";
import { PayoutFrequency } from "@/db/models/store/store.model";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTH_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

const ORDINAL = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ScheduleData {
  storeName: string;
  enabled: boolean;
  frequency: PayoutFrequency;
  dayOfMonth: number;
  dayOfWeek: number;
  lastPayoutDate: string | null;
  nextPayoutDate: string | null;
}

interface PayoutScheduleConfigProps {
  storeId: string;
}

// ─── Sub-component: Info row ───────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function PayoutScheduleConfig({ storeId }: PayoutScheduleConfigProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<PayoutFrequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState(1);

  // ── Fetch current schedule ──────────────────────────────────────────────────
  const fetchSchedule = async () => {
    setIsLoading(true);
    const result = await getPayoutScheduleAction(storeId);
    if (result.success && result.data) {
      const d = result.data;
      setSchedule(d);
      setEnabled(d.enabled);
      setFrequency(d.frequency);
      setDayOfMonth(d.dayOfMonth);
      setDayOfWeek(d.dayOfWeek);
    } else {
      toast.error(result.message || "Failed to load schedule");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, [storeId]);

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePayoutScheduleAction(storeId, {
        enabled,
        frequency,
        dayOfMonth,
        dayOfWeek,
      });

      if (result.success) {
        toast.success(result.message);
        await fetchSchedule(); // Refresh to show updated nextPayoutDate
      } else {
        toast.error(result.message);
      }
    });
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const scheduleDescription = () => {
    if (!enabled) return "Auto-payouts are currently disabled";
    if (frequency === "monthly") {
      return `Runs on the ${ORDINAL(dayOfMonth)} of every month`;
    }
    return `Runs every other ${DAY_NAMES[dayOfWeek]}`;
  };

  const hasChanges =
    schedule &&
    (enabled !== schedule.enabled ||
      frequency !== schedule.frequency ||
      dayOfMonth !== schedule.dayOfMonth ||
      dayOfWeek !== schedule.dayOfWeek);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="h-4 w-40 bg-gray-100 rounded-md animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded-md animate-pulse mt-1.5" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Auto Payout Schedule</h3>
            <p className="text-xs text-gray-400 mt-0.5">{scheduleDescription()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {enabled ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 gap-1.5">
              <Zap className="w-3 h-3 fill-emerald-600" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 text-gray-500">
              <ZapOff className="w-3 h-3" />
              Disabled
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">Enable auto-payouts</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Automatically generate payout records on a schedule
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={isPending}
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>

        {/* Schedule config — only shown when enabled */}
        <div
          className={`space-y-4 transition-all duration-200 ${
            enabled ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["monthly", "biweekly"] as PayoutFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    frequency === freq
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {freq === "monthly" ? (
                    <Calendar className="w-4 h-4 shrink-0" />
                  ) : (
                    <CalendarDays className="w-4 h-4 shrink-0" />
                  )}
                  <span className="capitalize">{freq}</span>
                  {frequency === freq && (
                    <CheckCircle2 className="w-3.5 h-3.5 ml-auto fill-emerald-600 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Day picker — changes based on frequency */}
          {frequency === "monthly" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Day of Month
              </label>
              <Select
                value={String(dayOfMonth)}
                onValueChange={(v) => setDayOfMonth(Number(v))}
              >
                <SelectTrigger className="rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_DAYS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {ORDINAL(d)} of the month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Capped at the 28th to work reliably in February
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Day of Week
              </label>
              <Select
                value={String(dayOfWeek)}
                onValueChange={(v) => setDayOfWeek(Number(v))}
              >
                <SelectTrigger className="rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>
                      Every other {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Schedule info — last/next payout dates */}
        {schedule && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Schedule Info
              </p>
            </div>
            <div className="px-4 py-1">
              <InfoRow
                label="Last payout generated"
                value={formatDate(schedule.lastPayoutDate)}
              />
              <InfoRow
                label="Next payout scheduled"
                value={
                  schedule.enabled && schedule.nextPayoutDate
                    ? formatDate(schedule.nextPayoutDate)
                    : "—"
                }
              />
              <InfoRow
                label="Current frequency"
                value={
                  schedule.enabled
                    ? schedule.frequency === "monthly"
                      ? `Monthly (${ORDINAL(schedule.dayOfMonth)})`
                      : `Biweekly (${DAY_NAMES[schedule.dayOfWeek]}s)`
                    : "Disabled"
                }
              />
            </div>
          </div>
        )}

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-semibold disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {hasChanges ? "Save Schedule" : "No Changes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}