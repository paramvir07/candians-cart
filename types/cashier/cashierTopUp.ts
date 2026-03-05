import { ICashierTopUp } from "@/db/models/cashier/cashierTopUp.model";

export type CashierTopUp = ICashierTopUp & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};