"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TriggerResult {
  processedAt: string;
  totalStores: number;
  successful: number;
  skipped: number;
  errors: number;
  results: {
    storeId: string;
    storeName: string;
    status: "success" | "skipped" | "error" | "no_orders";
    message: string;
    payoutId?: string;
  }[];
}

export default function ManualPayoutTrigger() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<TriggerResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setLastResult(null);

    try {
      const res = await fetch("/api/admin/trigger-payouts", { method: "POST" });
      const data: TriggerResult = await res.json();

      if (!res.ok) {
        toast.error("Trigger failed — check the details below");
      } else if (data.errors > 0) {
        toast.warning(`Completed with ${data.errors} error(s)`);
      } else {
        toast.success(
          data.successful > 0
            ? `Generated ${data.successful} payout(s) successfully`
            : "Job ran — no stores were due today",
        );
      }

      setLastResult(data);
      setShowDetails(true);
    } catch (err) {
      toast.error("Network error — could not reach the trigger endpoint");
    } finally {
      setIsRunning(false);
    }
  };

  const statusBadge = (status: TriggerResult["results"][0]["status"]) => {
    const map = {
      success: "bg-green-100 text-green-700",
      skipped: "bg-gray-100 text-gray-600",
      error: "bg-red-100 text-red-700",
      no_orders: "bg-amber-100 text-amber-700",
    };
    return map[status];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Manual Trigger</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Run the auto-payout job right now across all enabled stores
          </p>
        </div>
        <Button
          onClick={handleRun}
          disabled={isRunning}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              Run Now
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {lastResult && (
        <div className="p-5 space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Stores", value: lastResult.totalStores, color: "text-gray-700" },
              { label: "Success", value: lastResult.successful, color: "text-emerald-600" },
              { label: "Skipped", value: lastResult.skipped, color: "text-gray-500" },
              { label: "Errors", value: lastResult.errors, color: "text-red-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
              >
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Processed at */}
          <p className="text-xs text-gray-400 text-right">
            Processed at {new Date(lastResult.processedAt).toLocaleTimeString("en-CA")}
          </p>

          {/* Detailed results toggle */}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showDetails ? "Hide" : "Show"} store breakdown
          </button>

          {showDetails && (
            <div className="space-y-2">
              {lastResult.results.map((r) => (
                <div
                  key={r.storeId}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {r.storeName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{r.message}</p>
                    {r.payoutId && (
                      <p className="text-[10px] font-mono text-gray-400 mt-1">
                        ID: {r.payoutId}
                      </p>
                    )}
                  </div>
                  <Badge className={`${statusBadge(r.status)} border-0 shrink-0 capitalize`}>
                    {r.status === "no_orders" ? "No orders" : r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}