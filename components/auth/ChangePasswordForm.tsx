"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    if (next.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
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

  const fields = [
    {
      label: "Current password",
      value: current,
      setter: setCurrent,
      show: showCurrent,
      toggle: () => setShowCurrent((v) => !v),
      placeholder: "Enter your current password",
    },
    {
      label: "New password",
      value: next,
      setter: setNext,
      show: showNext,
      toggle: () => setShowNext((v) => !v),
      placeholder: "At least 8 characters",
    },
    {
      label: "Confirm new password",
      value: confirm,
      setter: setConfirm,
      show: showConfirm,
      toggle: () => setShowConfirm((v) => !v),
      placeholder: "Repeat your new password",
    },
  ];

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Password updated!
          </h1>
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
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/60">
        <Link
          href="/customer/profile"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Change Password</h1>
      </div>

      {/* ── Centered content ── */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Card */}
            <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
              {/* Card header strip */}
              <div
                className="px-5 sm:px-6 py-4 border-b border-border/60 flex items-center gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.9669 0.0287 158.0617) 0%, oklch(1 0 0) 100%)",
                }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-widest">
                    Security
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Update your account password
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="px-5 sm:px-6 py-5 space-y-4">
                {fields.map(
                  ({ label, value, setter, show, toggle, placeholder }) => (
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
                          {show ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 font-medium px-1">{error}</p>
            )}

            {/* Notice */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                🔒 For your security, all other active sessions will be signed
                out when you update your password.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1 gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px]">
                  i
                </span>
                Changes save immediately
              </span>
              <div className="flex gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none h-10 px-5 rounded-full text-sm font-semibold"
                  onClick={() => router.push("/customer/profile")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none h-10 px-6 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
