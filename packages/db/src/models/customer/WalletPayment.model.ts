import { Model, Schema, Types, model, models } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "unpaid";

export interface IWalletPayment {
  userId: Types.ObjectId;
  stripeEventId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
  amount: number; // Total amount charged to the customer (including fees)
  topUpAmount: number; // Actual amount that went in the wallet after fees
  stripeFee: number; // Stripe fee amount (totalCharge - topUpAmount)
  currency: string;
  status: PaymentStatus;
}

const WalletPaymentSchema = new Schema<IWalletPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
    },
    checkoutSessionId: { type: String, required: true },
    paymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    topUpAmount: { type: Number, required: true },
    stripeFee: { type: Number, required: true },
    currency: { type: String, default: "cad" },
    status: {
      type: String,
      enum: ["pending", "paid", "unpaid"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true },
);
const WalletPayment: Model<IWalletPayment> =
  models.WalletPayment ||
  model<IWalletPayment>("WalletPayment", WalletPaymentSchema);

export default WalletPayment;
