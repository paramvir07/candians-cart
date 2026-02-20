"use server";

import { dbConnect } from "@/db/dbConnect";
import Store from "@/db/models/store/store.model";
import { StoreDocument } from "@/types/store/store";

export type GetStoresResponse =
  | { success: true; data: StoreDocument[] }
  | { success: false; error: string };

export const getStores = async (): Promise<GetStoresResponse> => {
  try {
    await dbConnect();

    const stores = await Store.find().lean();

    if (!stores)
      return {
        success: false,
        error: `No stores found`,
      };
    return { success: true, data: stores };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch stores. Please try again later ${error}`,
    };
  }
};
