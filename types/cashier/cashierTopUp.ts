import { ICashierTopUp } from "@/db/models/cashier/walletTopUp.model";

export type CashierTopUp = ICashierTopUp & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
