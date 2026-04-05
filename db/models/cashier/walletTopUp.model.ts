import { model, Model, models, Schema, Types } from "mongoose";

export interface IWalletTopUp {
  customerId: Types.ObjectId;
  userId: string;
  userRole: "admin" | "cashier";
  value: number; // in  cents
  paymentMode: "cash" | "card" | "gift"
}

const walletTopUpSchema = new Schema<IWalletTopUp>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: String, // cashier or admin
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ["admin", "cashier"],
      required: true
    },
    value: {
      type: Number, // in cents
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "gift"],
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const WalletTopUp: Model<IWalletTopUp> =
  models.WalletTopUp || model <IWalletTopUp>("WalletTopUp", walletTopUpSchema);
