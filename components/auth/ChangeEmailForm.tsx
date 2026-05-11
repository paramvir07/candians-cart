"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export default function ChangeEmailForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await authClient.changeEmail({
      newEmail: email,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Something went wrong.");
    } else {
      setSuccess(true);
    }
  }

  const routerFunc = () =>{
    router.push("/customer/profile")
    router.refresh()
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-semibold">{email}</span>.
            You must confirm it to complete the change.
          </p>
          <Button
            className="w-full h-11 rounded-full text-sm font-bold shadow-lg shadow-primary/20"
            onClick={routerFunc}
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/60">
        <Link
          href="/customer/profile/edit"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Change Email</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
              
              {/* Header strip */}
              <div className="px-5 sm:px-6 py-4 border-b border-border/60 flex items-center gap-3 bg-secondary/40">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Account
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Update your email address
                  </p>
                </div>
              </div>

              {/* Field */}
              <div className="px-5 sm:px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    New email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium px-1">{error}</p>
            )}

            {/* Notice */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                📩 A confirmation link will be sent to your new email. The change
                will not apply until it is verified.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 rounded-full text-sm font-semibold"
                onClick={() => router.push("/customer/profile/edit")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 rounded-full text-sm font-bold shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send confirmation"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}