import { Model, Schema, model, models } from "mongoose";
import { IWalletPayment } from "@canadian-cart/types/customer/walletPayment";

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
