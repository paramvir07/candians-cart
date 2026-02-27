"use server";

import { dbConnect } from "@/db/dbConnect";
import Store from "@/db/models/store/store.model";
import { StoreDocument } from "@/types/store/store";
import { getUserSession } from "../auth/getUserSession.actions";

export type GetStoresResponse =
  | { success: true; data: StoreDocument[] }
  | { success: false; error: string };

/**
 * Fetches all stores from the database.
 *
 * Establishes a DB connection, retrieves all Store documents,
 * serializes them into plain JSON objects, and returns a typed result.
 *
 * @returns {Promise<GetStoresResponse>} Success with store data or an error message.
 *
 * @example
 * const result = await getStores();
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */

export const getStores = async (): Promise<GetStoresResponse> => {
  try {
    await dbConnect();

    const stores = await Store.find().lean();

    if (!stores)
      return {
        success: false,
        error: `No stores found`,
      };

    // Serialising the stores
    const serializedStores = JSON.parse(JSON.stringify(stores));
    return { success: true, data: serializedStores };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch stores. Please try again later ${error}`,
    };
  }
};

export const getMyStoreData = async () => {
  try {
    const session = await getUserSession();
    if (session.user.role !== "store")
      return {
        success: false,
        message: "Error!! Not authenticated as a store",
      };
    await dbConnect();

    const storeData = await Store.findOne({ userId: session.user.id }).lean();

    if (!storeData)
      return {
        success: false,
        error: `Store data not found`,
      };

    // Serialising the store data
    const serializedStoreData = JSON.parse(JSON.stringify(storeData));
    return { success: true, data: serializedStoreData };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch my store data. Please try again later ${error}`,
    };
  }
};
