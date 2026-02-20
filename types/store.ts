import { IStoreInfo } from "@/db/models/store/storeInfo.model";
import { Types } from "mongoose";

export type StoreDetails = {
  name: string;
  members: number;
  address: string;
  description: string;
};

export type StoreDocument = IStoreInfo & {
  _id: Types.ObjectId;
  __v: number;
};

