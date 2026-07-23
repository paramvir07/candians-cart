import { Types } from "mongoose";

export interface PlaceOrderProduct {
  productId: Types.ObjectId;
  quantity: number;
  total: number;
  markup: number;
  tax: number;
  disposableFee: number;
  subsidy?: number;
}

export interface PlaceOrderMiscItem {
  miscItemId: Types.ObjectId;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface PlaceOrderI {
  products: PlaceOrderProduct[];
  subsidyItems: PlaceOrderProduct[];
  miscItems: PlaceOrderMiscItem[];
  TotalGST: number;
  TotalPST: number;
  TotalDisposableFee: number;
  BaseTotal: number;
  cartTotal: number;
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  status?: "pending" | "completed";
  subsidy?: number;
  subsidyLeft: number;
  subsidyUsed: number;
  storeProfit?: number;
  platformProfit?: number;
  paymentMode?: "wallet" | "pending";
  cashierId?: Types.ObjectId;
}