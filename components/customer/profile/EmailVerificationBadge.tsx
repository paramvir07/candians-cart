"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  MailWarning,
  Mail,
  Pencil,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export default function EmailVerificationBadge({
  email,
  verified,
}: {
  email: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <BadgeCheck className="h-3.5 w-3.5" />
        Email verified
      </span>
    );
  }

  const handleResend = async () => {
    try {
      setSending(true);

      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/email-verified?type=signup",
      });

      if (error) {
        toast.error(error.message ?? "Couldn't send verification email.");
        return;
      }

      toast.success("Verification email sent! Check your inbox.");
      setOpen(false);
      router.refresh();
    } finally {
      setSending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Verify your email address"
          className="group inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
        >
          <MailWarning className="h-3.5 w-3.5" />
          Verify email
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-80 overflow-hidden rounded-2xl p-0"
      >
        <div className="border-b border-border/60 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <MailWarning className="h-4 w-4 text-amber-600" />
            </div>

            <div>
              <p className="text-sm font-bold text-foreground">
                Verify your email address
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Confirm that this email belongs to you and keep your account
                secure.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Verification email will be sent to
          </p>
          <p className="mt-0.5 break-all text-xs font-semibold text-foreground">
            {email}
          </p>
        </div>

        <div className="space-y-1 border-t border-border/60 p-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="flex w-full items-center gap-2.5 rounded-xl bg-primary px-3 py-2.5 text-left text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold leading-none">
                {sending ? "Sending email…" : "Send verification email"}
              </p>
              <p className="mt-1 text-[10px] text-primary-foreground/75">
                We’ll send you a secure verification link
              </p>
            </div>
          </button>

          <Link
            href="/customer/change-email"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-xs font-semibold leading-none text-foreground">
                Use a different email
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Change the address before verifying
              </p>
            </div>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
