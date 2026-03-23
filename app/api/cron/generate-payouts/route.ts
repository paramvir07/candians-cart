import { NextResponse } from "next/server";
import { runAutoPayouts } from "@/actions/admin/payoutSchedule/runAutoPayouts.action";

/**
 * GET /api/cron/generate-payouts
 *
 * Called by Vercel Cron once per day (see vercel.json).
 * Protected by a shared secret in the Authorization header.
 *
 * Vercel automatically sends:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * You must set CRON_SECRET in your Vercel environment variables.
 * Use a long random string — e.g. `openssl rand -hex 32`
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes — payouts may take a while across many stores

export async function GET(req: Request) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET environment variable is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron] Unauthorized request to cron endpoint");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ────────────────────────────────────────────────────────────────────────────

  console.log("[Cron] Starting auto-payout job at", new Date().toISOString());

  try {
    const result = await runAutoPayouts();

    console.log("[Cron] Auto-payout job completed:", {
      processedAt: result.processedAt,
      totalStores: result.totalStores,
      successful: result.successful,
      skipped: result.skipped,
      errors: result.errors,
    });

    // Log individual errors for debugging (Vercel logs capture this)
    const errorResults = result.results.filter((r) => r.status === "error");
    if (errorResults.length > 0) {
      console.error("[Cron] Stores with errors:", errorResults);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[Cron] Fatal error in auto-payout job:", error);
    return NextResponse.json(
      {
        error: "Auto-payout job failed",
        message: error?.message ?? "Unknown error",
        processedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
