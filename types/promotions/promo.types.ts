export type PromoMyStatus = "eligible" | "not_eligible" | null;

export interface PromoStats {
  eligibleCount: number;
  targetCount: number;
  progressPct: number;
  timerDeadline: string;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  isReadyToDraw: boolean;
  startDate: string;
  /**
   * Whether the currently logged-in customer has placed their first order
   * and unlocked their subsidy (i.e. is inside the draw).
   * null = not logged in / unknown.
   */
  myStatus?: PromoMyStatus;
}
