import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { dbConnect } from "@/db/dbConnect";
import { CloverConnection } from "@/db/models/clover/cloverConnection.model";
import { getCloverConfig } from "@/lib/clover/clover.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const config = getCloverConfig();
  await dbConnect();
  const connection = await CloverConnection.findOne({
    environment: config.environment,
  }).lean();

  return NextResponse.json({
    environment: config.environment,
    connected: Boolean(connection),
    merchantId: connection?.merchantId ?? null,
    accessTokenExpiration: connection?.accessTokenExpiration ?? null,
    refreshTokenExpiration: connection?.refreshTokenExpiration ?? null,
    connectedAt: connection?.connectedAt ?? null,
  });
}
