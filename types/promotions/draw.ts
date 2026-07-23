export type DrawPhase = "pre_event" | "live_event" | "announced";

export type DrawMyStatus = "not_joined" | "participant" | "winner" | null;

export interface DrawWinner {
  name: string;
  /** true if this winner has spent any of their $50 gift card balance */
  hasRedeemed?: boolean;
}

export interface DrawStats {
  phase: DrawPhase;
  eventStartsAt: string;
  secondsUntilEvent: number;
  participantCount: number;
  winners: DrawWinner[];
  myStatus: DrawMyStatus;
  /**
   * Only meaningful when myStatus === "winner".
   * true  = winner has already redeemed / spent some of the $50 card
   * false = walletBalance is still exactly $50 — card is untouched, can redeem anytime
   * null  = not applicable / unknown (not a winner, or lookup failed)
   */
  myHasRedeemed?: boolean | null;
}
