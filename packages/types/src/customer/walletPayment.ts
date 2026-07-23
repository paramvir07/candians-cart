import { Types } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "unpaid";

export interface IWalletPayment {
  userId: Types.ObjectId;
  stripeEventId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
  amount: number; // Total amount charged to the customer (including fees)
  topUpAmount: number; // Actual amount that went in the wallet after fees
  stripeFee: number; // Stripe fee amount (totalCharge - topUpAmount)
  currency: string;
  status: PaymentStatus;
}
