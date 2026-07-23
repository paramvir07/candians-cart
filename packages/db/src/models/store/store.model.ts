import { model, Model, models, Schema } from "mongoose";
import {
  ITimeRange,
  IStoreHours,
  IPayoutSchedule,
  IStore,
} from "@canadian-cart/types/store/store";

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
    address: {
      // Physical address of the store
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    members: {
      type: Number,
      default: 0,
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
