import { IStore } from "@/db/models/store/store.model";
import { Types } from "mongoose";

export type StoreDetails = {
  name: string;
  members: Types.ObjectId[];
  address: string;
  description: string;
};

export type StoreDocument = IStore & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
