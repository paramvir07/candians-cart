import { model, Model, models, Schema, Types } from "mongoose";

export interface IWalletTopUp {
  customerId: Types.ObjectId;
  userId: string;
  userRole: "admin" | "cashier";
  value: number; // in  cents
  cashPaid:number;
  cashDue:number;
  paymentMode: "cash" | "card" | "gift" | "referral"
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
    cashPaid: {
      type: Number,
      required: true,
      default:0,
      min:0
    },
    cashDue:{
      type: Number,
      required: true,
      default:0,
      min:0
    },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "gift","referral"],
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const WalletTopUp: Model<IWalletTopUp> =
  models.WalletTopUp || model <IWalletTopUp>("WalletTopUp", walletTopUpSchema);
