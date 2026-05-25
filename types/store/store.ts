import { IStore } from "@/db/models/store/store.model";

export type StoreDetails = {
  name: string;
  members: Number;
  address: string;
  description: string;
};

export type StoreDocument = IStore & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
