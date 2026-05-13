import { model, Model, models, Schema, Types } from "mongoose";

export interface ITimeRange {
  open: number; // minutes from midnight
  close: number; // minutes from midnight
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
  members: Types.ObjectId[];
  timezone: string;
  hours: IStoreHours;
  bankDetails: string;
  payoutSchedule: IPayoutSchedule;
  isActive: boolean;
}

const timeRangeSchema = new Schema<ITimeRange>(
  {
    open: { type: Number, required: true, min: 0, max: 1439 },
    close: { type: Number, required: true, min: 1, max: 1440 },
  },
  { _id: false },
);

const hoursSchema = new Schema<IStoreHours>(
  {
    mon: { type: [timeRangeSchema], default: [] },
    tue: { type: [timeRangeSchema], default: [] },
    wed: { type: [timeRangeSchema], default: [] },
    thu: { type: [timeRangeSchema], default: [] },
    fri: { type: [timeRangeSchema], default: [] },
    sat: { type: [timeRangeSchema], default: [] },
    sun: { type: [timeRangeSchema], default: [] },
  },
  { _id: false },
);

const payoutScheduleSchema = new Schema<IPayoutSchedule>(
  {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["biweekly", "monthly"],
      default: "monthly",
    },
    // day 1–28 for monthly (safe across all months)
    dayOfMonth: { type: Number, default: 1, min: 1, max: 28 },
    // 0–6 for biweekly (Sunday = 0)
    dayOfWeek: { type: Number, default: 1, min: 0, max: 6 },
    lastPayoutDate: { type: Date, default: null },
    nextPayoutDate: { type: Date, default: null },
  },
  {
    _id: false,
  },
);

const storeSchema = new Schema<IStore>(
  {
    // _id here is the actual storeId
    userId: {
      //This is the Auth
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      // Name of the store
      type: String,
      required: true,
    },
    email: {
      // Contact email for the store
      type: String,
      required: true,
    },
    address: {
      // Physical address of the store
      type: String,
      required: true,
    },
    mobile: {
      // Contact mobile number for the store
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "Customer",
      default: [],
    },
    timezone: {
      type: String,
      default: "America/Vancouver",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hours: {
      type: hoursSchema,
      default: () => ({
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
      }),
    },
    bankDetails: {
      type: String,
    },
    payoutSchedule: {
      type: payoutScheduleSchema,
      default: () => ({
        enabled: false,
        frequency: "monthly",
        dayOfMonth: 1,
        dayOfWeek: 1,
        lastPayoutDate: null,
        nextPayoutDate: null,
      }),
    },
  },
  { timestamps: true },
);

const Store: Model<IStore> =
  models.Store || model<IStore>("Store", storeSchema);

export default Store;
