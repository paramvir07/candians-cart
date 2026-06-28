import { model, Model, models, Schema, Types } from "mongoose";

export interface IReferralRequest {
  name: string;
  email: string;
  phoneNumber: string;
  accepted: boolean | null;
  customerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const referralRequestSchema = new Schema<IReferralRequest>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
        validator: function (v: string) {
        return /^\+?[1-9]\d{7,14}$/.test(v);
        },
        message: "Invalid phone number format",
    },
    },
    accepted: {
      type: Boolean,
      required:false,
      default: null,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReferralRequest: Model<IReferralRequest> =
  models.ReferralRequest ||
  model<IReferralRequest>("ReferralRequest", referralRequestSchema);

export default ReferralRequest;