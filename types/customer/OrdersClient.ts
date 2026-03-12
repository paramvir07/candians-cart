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
  }[];
  cartTotal: number;
  userId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}


export enum PaymentMode {
  CASH = "cash",
  CARD = "card",
  WALLET = "wallet",
}

