import { model, Model, models, Schema, Types } from "mongoose";

export type CloverTopUpAttemptStatus =
  | "pending"
  | "processing"
  | "crediting"
  | "completed"
  | "failed"
  | "unknown";

export interface ICloverTopUpAttempt {
  customerId: Types.ObjectId;
  initiatedByAuthUserId: string;
  userId: string;
  userRole: "admin" | "cashier";
  amount: number;
  externalPaymentId: string;
  status: CloverTopUpAttemptStatus;
  cloverPaymentId?: string;
  cloverResult?: string;
  cloverCardState?: string;
  cloverCardType?: string;
  cloverCardLast4?: string;
  failureCode?: string;
  failureMessage?: string;
  walletTopUpId?: Types.ObjectId;
  completedAt?: Date;
}

const cloverTopUpAttemptSchema = new Schema<ICloverTopUpAttempt>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    initiatedByAuthUserId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ["admin", "cashier"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    externalPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      maxlength: 32,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "crediting",
        "completed",
        "failed",
        "unknown",
      ],
      default: "pending",
      required: true,
      index: true,
    },
    cloverPaymentId: {
      type: String,
      index: true,
    },
    cloverResult: String,
    cloverCardState: String,
    cloverCardType: String,
    cloverCardLast4: String,
    failureCode: String,
    failureMessage: String,
    walletTopUpId: {
      type: Schema.Types.ObjectId,
      ref: "WalletTopUp",
    },
    completedAt: Date,
  },
  { timestamps: true },
);

export const CloverTopUpAttempt: Model<ICloverTopUpAttempt> =
  models.CloverTopUpAttempt ||
  model<ICloverTopUpAttempt>("CloverTopUpAttempt", cloverTopUpAttemptSchema);
