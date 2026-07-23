import { model, Model, models, Schema, Types } from "mongoose";
import { IReferralCode } from "@canadian-cart/types/admin/referralCode";

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
      min: 1,
    },
    // null/undefined means never expires
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    uses: {
      type: Number,
      min: 0,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    type: {
      type: String,
      enum: ["admin", "customer"],
      required: true
    }
  },
  { timestamps: true },
);


const ReferralCode: Model<IReferralCode> =
  models.ReferralCode ||
  model<IReferralCode>("ReferralCode", referralCodeSchema);

export default ReferralCode;