import { model, Model, models, Schema, Types } from "mongoose";

export interface ICashierTopUp {
  customerId: Types.ObjectId;
  cashierId: Types.ObjectId;
  value: number; // in  cents
  paymentMode: "cash" | "card";
}

const cashierTopUpSchema = new Schema<ICashierTopUp>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    value: {
      type: Number, // in cents
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "card"],
      required: true,
    },
  },
  { timestamps: true },
);

export const CashierTopUp: Model<ICashierTopUp> =
  models.CashierTopUp ||
  model<ICashierTopUp>("CashierTopUp", cashierTopUpSchema);
