// ─── Draw Promotion Types ──────────────────────────────────────────────────────

export type DrawPhase =
  | "pre_draw"    // Timer counting down to the draw window (before June 27 2pm PT)
  | "live_draw"   // Inside the draw window (June 27 2pm–4pm PT)
  | "announced";  // At least 1 winner exists in DB — show winners

export interface DrawWinner {
  name: string; // We only expose first name + last initial for privacy
  // e.g. "Sarah M."
}

export interface DrawStats {
  phase: DrawPhase;

  // Timer (only relevant during pre_draw / live_draw)
  drawStartsAt: string;  // ISO — June 27 2pm PT
  drawEndsAt: string;    // ISO — June 27 4pm PT
  secondsUntilDraw: number; // 0 once draw window is open

  // Participant count (always shown)
  participantCount: number;

  // Winners (only populated in "announced" phase)
  winners: DrawWinner[];

  // Current customer's status (null = not logged in or no customer record)
  myStatus: "not_joined" | "participant" | "winner" | null;
}