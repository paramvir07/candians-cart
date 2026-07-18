"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

function removeTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function createGCOAuthClient() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  if (session.user.role !== "admin") {
    return {
      success: false,
      message: "Only an admin can create the OAuth client.",
    };
  }

  const gcAppUrl = process.env.GC_APP_URL;

  if (!gcAppUrl) {
    return {
      success: false,
      message: "GC_APP_URL is missing.",
    };
  }

  const normalizedGCAppUrl =
    removeTrailingSlash(gcAppUrl);

  const callbackUrl =
    `${normalizedGCAppUrl}/api/auth/oauth2/callback/canadians-cart`;

  try {
    const client =
      await auth.api.adminCreateOAuthClient({
        headers: requestHeaders,

        body: {
          client_name: "Gift Cart",

          redirect_uris: [
            callbackUrl,
          ],

          token_endpoint_auth_method:
            "client_secret_basic",

          grant_types: [
            "authorization_code",
            "refresh_token",
          ],

          response_types: ["code"],

          scope:
            "openid profile email offline_access",

          client_secret_expires_at: 0,

          skip_consent: true,

          enable_end_session: true,
        },
      });

    return {
      success: true,
      clientId: client.client_id,
      clientSecret: client.client_secret,
      redirectUri: callbackUrl,
    };
  } catch (error) {
    console.error(
      "Failed to create Gift Cart OAuth client:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create OAuth client.",
    };
  }
}