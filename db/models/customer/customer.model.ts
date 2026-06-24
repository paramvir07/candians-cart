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
  referralCodeId: Types.ObjectId;
  referralCodeEnabled: boolean;
  myreferralCodeId?: Types.ObjectId;
  placedFirstOrder: boolean;
  subsidy: number;
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
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
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
    referralCodeId: {
      type: Schema.Types.ObjectId,
      ref: "ReferralCode",
      required: true,
    },
    referralCodeEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    myreferralCodeId: {
      type: Schema.Types.ObjectId,
      ref: "ReferralCode",
    },
    placedFirstOrder: {
      type: Boolean,
      required: true,
      default: false,
    },
    subsidy: {
      type: Number,
      required: true,
      default: 55,
      max: 55,
      min: 50,
    },
    walletBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    giftWalletBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Gift Wallet balance cannot be negative"],
    },
  },
  { timestamps: true },
);

const Customer: Model<ICustomer> =
  models.Customer || model<ICustomer>("Customer", customerSchema);

export default Customer;
