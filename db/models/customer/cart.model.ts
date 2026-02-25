import mongoose from "mongoose";
import { model, models, Schema, Types,Document } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  storeId: Types.ObjectId;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface ICart extends Document {
  customerId: Types.ObjectId;
  items: ICartItem[];
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
      min: 1,
      max: 99,
    },
  },
  { _id: false, timestamps: true }
);

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
  },
  { timestamps: true }
);

const CartModel =
  (models.Cart as mongoose.Model<ICart>) ||
  model<ICart>("Cart", cartSchema);

export default CartModel;