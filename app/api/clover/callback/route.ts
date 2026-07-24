import { NextResponse } from "next/server";
import { dbConnect } from "@/db/dbConnect";
import { CloverConnection } from "@/db/models/clover/cloverConnection.model";
import { getCloverConfig } from "@/lib/clover/clover.config";
import { encryptCloverSecret } from "@/lib/clover/token-crypto";

interface CloverTokenResponse {
  access_token: string;
  access_token_expiration: number;
  refresh_token: string;
  refresh_token_expiration: number;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = getCloverConfig();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const merchantId =
    url.searchParams.get("merchant_id") ?? url.searchParams.get("merchantId");
  const returnedState = url.searchParams.get("state");

  const stateCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("clover_oauth_state="))
    ?.split("=")[1];

  if (!code || !merchantId) {
    return NextResponse.json(
      { message: "Clover callback is missing code or merchant_id" },
      { status: 400 },
    );
  }

  if (!returnedState || !stateCookie || returnedState !== stateCookie) {
    return NextResponse.json(
      { message: "Invalid Clover OAuth state" },
      { status: 400 },
    );
  }

  const tokenResponse = await fetch(`${config.apiBaseUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.appId,
      client_secret: config.appSecret,
      code,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    return NextResponse.json(
      {
        message: "Clover token exchange failed",
        status: tokenResponse.status,
        details: body,
      },
      { status: 502 },
    );
  }

  const tokens = (await tokenResponse.json()) as CloverTokenResponse;
  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.json(
      { message: "Clover did not return both access and refresh tokens" },
      { status: 502 },
    );
  }

  await dbConnect();
  await CloverConnection.findOneAndUpdate(
    { environment: config.environment },
    {
      $set: {
        merchantId,
        accessTokenEncrypted: encryptCloverSecret(tokens.access_token),
        refreshTokenEncrypted: encryptCloverSecret(tokens.refresh_token),
        accessTokenExpiration: tokens.access_token_expiration,
        refreshTokenExpiration: tokens.refresh_token_expiration,
        connectedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const redirectUrl = new URL("/", config.appUrl);
  redirectUrl.searchParams.set("clover", "connected");
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete("clover_oauth_state");
  return response;
}
