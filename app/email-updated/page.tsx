import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";

export default function EmailUpdatedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm text-center space-y-6">

        {/* Success icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 shadow-sm">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Email updated
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your email address has been successfully verified and linked to your account.
          </p>
        </div>

        {/* Security status card */}
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm">
          <div className="flex items-start gap-3">
            <MailCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Update complete
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                This change has been applied to your account. If this was not you,
                reset your password immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Security reassurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          You can safely close this page
        </div>
      </div>
    </div>
  );
}