import mongoose, { Schema, model, models, Types } from "mongoose";

export interface PlaceOrderProduct {
  productId: Types.ObjectId;
  quantity: number;
  total: number;
  markup: number;
  tax: number;
  disposableFee: number;
}

export interface PlaceOrderI {
  products: PlaceOrderProduct[];
  cartTotal: number;
  userWalletBalance: number;
  giftWalletBalance: number;
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}


// interface PlaceOrderProduct {
//   productId: string
//   quantity: number
//   total: number
//   markup: number
//   tax: number
//   disposableFee:number
// }

// interface PlaceOrderI {
//   products: PlaceOrderProduct[]
//   cartTotal: number
//   userWalletBalance: number
//   giftWalletBalance: number
//   userId: string
//   storeId: string
// }
const placeOrderProductSchema = new Schema<PlaceOrderProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    markup: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    disposableFee: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const placeOrderSchema = new Schema<PlaceOrderI>(
  {
    products: {
      type: [placeOrderProductSchema],
      required: true,
    },
    cartTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    userWalletBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    giftWalletBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

const OrderModel =
  (models.Order as mongoose.Model<PlaceOrderI>) ||
  model<PlaceOrderI>("Order", placeOrderSchema);

export default OrderModel;