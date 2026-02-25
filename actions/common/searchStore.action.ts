"use server";
import { dbConnect } from "@/db/dbConnect";
import Store from "@/db/models/store/store.model";
import { StoreDocument } from "@/types/store/store";

export type SearchStoresResponses =
  | { success: true; data: StoreDocument[] }
  | { success: false; error: string };


/**
 * Searches stores using MongoDB Atlas full-text search.
 *
 * If a search query is provided, performs a fuzzy text search
 * on name, address, and description fields using the "StoreSearch" index.
 * Results are limited to 20 documents.
 *
 * If no query is provided, returns all stores.
 * Returned documents are serialized into JSON-safe objects.
 *
 * @param {string} [searchQuery=""] - Optional text input for fuzzy search.
 * @returns {Promise<SearchStoresResponses>} Success with matching stores or an error message.
 *
 * @example
 * const result = await searchStore("downtown");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */

export const searchStores = async (
  searchQuery: string = "",
): Promise<SearchStoresResponses> => {
  try {
    await dbConnect();

    let stores;
    if (searchQuery && searchQuery.trim() !== "") {
      stores = await Store.aggregate([
        {
          $search: {
            index: "StoreSearch", // name of the index in the search and vector search mongo, ProductSearch for products
            text: {
              query: searchQuery.trim(),
              path: ["name", "address", "description"], // fields i want to search
              fuzzy: {
                maxEdits: 2, // allows for a max of 2 typos
                prefixLength: 1, // First character must match before fuzzy search
                maxExpansions: 50,
              },
            },
          },
        },
        { $limit: 20 }, // Add a limit of 20 stores
      ]);
    } else {
      stores = await Store.find({}).lean(); // no search query then return all
    }

    if (!stores) {
      return { success: false, error: "no stores found" };
    }

    const serializedStores = JSON.parse(JSON.stringify(stores));
    return {
      success: true,
      data: serializedStores,
    };
  } catch (error) {
    console.error("Store search error:", error);
    return {
      success: false,
      error: `Failed to search stores. Please try again later.`,
    };
  }
};
