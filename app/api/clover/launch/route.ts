import { NextResponse } from "next/server";
import { getCloverConfig } from "@/lib/clover/clover.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = getCloverConfig();
  const sourceUrl = new URL(request.url);
  const connectUrl = new URL("/api/clover/connect", config.appUrl);

  const merchantId =
    sourceUrl.searchParams.get("merchant_id") ??
    sourceUrl.searchParams.get("merchantId");

  if (merchantId) connectUrl.searchParams.set("merchant_id", merchantId);
  return NextResponse.redirect(connectUrl);
}
