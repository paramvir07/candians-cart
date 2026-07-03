import { ICustomer } from "@/db/models/customer/customer.model";
import { Types } from "mongoose";

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