import mongoose, { Schema, model, models, Types } from "mongoose";

export interface PlaceOrderProduct {
  productId: Types.ObjectId;
  quantity: number;
  total: number;
  markup: number;
  tax: number;
  disposableFee: number;
  subsidy?: number;
}

export interface PlaceOrderI {
  products: PlaceOrderProduct[];
  subsidyItems:PlaceOrderProduct[];
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
  subsidyLeft:number;
  subsidyUsed:number;
  paymentMode?: "wallet" | "pending";
  cashierId?: Types.ObjectId;
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
      min: 0.01,
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
  },
  { _id: false },
);

const placeOrderSchema = new Schema<PlaceOrderI>(
  {
    products: {
      type: [placeOrderProductSchema],
      required: true,
    },
    subsidyItems:{
      type:[placeOrderProductSchema],
      required: true,
      default:[]
    },
    TotalGST: {
      type: Number,
      required: true,
      min: 0,
    },
    TotalPST: {
      type: Number,
      required: true,
      min: 0,
    },
    TotalDisposableFee: {
      type: Number,
      required: true,
      min: 0,
    },
    BaseTotal: {
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
    subsidyLeft:{
      type: Number,
      min: 0,
    },
    subsidyUsed:{
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      required: true,
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ["wallet", "pending"],
      required: true,
      index: true,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: "Cashier",
    },
  },
  { timestamps: true },
);

const OrderModel =
  (models.Order as mongoose.Model<PlaceOrderI>) ||
  model<PlaceOrderI>("Order", placeOrderSchema);

export default OrderModel;
