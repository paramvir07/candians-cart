"use server";

import { dbConnect } from "@/db/dbConnect";
import StoreInfo from "@/db/models/store/storeInfo.model";
import { StoreDocument } from "@/types/store";

export type GetStoresResponse =
  | { success: true; data: StoreDocument[] }
  | { success: false; error: string };

export const getStores = async (): Promise<GetStoresResponse> => {
  try {
    await dbConnect();

    const stores = await StoreInfo.find().lean();


    return { success: true, data: stores };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch stores. Please try again later ${error}`,
    };
  }
};