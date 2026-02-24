import { model, Model, models, Schema, Types } from "mongoose";

export interface IStore {
  userId: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  mobile: string;
  description: string;
  members: [Types.ObjectId];
  storeTimings: string;
  bankDetails: string;
}

const storeSchema = new Schema<IStore>({
  // _id here is the actual storeId
  userId: {
    //This is the Auth
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    // Name of the store
    type: String,
    required: true,
  },
  email: {
    // Contact email for the store
    type: String,
    required: true,
  },
  address: {
    // Physical address of the store
    type: String,
    required: true,
  },
  mobile: {
    // Contact mobile number for the store
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: "Customer",
    default: [],
  },
  storeTimings: {
    type: String,
  },
  bankDetails: {
    type: String,
  },
});

const Store: Model<IStore> =
  models.Store || model<IStore>("Store", storeSchema);

export default Store;
