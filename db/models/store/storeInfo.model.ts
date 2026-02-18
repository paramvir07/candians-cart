import { model, Model, models, Schema, Types } from "mongoose";

export interface IStoreInfo {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  mobile: string;
}

const storeInfoSchema = new Schema<IStoreInfo>({
  // _id here is the actual storeId
  userId: {  //This is the Auth
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {   // Name of the store
    type: String,
    required: true,
  },
  email: {  // Contact email for the store
    type: String,
    required: true,
  },
  address: { // Physical address of the store
    type: String,
    required: true,
  },
  mobile: { // Contact mobile number for the store
    type: String,
    required: true,
  },
});

const StoreInfo: Model<IStoreInfo> =
  models.storeInfo || model<IStoreInfo>("storeInfo", storeInfoSchema);

export default StoreInfo;