import { Types } from "mongoose";

export type EventParticipantStatus = "participant" | "winner";

export interface ICustomer {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  aptUnit?: string;
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

export type Customer = ICustomer & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  emailVerified?: boolean;
  referralCode?: string;
  storeName?: string;
};

export type SerializedCustomer = Omit<
  Customer,
  | "_id"
  | "userId"
  | "associatedStoreId"
  | "referralCodeId"
  | "myreferralCodeId"
  | "createdAt"
  | "updatedAt"
  | "lastOrderDate"
  | "__v"
> & {
  _id: string;
  userId: string;
  associatedStoreId: string;
  referralCodeId: string;
  myreferralCodeId?: string;
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  referralCode?: string;
  storeName?: string;
};