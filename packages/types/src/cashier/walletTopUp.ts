import { IWalletTopUp } from "@canadian-cart/db/models/cashier/walletTopUp.model";

export type WalletTopUp = IWalletTopUp & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
