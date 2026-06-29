"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { DrawStats, DrawWinner } from "@/types/promotions/draw";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// ─── Event config ──────────────────────────────────────────────────────────────
// June 27 2026, 2pm Pacific Time (UTC-7 in summer) = 21:00 UTC
// The event runs 2pm–4pm PT but entry stays open throughout.
// Winners are announced whenever admin sets eventParticipant: "winner" in MongoDB.
const EVENT_START = new Date("2026-06-27T21:00:00.000Z"); // 2pm PT
const EVENT_END = new Date("2026-06-27T23:00:00.000Z"); // 4pm PT — event window ends

export async function getDrawStats(): Promise<DrawStats> {
  const now = new Date();

  const eventStartsAt = EVENT_START.toISOString();
  const secondsUntilEvent = Math.max(
    0,
    Math.floor((EVENT_START.getTime() - now.getTime()) / 1000),
  );

  try {
    await dbConnect();

    // Check if any winners have been declared by admin
    const winnerDocs = await Customer.find(
      { eventParticipant: "winner" },
      { name: 1 },
    ).lean();

    const hasWinners = winnerDocs.length > 0;

    // Participant count
    const participantCount = await Customer.countDocuments({
      eventParticipant: { $in: ["participant", "winner"] },
    });

    // Winners list — first name + last initial only for privacy
    const winners: DrawWinner[] = winnerDocs.map((w) => {
      const parts = (w.name as string).trim().split(/\s+/);
      const first = parts[0] ?? "Winner";
      const lastInitial =
        parts.length > 1 ? `${parts[parts.length - 1][0]}.` : "";
      return { name: lastInitial ? `${first} ${lastInitial}` : first };
    });

    // Phase logic:
    // - "announced" = admin has set winners in DB (can happen anytime)
    // - "live_event" = we're inside the 2pm–4pm event window, no winners yet
    // - "pre_event"  = before the event starts
    let phase: DrawStats["phase"];
    if (hasWinners) {
      phase = "announced";
    } else if (now >= EVENT_START && now <= EVENT_END) {
      phase = "live_event";
    } else {
      phase = "pre_event";
    }

    // Current customer status — best-effort, no redirect on failure
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
        } else if (
          (customer as { eventParticipant?: string }).eventParticipant ===
          "winner"
        ) {
          myStatus = "winner";
        } else if (
          (customer as { eventParticipant?: string }).eventParticipant ===
          "participant"
        ) {
          myStatus = "participant";
        } else {
          myStatus = "not_joined";
        }
      }
    } catch {
      myStatus = null;
    }

    return {
      phase,
      eventStartsAt,
      secondsUntilEvent,
      participantCount,
      winners,
      myStatus,
    };
  } catch (error) {
    console.error("getDrawStats error:", error);
    return {
      phase: "pre_event",
      eventStartsAt,
      secondsUntilEvent,
      participantCount: 0,
      winners: [],
      myStatus: null,
    };
  }
}
