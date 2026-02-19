import { model, Model, models, Schema, Types } from "mongoose";

export interface ICustomerInfo {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  mobile: string;
  city: string;
  province: string;
  hasCar: boolean;
  carModel?: string;
  carYear?: number;
  referalCode?: string;
  referredBy?: Types.ObjectId;
  associatedStoreId?: Types.ObjectId;
}

const customerInfoSchema = new Schema<ICustomerInfo>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  hasCar: {
    type: Boolean,
    required: true,
  },
  carModel: {
    type: String,
    required: false,
  },
  carYear: {
    type: Number,
    required: false,
  },
  referalCode: {
    type: String,
    required: false,
  },
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  associatedStoreId: {
    type: Schema.Types.ObjectId,
    ref: "storeInfo",
  },
});

const CustomerInfo: Model<ICustomerInfo> =
  models.customerInfo ||
  model<ICustomerInfo>("customerInfo", customerInfoSchema);

export default CustomerInfo;
