"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, Mail, Pencil, Loader2 } from "lucide-react";
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
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    );
  }

  const handleResend = async () => {
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/email-verified?type=signup",
    });
    setSending(false);
    setOpen(false);

    if (error) {
      toast.error(error.message ?? "Couldn't send verification email.");
    } else {
      toast.success("Verification email sent! Check your inbox.");
      router.refresh();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 hover:bg-amber-500/20 transition-colors">
          <ShieldAlert className="h-3 w-3" />
          Not verified
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 rounded-2xl p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/40">
          <p className="text-xs font-bold text-foreground">Email not verified</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 break-all">
            {email}
          </p>
        </div>

        <div className="p-2 space-y-1">
          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-secondary/60 transition-colors disabled:opacity-60"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">
                {sending ? "Sending…" : "Resend verification email"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Sends a new link to this address
              </p>
            </div>
          </button>

          <Link
            href="/customer/change-email"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-secondary/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">
                Change email address
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Wrong email? Update it instead
              </p>
            </div>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}