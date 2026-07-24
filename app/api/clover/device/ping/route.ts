import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  CloverRequestError,
  pingCloverDevice,
} from "@/lib/clover/clover.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin" && role !== "cashier") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await pingCloverDevice();
    return NextResponse.json({ connected: true, result });
  } catch (error) {
    if (error instanceof CloverRequestError) {
      return NextResponse.json(
        {
          connected: false,
          message: error.message,
          cloverStatus: error.status,
          details: error.payload,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : "Ping failed",
      },
      { status: 500 },
    );
  }
}
