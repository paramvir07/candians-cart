import { ICustomer } from "@/db/models/customer/customer.model";
import { Types } from "mongoose";

export type Customer = ICustomer & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;

  // added by populate / aggregation, not stored directly on Customer
  referralCode?: string;
  storeName?: string;
};

export type SerializedCustomer = Omit<
  Customer,
  | "_id"
  | "userId"
  | "associatedStoreId"
  | "referralCodeId"
  | "createdAt"
  | "updatedAt"
  | "__v"
> & {
  _id: string;
  userId: string;
  associatedStoreId: string;
  referralCodeId: string;
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  storeName?: string;
  referralCode?: string;
};
