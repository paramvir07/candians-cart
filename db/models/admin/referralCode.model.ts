import { model, Model, models, Schema } from "mongoose";

export interface IReferralCode {
  code: string;
  maxUses?: number | null; // null = unlimited
  expiresAt?: Date | null; // null = never expires
  isActive: boolean;
  uses: number; // track usage count
  createdAt: Date;
  updatedAt: Date;
}

const referralCodeSchema = new Schema<IReferralCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    // null/undefined means unlimited
    maxUses: {
      type: Number,
      default: null,
      min: 1,
    },
    // null/undefined means never expires
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    uses: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);


const ReferralCode: Model<IReferralCode> =
  models.ReferralCode ||
  model<IReferralCode>("ReferralCode", referralCodeSchema);

export default ReferralCode;
