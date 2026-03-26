import { model, Model, models, Schema, Types } from "mongoose";

export interface ICustomer {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  mobile: string;
  city: string;
  province: string;
  monthlyBudget: number;
  associatedStoreId: Types.ObjectId;
  referralCode: string;
  walletBalance: number;
  giftWalletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const customerSchema = new Schema<ICustomer>(
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
    address: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    monthlyBudget: {
      type: Number,
      required: true,
    },
    associatedStoreId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    walletBalance: {
      // Stored in cents
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    giftWalletBalance: {
      // Stored in cents
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const Customer: Model<ICustomer> =
  models.Customer || model<ICustomer>("Customer", customerSchema);

export default Customer;
