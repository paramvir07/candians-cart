import { IWalletTopUp } from "@/db/models/cashier/walletTopUp.model";

export type WalletTopUp = IWalletTopUp & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
