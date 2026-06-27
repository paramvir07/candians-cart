"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { auth } from "@/lib/auth/auth";
import { DrawStats, DrawWinner } from "@/types/draw";
import { headers } from "next/headers";

// ─── Draw config ───────────────────────────────────────────────────────────────
// June 27 2026, 2pm–4pm Pacific Time (UTC-7 in summer)
const DRAW_START = new Date("2026-06-27T21:00:00.000Z"); // 2pm PT = 21:00 UTC
const DRAW_END   = new Date("2026-06-27T23:00:00.000Z"); // 4pm PT = 23:00 UTC

export async function getDrawStats(): Promise<DrawStats> {
  const now = new Date();

  const drawStartsAt = DRAW_START.toISOString();
  const drawEndsAt   = DRAW_END.toISOString();
  const secondsUntilDraw = Math.max(
    0,
    Math.floor((DRAW_START.getTime() - now.getTime()) / 1000),
  );

  try {
    await dbConnect();

    // Check if any winners have been declared
    const winnerDocs = await Customer.find(
      { eventParticipant: "winner" },
      { name: 1 },
    ).lean();

    const hasWinners = winnerDocs.length > 0;

    // Participant count
    const participantCount = await Customer.countDocuments({
      eventParticipant: { $in: ["participant", "winner"] },
    });

    // Winners list — expose first name + last initial only
    const winners: DrawWinner[] = winnerDocs.map((w) => {
      const parts = (w.name as string).trim().split(/\s+/);
      const first = parts[0] ?? "Winner";
      const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : "";
      return { name: lastInitial ? `${first} ${lastInitial}` : first };
    });

    // Determine phase
    let phase: DrawStats["phase"];
    if (hasWinners) {
      phase = "announced";
    } else if (now >= DRAW_START && now <= DRAW_END) {
      phase = "live_draw";
    } else {
      phase = "pre_draw";
    }

    // Check current customer status (best-effort, no redirect)
    let myStatus: DrawStats["myStatus"] = null;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        const customer = await Customer.findOne(
          { userId: session.user.id },
          { eventParticipant: 1 },
        ).lean();

        if (!customer) {
          myStatus = null;
        } else if ((customer as { eventParticipant?: string }).eventParticipant === "winner") {
          myStatus = "winner";
        } else if ((customer as { eventParticipant?: string }).eventParticipant === "participant") {
          myStatus = "participant";
        } else {
          myStatus = "not_joined";
        }
      }
    } catch {
      // Not logged in — that's fine
      myStatus = null;
    }

    return {
      phase,
      drawStartsAt,
      drawEndsAt,
      secondsUntilDraw,
      participantCount,
      winners,
      myStatus,
    };
  } catch (error) {
    console.error("getDrawStats error:", error);
    // Safe fallback
    return {
      phase: "pre_draw",
      drawStartsAt,
      drawEndsAt,
      secondsUntilDraw,
      participantCount: 0,
      winners: [],
      myStatus: null,
    };
  }
}