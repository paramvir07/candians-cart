"use client";

import { useState } from "react";
import { createGCOAuthClient } from "@/actions/auth/create-gc-oauth-client.action";
import { Button } from "@/components/ui/button";

type Credentials = {
  clientId: string;
  clientSecret: string;
};

export default function CreateOAuthClientButton() {
  const [isPending, setIsPending] = useState(false);
  const [credentials, setCredentials] =
    useState<Credentials | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreate() {
    try {
      setIsPending(true);
      setErrorMessage("");

      const result = await createGCOAuthClient();

      if (
        !result.success ||
        !result.clientId ||
        !result.clientSecret
      ) {
        setErrorMessage(
          result.message ?? "Could not create OAuth client.",
        );
        return;
      }

      setCredentials({
        clientId: result.clientId,
        clientSecret: result.clientSecret,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create OAuth client.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-5">
      {!credentials && (
        <Button
          type="button"
          disabled={isPending}
          onClick={handleCreate}
        >
          {isPending
            ? "Creating..."
            : "Create Gift Cart OAuth Client"}
        </Button>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {credentials && (
        <div className="space-y-4 rounded-xl border p-5">
          <div>
            <p className="text-sm font-medium">Client ID</p>
            <code className="mt-1 block break-all rounded bg-muted p-3 text-xs">
              {credentials.clientId}
            </code>
          </div>

          <div>
            <p className="text-sm font-medium">
              Client secret
            </p>

            <code className="mt-1 block break-all rounded bg-muted p-3 text-xs">
              {credentials.clientSecret}
            </code>
          </div>

          <p className="text-sm font-medium text-destructive">
            Save the client secret now. It may not be shown again.
          </p>
        </div>
      )}
    </div>
  );
}