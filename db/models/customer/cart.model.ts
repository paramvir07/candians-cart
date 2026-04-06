import { IProduct } from "@/types/store/products.types";
import mongoose from "mongoose";
import { model, models, Schema, Types,Document } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  storeId: Types.ObjectId;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface ISubsidyItems{
  productId: IProduct;
  storeId: Types.ObjectId;
  quantity: number;
  TotalPrice: number;
  subsidy: number;
  afterSubsidy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICart extends Document {
  customerId: Types.ObjectId;
  items: ICartItem[];
  subsidyItems:ISubsidyItems[];
  isSavedtoWallet: boolean;
  cartSubsidy: number;
  createdAt: Date;
  updatedAt: Date;
}


const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "store",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
      max: 99,
    },
  },
  { _id: false, timestamps: true }
);

const SubsidyItemsSchema = new Schema<ISubsidyItems>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "store",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
     TotalPrice: {
      type: Number,
      required: true,
      min: 0,
     },
    subsidy: {
      type: Number,
      required: true,
      min: 0,
    },
    afterSubsidy: {
      type: Number,
      required: true,
      min: 0,
    },
  }
)

const cartSchema = new Schema<ICart>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    subsidyItems:{
      type:[SubsidyItemsSchema],
      default:[]
    },
    isSavedtoWallet:{
      type:Boolean,
      required:true,
      default:false
    },
    cartSubsidy:{
      type:Number,
      required:true,
      default:0
    }
  },
  { timestamps: true }
);

const CartModel =
  (models.Cart as mongoose.Model<ICart>) ||
  model<ICart>("Cart", cartSchema);

export default CartModel;