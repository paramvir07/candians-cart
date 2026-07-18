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
}
