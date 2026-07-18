import {
  PlaceOrderProduct,
  PlaceOrderI,
} from "@canadian-cart/db/models/customer/Orders.Model";
import { IWalletPayment } from "@canadian-cart/db/models/customer/WalletPayment.model";

export type SerializedProduct = Omit<PlaceOrderProduct, "productId"> & {
  productId: {
    _id: string;
    name: string;
    category: string;
    images?: { url: string }[];
  };
};

export type SerializedOrder = Omit<
  PlaceOrderI,
  "products" | "subsidyItems" | "userId" | "storeId" | "cashierId"
> & {
  _id: string;
  products: SerializedProduct[];
  subsidyItems: SerializedProduct[];
  userId: string;
  storeId: string;
  cashierId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializedWalletPayment = Omit<IWalletPayment, "userId"> & {
  _id: string;
  userId: string;
  createdAt: string;
};

export type WalletTopUpEntry = {
  _id: string;
  customerId: string;
  value: number;
  createdAt: string;
};
