"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";

export default function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const clientId = searchParams.get("client_id");

  async function handleConsent(accept: boolean) {
    try {
      setIsPending(true);
      setErrorMessage("");

      const result = await authClient.oauth2.consent({
        accept,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ?? "Unable to complete authorization.",
        );
        setIsPending(false);
      }
    } catch (error) {
      console.error("OAuth consent failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete authorization.",
      );

      setIsPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Connect to Gift Cart
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Gift Cart is requesting permission to access your Canadian&apos;s
          Cart profile.
        </p>

        {clientId && (
          <p className="mt-2 break-all text-xs text-muted-foreground">
            Client: {clientId}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleConsent(false)}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleConsent(true)}
            className="flex-1"
          >
            {isPending ? "Connecting..." : "Allow"}
          </Button>
        </div>
      </div>
    </main>
  );
}