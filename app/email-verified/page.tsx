import { CheckCircle2, MailCheck, ShieldCheck, Mail } from "lucide-react";

export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isConfirmation = type === "confirmation";
  const isVerification = type === "verification";

  if (isConfirmation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">

          {/* Blue icon for "action needed" */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 shadow-sm">
            <Mail className="h-7 w-7 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              One more step!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a verification email to your <span className="text-foreground font-medium">new address</span>. Click the link in that email to finish the change.
            </p>
          </div>

          {/* Step indicator */}
          <div className="rounded-2xl border border-border bg-card px-4 py-4 text-left shadow-sm space-y-3">
            <p className="text-xs font-semibold text-foreground">What happens next</p>
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You confirmed the request from your old email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 mt-0.5">
                <span className="text-[10px] font-bold text-blue-600">2</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open your <span className="text-foreground font-medium">new inbox</span> and click the verification link to complete the change
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Can't find it? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  // isVerification or fallback
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm text-center space-y-6">

        {/* Green icon for "all done" */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 shadow-sm">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Email verified!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your new email address has been confirmed and is now linked to your account.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm">
          <div className="flex items-start gap-3">
            <MailCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Update complete
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You can now sign in with your new email. If this wasn't you,
                reset your password immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          You can safely close this page
        </div>

      </div>
    </div>
  );
}