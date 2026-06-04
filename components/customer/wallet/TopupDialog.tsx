"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Delete,
  Wallet,
  ArrowLeft,
  Gift,
  CreditCard,
  Banknote,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PaymentModeToggle } from "@/components/cashier/wallet/PaymentModeToggle";
import { walletTopUpAction } from "@/actions/cashier/walletTopUp.actions";
import { toast } from "sonner";

const PRESETS = [5, 10, 20, 50, 100, 150, 200, 250];

type Step = "amount" | "confirm";

export function TopUpDialog({
  customerId,
  userRole,
  cartTotal,
  WalletBalance,
}: {
  customerId?: string;
  userRole?: string;
  cartTotal?: number;
  WalletBalance?: number;
}) {
  const adminRole = userRole === "admin";
  const isCashier = !!customerId && !adminRole;
  const needsConfirmation = adminRole || isCashier;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("amount");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | null>(200);
  const [inputVal, setInputVal] = useState("200");
  const [paymentMode, setPaymentMode] = useState<"cash" | "card" | "gift">(
    "card",
  );
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  const [cashReceivedInput, setCashReceivedInput] = useState("");

  const isCashPayment = isCashier && paymentMode === "cash";

  const changeDue =
    isCashPayment && cashReceived !== null && amount !== null
      ? cashReceived - amount
      : null;

  const cashReceivedIsValid =
    !isCashPayment ||
    (cashReceived !== null && amount !== null && cashReceived >= amount);

  // exact amount owed in dollars (both cartTotal and WalletBalance are in cents)
  const exactOwedCents = Math.max((cartTotal ?? 0) - (WalletBalance ?? 0), 0);
  const exactOwedDollars = exactOwedCents / 100;

  const handlePreset = (preset: number) => {
    setAmount(preset);
    setInputVal(String(preset));

    if (isCashPayment) {
      setCashReceived(preset);
      setCashReceivedInput(String(preset));
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setAmount(val === "" ? null : Number(val));
  };

  const handleCashReceivedInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCashReceivedInput(val);
    setCashReceived(val === "" ? null : Number(val));
  };

  const handleClear = () => {
    setAmount(null);
    setInputVal("");
    setCashReceived(null);
    setCashReceivedInput("");
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setTimeout(() => setStep("amount"), 200);
  };

  const handleProceed = () => {
    if (!amount) return;
    if (!cashReceivedIsValid) {
      toast.error("Cash received must be at least the top-up amount.");
      return;
    }
    if (needsConfirmation) {
      setStep("confirm");
    } else {
      handleCheckout();
    }
  };

  const handleCheckout = async () => {
    if (!amount) return;
    if (!cashReceivedIsValid) {
      toast.error("Cash received must be at least the top-up amount.");
      return;
    }

    setLoading(true);
    try {
      if (adminRole && customerId) {
        const response = await walletTopUpAction(
          customerId,
          "gift",
          amount * 100,
          "admin",
        );
        if (response.success) {
          toast.success(response.message);
          handleClose();
        } else toast.error(response.message);
        return;
      }

      if (customerId && !adminRole) {
        const response = await walletTopUpAction(
          customerId,
          paymentMode,
          amount * 100,
          "cashier",
        );
        if (response.success) {
          toast.success(response.message);
          handleClose();
        } else toast.error(response.message);
        return;
      }

      // Self top-up via Stripe
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="rounded-full px-5">
          Top Up
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-sm p-0 overflow-hidden gap-0 border-0"
        style={{
          borderRadius: "24px",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        <DialogTitle className="sr-only">Top Up Wallet</DialogTitle>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2">
            {step === "confirm" && (
              <button
                onClick={() => setStep("amount")}
                disabled={loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: "var(--color-secondary)" }}
              >
                <ArrowLeft
                  size={13}
                  style={{ color: "var(--color-primary)" }}
                />
              </button>
            )}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-secondary)" }}
            >
              <Wallet size={14} style={{ color: "var(--color-primary)" }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {step === "amount" ? "Top Up Wallet" : "Confirm Top Up"}
            </p>
          </div>
          <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
            CAD
          </p>
        </div>

        {/* ── Step 1: Amount entry ─────────────────────────────────────── */}
        {step === "amount" && (
          <div className="p-5 pb-4 space-y-5">
            {/* Amount input */}
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: "var(--color-secondary)" }}
            >
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-light"
                  style={{ color: "var(--color-primary)", opacity: 0.6 }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={inputVal}
                  onChange={handleInput}
                  placeholder="0"
                  className="text-4xl font-bold bg-transparent border-none outline-none w-36 placeholder:text-gray-300"
                  style={{
                    color: "var(--color-foreground)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
              </div>
              <button
                onClick={handleClear}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  background: inputVal
                    ? "var(--color-primary)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <Delete
                  size={14}
                  style={{
                    color: inputVal
                      ? "var(--color-primary-foreground)"
                      : "#aaa",
                  }}
                />
              </button>
            </div>

            {/* Presets */}
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2.5">
                Quick Select
              </p>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.filter((p) => p !== 250).map((preset) => {
                  const isSelected =
                    amount === preset && inputVal === String(preset);
                  return (
                    <button
                      key={preset}
                      onClick={() => handlePreset(preset)}
                      className="rounded-xl py-2.5 text-sm transition-all active:scale-95"
                      style={{
                        background: isSelected
                          ? "var(--color-primary)"
                          : "var(--color-secondary)",
                        color: isSelected
                          ? "var(--color-primary-foreground)"
                          : "var(--color-secondary-foreground)",
                        fontWeight: isSelected ? 700 : 500,
                        transform: isSelected ? "scale(1.04)" : "scale(1)",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(0,0,0,0.15)"
                          : "none",
                      }}
                    >
                      ${preset}
                    </button>
                  );
                })}

              {exactOwedCents > 0 ? (() => {
                const isExactSelected = amount === exactOwedDollars && inputVal === String(exactOwedDollars);
                return (
                  <button
                    onClick={() => handlePreset(exactOwedDollars)}
                    className="rounded-xl py-2.5 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
                    style={{
                      background: isExactSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                      color: isExactSelected
                        ? "var(--color-primary-foreground)"
                        : "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: "11px",
                      lineHeight: 1.2,
                      border: isExactSelected
                        ? "1.5px solid var(--color-primary)"
                        : "1.5px solid color-mix(in srgb, var(--color-primary) 35%, transparent)",
                      transform: isExactSelected ? "scale(1.04)" : "scale(1)",
                      boxShadow: isExactSelected ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "-0.3px" }}>
                      ${exactOwedDollars.toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        opacity: isExactSelected ? 0.75 : 0.55,
                      }}
                    >
                      exact
                    </span>
                  </button>
                );
              })() : (
                <button
                  onClick={() => handlePreset(250)}
                  className="rounded-xl py-2.5 text-sm transition-all active:scale-95"
                  style={{
                    background: amount === 250 && inputVal === "250" ? "var(--color-primary)" : "var(--color-secondary)",
                    color: amount === 250 && inputVal === "250" ? "var(--color-primary-foreground)" : "var(--color-secondary-foreground)",
                    fontWeight: amount === 250 && inputVal === "250" ? 700 : 500,
                    transform: amount === 250 && inputVal === "250" ? "scale(1.04)" : "scale(1)",
                    boxShadow: amount === 250 && inputVal === "250" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  $250
                </button>
              )}
              </div>
            </div>

            {/* Payment mode — cashier only (not admin, not self) */}
            {customerId && !adminRole && (
              <PaymentModeToggle
                paymentMode={paymentMode}
                setPaymentMode={setPaymentMode}
              />
            )}

            {isCashPayment && (
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "var(--color-secondary)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Cash Received
                  </p>
                  <Banknote
                    size={16}
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-xl font-light"
                    style={{ color: "var(--color-primary)", opacity: 0.6 }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min={amount ?? 0}
                    value={cashReceivedInput}
                    onChange={handleCashReceivedInput}
                    placeholder="0"
                    className="text-3xl font-bold bg-transparent border-none outline-none w-full placeholder:text-gray-300"
                    style={{
                      color: "var(--color-foreground)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>

                {amount && cashReceived !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--color-muted-foreground)" }}>
                      Change due
                    </span>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          changeDue !== null && changeDue >= 0
                            ? "var(--color-primary)"
                            : "#ef4444",
                      }}
                    >
                      {changeDue !== null && changeDue >= 0
                        ? `$${changeDue.toFixed(2)}`
                        : "Insufficient cash"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <Button
              disabled={!amount || !cashReceivedIsValid}
              onClick={handleProceed}
              className="w-full py-5 rounded-2xl font-bold text-base transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                boxShadow: amount ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {!amount
                ? "Enter an Amount"
                : isCashPayment && !cashReceivedIsValid
                  ? "Enter Cash Received"
                  : `Continue — $${amount.toFixed(2)}`}
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full rounded-2xl font-medium"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* ── Step 2: Confirmation (cashier + admin only) ──────────────── */}
        {step === "confirm" && amount && (
          <div className="p-5 space-y-4">
            {/* Summary card */}
            <div
              className="rounded-2xl px-4 py-4 space-y-3"
              style={{ background: "var(--color-secondary)" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Amount
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  ${amount.toFixed(2)} CAD
                </span>
              </div>

              {/* Show method row only for cashier, not admin (admin always gifts) */}
              {customerId && !adminRole && (
                <>
                  <Separator style={{ opacity: 0.15 }} />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Payment method
                    </span>
                    <div className="flex items-center gap-2">
                      {paymentMode === "card" ? (
                        <>
                          <CreditCard
                            size={15}
                            style={{ color: "var(--color-primary)" }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            Card
                          </span>
                        </>
                      ) : paymentMode === "gift" ? (
                        <>
                          <Gift
                            size={15}
                            style={{ color: "var(--color-primary)" }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            Gift
                          </span>
                        </>
                      ) : (
                        <>
                          <Banknote
                            size={15}
                            style={{ color: "var(--color-primary)" }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            Cash
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {isCashPayment && (
                <>
                  <Separator style={{ opacity: 0.15 }} />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Cash received
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      ${cashReceived?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Change due
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      ${changeDue?.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {/* Admin: show gift label */}
              {adminRole && (
                <>
                  <Separator style={{ opacity: 0.15 }} />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Type
                    </span>
                    <div className="flex items-center gap-2">
                      <Gift
                        size={15}
                        style={{ color: "var(--color-primary)" }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        Gift top-up
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Change method hint — cashier only */}
            {customerId && !adminRole && (
              <p
                className="text-xs text-center"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Wrong method?{" "}
                <button
                  onClick={() => setStep("amount")}
                  className="font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--color-primary)" }}
                >
                  Go back and change it
                </button>
              </p>
            )}

            {/* Confirm button */}
            <Button
              disabled={loading}
              onClick={handleCheckout}
              className="w-full py-5 rounded-2xl font-bold text-base transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Processing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {adminRole
                    ? "Yes, add gift balance"
                    : `Confirm — ${paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1)} · $${amount.toFixed(2)}`}
                </span>
              )}
            </Button>

            <div className="flex gap-2">
              {!adminRole && (
                <Button
                  variant="ghost"
                  disabled={loading}
                  onClick={() => setStep("amount")}
                  className="w-full rounded-2xl font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <ArrowLeft size={14} className="mr-1.5" />
                  Change method
                </Button>
              )}
              <Button
                variant="ghost"
                disabled={loading}
                onClick={handleClose}
                className="w-full rounded-2xl font-medium"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}