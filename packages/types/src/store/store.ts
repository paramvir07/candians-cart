import { Types } from "mongoose";

export interface ITimeRange {
  open: number; // minutes from midnight
  close: number; // minutes from midnight
}

export interface IPayoutSchedule {
  enabled: boolean;
  frequency: PayoutFrequency;
  // For monthly: which day of month to run (1–28, capped at 28 to avoid end-of-month issues)
  dayOfMonth: number;
  // For biweekly: which day of week to run (0 = Sun, 1 = Mon … 6 = Sat)
  dayOfWeek: number;
  // ISO string of when the last auto-payout was generated (null = never run)
  lastPayoutDate: Date | null;
  // ISO string of when the next auto-payout is scheduled (computed & stored for display)
  nextPayoutDate: Date | null;
}

export interface IStore {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  mobile: string;
  description: string;
  members: number;
  timezone: string;
  hours: IStoreHours;
  bankDetails: string;
  payoutSchedule: IPayoutSchedule;
  isActive: boolean;
}

export interface IStoreHours {
  mon: ITimeRange[];
  tue: ITimeRange[];
  wed: ITimeRange[];
  thu: ITimeRange[];
  fri: ITimeRange[];
  sat: ITimeRange[];
  sun: ITimeRange[];
}

export type PayoutFrequency = "biweekly" | "monthly";

export type StoreDetails = {
  name: string;
  members: Number;
  address: string;
  description: string;
};

export type StoreDocument = IStore & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
