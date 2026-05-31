import { Schema, model, models, Model, Types } from "mongoose";

export interface IMiscellaneousItems {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  productId?: Types.ObjectId;
  productName: string;
  primaryUPC?: string;
  price: number;
  isAdded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const miscellaneousItemsSchema = new Schema<IMiscellaneousItems>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    primaryUPC: {
      type: String,
      required: false,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isAdded: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

export const MiscellaneousItemsModel: Model<IMiscellaneousItems> =
  models.MiscellaneousItems ||
  model<IMiscellaneousItems>("MiscellaneousItems", miscellaneousItemsSchema);