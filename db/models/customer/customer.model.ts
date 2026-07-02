import { HEARD_ABOUT_US_VALUES } from "@/lib/customer/heardAboutUs";
import { model, Model, models, Schema, Types } from "mongoose";

export type EventParticipantStatus = "participant" | "winner";
``
export interface ICustomer {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  mobile?: string;
  city: string;
  province: string;
  postalCode: string;
  monthlyBudget: number;
  associatedStoreId: Types.ObjectId;
  referralCodeId: Types.ObjectId;
  referralCodeEnabled: boolean;
  myreferralCodeId?: Types.ObjectId;
  perReferAmount: 5 | 2;
  recieveReferralInvites: boolean;
  placedFirstOrder: boolean;
  subsidy: number;
  walletBalance: number;
  giftWalletBalance: number;
  heardAboutUs: string;
  eventParticipant?: EventParticipantStatus;
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
      unique: true,
      sparse: true,
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
    postalCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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
    perReferAmount: {
      type: Number,
      enum: [5, 2],
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
    recieveReferralInvites: {
      type: Boolean,
      default: false,
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
    heardAboutUs: {
      type: String,
      required: true,
      enum: HEARD_ABOUT_US_VALUES,
    },
    eventParticipant: {
      type: String,
      enum: ["participant", "winner"],
      // No default — undefined means they haven't joined the draw yet
    },
  },
  { timestamps: true },
);

const Customer: Model<ICustomer> =
  models.Customer || model<ICustomer>("Customer", customerSchema);

export default Customer;
