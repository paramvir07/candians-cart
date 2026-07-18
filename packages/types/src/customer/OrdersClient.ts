export interface OrderWithProductsClient {
  _id: string;
  products: {
    productId: {
      images: [
        {
          url: string;
        },
      ];
      _id: string;
      name: string;
      price: number;
      markup: number;
      tax: number;
      disposableFee: number;
    };
    quantity: number;
    total: number;
    markup: number;
    tax: number;
    disposableFee: number;
    subsidy?: number;
  }[];
  subsidyItems?: {
    productId: {
      images: { url: string }[];
      _id: string;
      name: string;
      price: number;
      markup: number;
      tax: number;
      disposableFee: number;
    };
    quantity: number;
    total: number;
    markup: number;
    tax: number;
    disposableFee: number;
    subsidy?: number;
  }[];
  miscItems?: {
    miscItemId: string;
    productName: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  TotalGST?: number;
  TotalPST?: number;
  TotalDisposableFee?: number;
  BaseTotal?: number;
  cartTotal: number;
  subsidy?: number;
  subsidyLeft?: number;
  subsidyUsed?: number;
  userId: string;
  storeId: string;
  status: "pending" | "completed";          
  paymentMode: "wallet" | "pending" | "cash" | "card";
  cashierId?: string;
  createdAt: string;
  updatedAt: string;
}


export enum PaymentMode {
  CASH = "cash",
  CARD = "card",
  WALLET = "wallet",
  PENDING = "pending"
}