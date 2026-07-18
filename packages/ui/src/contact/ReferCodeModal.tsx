"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, Mail, TicketCheck } from "lucide-react";
import { SendReferralCode } from "@/actions/resend/ResendActions";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
});

interface ReferCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY = { name: "", email: "" };

export function ReferCodeModal({ open, onOpenChange }: ReferCodeModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setForm(EMPTY);
    setLoading(false);
    setSubmitted(false);
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  async function handleSubmit() {
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Check your details.");
      return;
    }
    setLoading(true);
    try {
      const res = await SendReferralCode({
        name: result.data.name.trim(),
        email: result.data.email.trim().toLowerCase(),
      });
      if (!res.success) {
        toast.error(res.error ?? "Something went wrong. Try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden gap-0 sm:max-w-100 shadow-2xl"
        style={{
          borderRadius: "1.5rem",
          border: "1px solid var(--border)",
          background: "var(--background)",
        }}
      >
        {submitted ? (
          /* ── Success state ── */
          <>
            {/* Illustration area */}
            <div
              className="relative w-full flex items-center justify-center overflow-hidden"
              style={{
                height: 200,
                background: "linear-gradient(160deg, var(--secondary) 0%, oklch(0.88 0.06 155) 100%)",
              }}
            >
              {/* Decorative blobs */}
              <div className="absolute w-40 h-40 rounded-full -top-10 -left-10 opacity-40"
                style={{ background: "var(--primary)" }} />
              <div className="absolute w-24 h-24 rounded-full -bottom-8 -right-8 opacity-30"
                style={{ background: "oklch(0.6983 0.1337 165.4626)" }} />
              {/* Icon */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "white" }}
                >
                  <TicketCheck className="w-10 h-10" style={{ color: "var(--primary)" }} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center text-center px-7 pt-6 pb-8 gap-4">
              <DialogTitle
                className="text-[20px] font-extrabold"
                style={{ color: "var(--foreground)", letterSpacing: "-0.035em" }}
              >
                You're on the list! 🎉
              </DialogTitle>
              <DialogDescription
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                Your referral code is heading to{" "}
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {form.email}
                </span>
                . Expect it within{" "}
                <span className="font-semibold" style={{ color: "var(--primary)" }}>
                  30 minutes
                </span>
                .
              </DialogDescription>
              <Button
                onClick={() => handleOpenChange(false)}
                className="w-full h-12 rounded-2xl font-bold text-sm mt-1"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  letterSpacing: "-0.01em",
                }}
              >
                Great, thanks! ✓
              </Button>
            </div>
          </>
        ) : (
          /* ── Form state ── */
          <>
            {/* Illustration area */}
            <div
              className="relative w-full flex items-end justify-center overflow-hidden"
              style={{
                height: 190,
                background: "linear-gradient(160deg, oklch(0.88 0.07 150) 0%, var(--secondary) 100%)",
              }}
            >
              {/* Blobs */}
              <div className="absolute w-52 h-52 rounded-full -top-16 -right-16 opacity-35"
                style={{ background: "var(--primary)" }} />
              <div className="absolute w-32 h-32 rounded-full top-4 -left-12 opacity-25"
                style={{ background: "oklch(0.7858 0.1598 85.3091)" }} />

              {/* Central icon cluster */}
              <div className="relative z-10 mb-5 flex items-end gap-3">
                {/* Envelope icon card */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md rotate-[-8deg] translate-y-2"
                  style={{ background: "white" }}
                >
                  <Mail className="w-8 h-8" style={{ color: "var(--primary)" }} />
                </div>
                {/* Ticket icon card — main, taller */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: "var(--primary)" }}
                >
                  <span className="text-4xl">🎟️</span>
                </div>
                {/* Sparkle card */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md rotate-[8deg] translate-y-2"
                  style={{ background: "white" }}
                >
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-7 pt-6 pb-7 flex flex-col gap-5">
              <div className="space-y-1">
                <DialogTitle
                  className="text-[20px] font-extrabold"
                  style={{ color: "var(--foreground)", letterSpacing: "-0.035em" }}
                >
                  Request a referral code
                </DialogTitle>
                <DialogDescription
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Invite-only access. Drop your details below.
                </DialogDescription>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="ref-name"
                    className="text-[11px] font-bold uppercase"
                    style={{ color: "var(--muted-foreground)", letterSpacing: "0.07em" }}
                  >
                    Full name
                  </Label>
                  <Input
                    id="ref-name"
                    name="name"
                    placeholder="Jordan Smith"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    autoComplete="name"
                    className="h-11 text-sm rounded-xl"
                    style={{
                      background: "var(--muted)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="ref-email"
                    className="text-[11px] font-bold uppercase"
                    style={{ color: "var(--muted-foreground)", letterSpacing: "0.07em" }}
                  >
                    Email address
                  </Label>
                  <Input
                    id="ref-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    autoComplete="email"
                    className="h-11 text-sm rounded-xl"
                    style={{
                      background: "var(--muted)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2.5">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl text-sm font-bold gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: loading ? "var(--muted)" : "var(--primary)",
                    color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send request
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}