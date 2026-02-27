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
  },
  { timestamps: true },
);

const Store: Model<IStore> =
  models.Store || model<IStore>("Store", storeSchema);

export default Store;
