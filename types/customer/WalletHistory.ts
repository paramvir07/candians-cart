export type PaymentStatus = "pending" | "paid" | "unpaid";

export interface IStripeTopUp {
  _id: string;
  userId: string;
  stripeEventId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICashierTopUp {
  _id: string;
  customerId: string;
  cashierId: string;
  value: number;
  paymentMode: "cash" | "card";
  createdAt: string;
  updatedAt: string;
}

export interface WalletTopUpHistory {
  stripeTopUps: IStripeTopUp[];
  cashierTopUps: ICashierTopUp[];
}

export type UnifiedTransaction = {
  id: string;
  type: "stripe" | "cashier";
  amount: number;
  currency: string;
  status: PaymentStatus | "completed";
  paymentMode?: "cash" | "card" | "online";
  createdAt: string;
  label: string;
  sublabel: string;
  referenceId: string;
};
