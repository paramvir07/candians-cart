import { ICustomer } from "@/db/models/customer/customer.model";
import { Types } from "mongoose";

export type Customer = ICustomer & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export type SerializedCustomer = Omit<
  Customer,
  "_id" | "userId" | "associatedStoreId" | "createdAt" | "updatedAt" | "__v"
> & {
  _id: string;
  userId: string;
  associatedStoreId: string;
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  storeName?: string;
};
