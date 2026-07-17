import OAuthConsentContent from "@/components/oauth/consent/OAuthConsentContent";
import { Suspense } from "react";

function ConsentFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">
          Loading authorization request...
        </p>
      </div>
    </main>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={<ConsentFallback />}>
      <OAuthConsentContent />
    </Suspense>
  );
}