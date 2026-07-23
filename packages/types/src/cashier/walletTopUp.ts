import { Types } from "mongoose";

export interface IWalletTopUp {
  customerId: Types.ObjectId;
  userId: string;
  userRole: "admin" | "cashier";
  value: number; // in  cents
  cashPaid:number;
  cashDue:number;
  paymentMode: "cash" | "card" | "gift" | "referral"
}

export type WalletTopUp = IWalletTopUp & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
