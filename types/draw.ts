// ─── Draw Promotion Types ──────────────────────────────────────────────────────

export type DrawPhase =
  | "pre_event"   // Before June 27 2pm PT — countdown, entry open
  | "live_event"  // June 27 2pm–4pm PT — event is live, entry still open
  | "announced";  // Winners set in DB by admin — show winners list

export interface DrawWinner {
  name: string; // First name + last initial only e.g. "Sarah M."
}

export interface DrawStats {
  phase: DrawPhase;

  // Countdown to event start (pre_event only, 0 once live)
  eventStartsAt: string; // ISO — June 27 2pm PT
  secondsUntilEvent: number;

  // Participant count (always shown)
  participantCount: number;

  // Winners (only populated in "announced" phase)
  winners: DrawWinner[];

  // Current customer's draw status (null = not logged in / no customer record)
  myStatus: "not_joined" | "participant" | "winner" | null;
}