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
            Almost there!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a verification email to your new address. Click the link
            in that email to confirm and activate your new email.
          </p>
        </div>

        {/* Steps card */}
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <MailCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Check your new inbox
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Open the email we just sent to your new address and click
                the verification link to complete the change.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Didn't receive it?
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Check your spam folder. If this wasn't you, reset your
                password immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          Your email won't change until you verify the new one.
        </p>
      </div>
    </div>
  );
}