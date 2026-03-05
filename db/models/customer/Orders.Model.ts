import mongoose, { Schema, model, models, Types } from "mongoose";

export interface PlaceOrderProduct {
  productId: Types.ObjectId;
  quantity: number;
  total: number;
  markup: number;
  tax: number;
  disposableFee: number;
  status?: "completed" | "refund requested" | "refunded" | "refund rejected";
  subsidy?: number;
}

export interface PlaceOrderI {
  products: PlaceOrderProduct[];
  TotalGST: number;
  TotalPST:number;
  cartTotal: number;
  userWalletBalance: number;
  giftWalletBalance: number;
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  status?:
    | "pending"
    | "completed"
    | "canceled"
    | "refund requested"
    | "refunded"
    | "refund rejected"
    | "failed";
  subsidy?: number;
  paymentMode?: "wallet" | "cash" | "card" | "pending";
}

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
    subsidy: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["completed", "refund requested", "refunded", "refund rejected"],
      default: "completed",
      required: true,
      index: true,
    },
  },
  { _id: false },
);

const placeOrderSchema = new Schema<PlaceOrderI>(
  {
    products: {
      type: [placeOrderProductSchema],
      required: true,
    },
    TotalGST:{
      type: Number,
      required: true,
      min: 0, 
    },
    TotalPST:{
      type: Number,
      required: true,
      min: 0,
    },
    cartTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    subsidy: {
      type: Number,
      required: true,
      default: 0,
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
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "canceled",
        "refund requested",
        "refunded",
        "refund rejected",
        "failed",
      ],
      default: "completed",
      required: true,
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ["wallet", "cash", "card", "pending"],
      default: "wallet",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const OrderModel =
  (models.Order as mongoose.Model<PlaceOrderI>) ||
  model<PlaceOrderI>("Order", placeOrderSchema);

export default OrderModel;
