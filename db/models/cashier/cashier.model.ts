import { model, Model, models, Schema, Types } from "mongoose";

export interface ICashier {
  userId: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  address: string;
  storeId: Types.ObjectId;
}

const cashierSchema = new Schema<ICashier>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    storeId: {
      type: Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true },
);

export const Cashier: Model<ICashier> =
  models.Cashier || model<ICashier>("Cashier", cashierSchema);
