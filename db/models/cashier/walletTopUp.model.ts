import { model, Model, models, Schema, Types } from "mongoose";

export interface IWalletTopUp {
  customerId: Types.ObjectId;
  userId: string;
  userRole: "admin" | "cashier";
  value: number; // cents
  cashPaid: number;
  cashDue: number;
  paymentMode: "cash" | "card" | "gift" | "referral";
  paymentStatus: "completed" | "pending" | "failed";
  cloverPaymentId?: string;
  cloverExternalPaymentId?: string;
  cloverCardType?: string;
  cloverCardLast4?: string;
  cloverReferenceId?: string;
  cloverTransactionNo?: string;
}

const walletTopUpSchema = new Schema<IWalletTopUp>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
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
    value: {
      type: Number,
      required: true,
      min: 1,
    },
    cashPaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cashDue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "gift", "referral"],
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["completed", "pending", "failed"],
      required: true,
      default: "completed",
      index: true,
    },
    cloverPaymentId: String,
    cloverExternalPaymentId: String,
    cloverCardType: String,
    cloverCardLast4: String,
    cloverReferenceId: String,
    cloverTransactionNo: String,
  },
  { timestamps: true },
);

walletTopUpSchema.index(
  { cloverExternalPaymentId: 1 },
  { unique: true, sparse: true },
);
walletTopUpSchema.index({ cloverPaymentId: 1 }, { unique: true, sparse: true });

export const WalletTopUp: Model<IWalletTopUp> =
  models.WalletTopUp || model<IWalletTopUp>("WalletTopUp", walletTopUpSchema);
