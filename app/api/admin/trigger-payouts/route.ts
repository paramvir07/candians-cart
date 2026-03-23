import { NextResponse } from "next/server";
import { runAutoPayouts } from "@/actions/admin/payoutSchedule/runAutoPayouts.action";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * POST /api/admin/trigger-payouts
 *
 * Manual trigger for testing the auto-payout logic.
 * Requires an active admin session (cookie-based auth).
 * Only available in development OR when explicitly enabled.
 *
 * Usage:
 *   fetch('/api/admin/trigger-payouts', { method: 'POST' })
 *
 * You can also call this from the admin UI as a "Run Now" button.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  // Require an active admin session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(
    `[ManualTrigger] Admin ${session.user.email} triggered auto-payout job`,
  );

  try {
    const result = await runAutoPayouts();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[ManualTrigger] Error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}