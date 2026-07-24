import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getCloverConfig } from "@/lib/clover/clover.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session) {
    return NextResponse.json({ message: "Please sign in first" }, { status: 401 });
  }

  if (role !== "admin") {
    return NextResponse.json(
      { message: "Only an admin can connect the Clover merchant account" },
      { status: 403 },
    );
  }

  const config = getCloverConfig();
  const state = randomBytes(24).toString("base64url");
  const authorizeUrl = new URL("/oauth/v2/authorize", config.authorizeBaseUrl);
  authorizeUrl.searchParams.set("client_id", config.appId);
  authorizeUrl.searchParams.set("redirect_uri", config.callbackUrl);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("clover_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
