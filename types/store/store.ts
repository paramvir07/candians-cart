import { IStore } from "@/db/models/store/store.model";
import { Types } from "mongoose";

export type StoreDetails = {
  name: string;
  members: number;
  address: string;
  description: string;
};

export type StoreDocument = IStore & {
  _id: Types.ObjectId;
  __v: number;
};
