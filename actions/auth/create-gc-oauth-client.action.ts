"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

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

  try {
    const client = await auth.api.adminCreateOAuthClient({
      headers: requestHeaders,

      body: {
        client_name: "Gift Cart",

        redirect_uris: [
          "http://localhost:3001/api/auth/oauth2/callback/canadians-cart",
        ],

        token_endpoint_auth_method: "client_secret_basic",

        grant_types: [
          "authorization_code",
          "refresh_token",
        ],

        response_types: ["code"],

        scope: "openid profile email offline_access",

        client_secret_expires_at: 0,

        // CC and GC are both your applications.
        skip_consent: true,

        enable_end_session: true,
      },
    });

    return {
      success: true,
      clientId: client.client_id,
      clientSecret: client.client_secret,
    };
  } catch (error) {
    console.error("Failed to create GC OAuth client:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create OAuth client.",
    };
  }
}