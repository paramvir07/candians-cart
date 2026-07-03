"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ChevronLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { changePasswordAction } from "@/actions/auth/changePassword.actions";
import { toast } from "sonner";
import { getPasswordChecks } from "@/zod/schemas/customer/customerSignup";

export default function ChangePasswordForm() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isPending, setIsPending] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

const passwordChecks = getPasswordChecks(next);

  const isPasswordStrong = passwordChecks.every((check) => check.valid);
  const passwordsMatch = confirm.length > 0 && next === confirm;

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!current.trim()) {
      toast.error("Current password is required.");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("New password does not meet the strength requirements.");
      return;
    }

    if (next !== confirm) {
      toast.error("New passwords don't match.");
      return;
    }

    const formData = new FormData();
    formData.set("currentPassword", current);
    formData.set("newPassword", next);
    formData.set("confirmPassword", confirm);

    try {
      setIsPending(true);

      const result = await changePasswordAction(undefined, formData);

      if (!result.success) {
        toast.error(result.message || "Could not update password.", {
          id: "change-password-error",
        });
        return;
      }

      toast.success("Password updated successfully.", {
        id: "change-password-success",
      });
      router.replace("/customer/profile/edit");
      router.refresh();
    } catch (error) {
      console.error("Change password submit error:", error);

      toast.error("Something went wrong. Please try again.", {
        id: "change-password-error",
      });
    } finally {
      setIsPending(false);
    }
  }

  const fields = [
    {
      id: "currentPassword",
      name: "currentPassword",
      label: "Current password",
      value: current,
      setter: setCurrent,
      show: showCurrent,
      toggle: () => setShowCurrent((v) => !v),
      placeholder: "Enter your current password",
      autoComplete: "current-password",
      helperText: "Enter the password you currently use to sign in.",
    },
    {
      id: "newPassword",
      name: "newPassword",
      label: "New password",
      value: next,
      setter: setNext,
      show: showNext,
      toggle: () => setShowNext((v) => !v),
      placeholder: "Create a strong new password",
      autoComplete: "new-password",
      helperText: "Use a mix of uppercase, lowercase, numbers, and symbols.",
    },
    {
      id: "confirmPassword",
      name: "confirmPassword",
      label: "Confirm new password",
      value: confirm,
      setter: setConfirm,
      show: showConfirm,
      toggle: () => setShowConfirm((v) => !v),
      placeholder: "Re-enter your new password",
      autoComplete: "new-password",
      helperText: "Type the same new password again.",
    },
  ];

  return (
    <div className="min-h-[60vh] flex flex-col">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/60">
        <Link
          href="/customer/profile/edit"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <h1 className="text-base font-bold text-foreground">Change Password</h1>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
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

              <div className="px-5 sm:px-6 py-5 space-y-4">
                {fields.map(
                  ({
                    id,
                    name,
                    label,
                    value,
                    setter,
                    show,
                    toggle,
                    placeholder,
                    autoComplete,
                    helperText,
                  }) => (
                    <div key={id}>
                      <label
                        htmlFor={id}
                        className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide"
                      >
                        {label}
                      </label>

                      <div className="relative">
                        <input
                          id={id}
                          name={name}
                          type={show ? "text" : "password"}
                          required
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          autoComplete={autoComplete}
                          minLength={id === "newPassword" ? 8 : undefined}
                          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/50"
                        />

                        <button
                          type="button"
                          onClick={toggle}
                          aria-label={show ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                        >
                          {show ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {helperText}
                      </p>

                      {id === "newPassword" && (
                        <div className="mt-3 rounded-2xl border border-border/60 bg-secondary/30 px-3 py-3 space-y-2">
                          <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                            Password must include:
                          </p>

                          <div className="grid gap-1.5">
                            {passwordChecks.map((check) => {
                              const shouldShowError =
                                next.length > 0 && !check.valid;

                              return (
                                <div
                                  key={check.label}
                                  className="flex items-center gap-2 text-[11px]"
                                >
                                  {check.valid ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                  ) : (
                                    <Circle
                                      className={
                                        shouldShowError
                                          ? "h-3.5 w-3.5 text-red-400 shrink-0"
                                          : "h-3.5 w-3.5 text-muted-foreground/50 shrink-0"
                                      }
                                    />
                                  )}

                                  <span
                                    className={
                                      check.valid
                                        ? "font-medium text-primary"
                                        : shouldShowError
                                          ? "font-medium text-red-400"
                                          : "font-medium text-muted-foreground"
                                    }
                                  >
                                    {check.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {id === "confirmPassword" && confirm.length > 0 && (
                        <p
                          className={
                            passwordsMatch
                              ? "mt-1.5 text-[11px] font-medium text-primary"
                              : "mt-1.5 text-[11px] font-medium text-red-400"
                          }
                        >
                          {passwordsMatch
                            ? "Passwords match."
                            : "Passwords do not match."}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                🔒 For your security, all other active sessions will be signed
                out when you update your password.
              </p>
            </div>

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
                  onClick={() => router.push("/customer/profile/edit")}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    !current ||
                    !isPasswordStrong ||
                    !passwordsMatch
                  }
                  className="flex-1 sm:flex-none h-10 px-6 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isPending ? (
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
