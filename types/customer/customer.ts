import { ICustomer } from "@/db/models/customer/customer.model";
import { Types } from "mongoose";

export type Customer = ICustomer & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
