import { model, Model, models, Schema, Types } from "mongoose";

export interface IReferralHistory {
  customerId: Types.ObjectId;
  value: number; 
}

const ReferralHistorySchema = new Schema<IReferralHistory>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },

  },
  { timestamps: true },
);

export const ReferralHistory: Model<IReferralHistory> =
  models.ReferralHistory || model<IReferralHistory>("ReferralHistory", ReferralHistorySchema);
