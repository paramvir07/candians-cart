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
  monthlyBudget: number;
  associatedStoreId: Types.ObjectId;
  referralCode: string;
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
  monthlyBudget: {
    type: Number,
    required: true,
  },
  associatedStoreId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
});

const CustomerInfo: Model<ICustomerInfo> =
  models.customerInfo ||
  model<ICustomerInfo>("customerInfo", customerInfoSchema);

export default CustomerInfo;
