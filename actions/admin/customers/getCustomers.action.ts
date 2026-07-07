"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer, {
  type EventParticipantStatus,
} from "@/db/models/customer/customer.model";
import mongoose from "mongoose";

export interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  province: string;
  walletBalance: number;
  giftWalletBalance: number;
  associatedStoreId: string;
  referralCodeId: string;
  myreferralCodeId?: string;
  referralCode?: string;
  storeName: string;
  createdAt: string;
  updatedAt?: string;
  hasCartItems?: boolean;
  [key: string]: any;
}

export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetCustomersResult {
  success: boolean;
  data: AdminCustomer[];
  pagination?: PaginationMeta;
  error?: string;
}

export interface SearchCompound {
  should: Record<string, unknown>[];
  minimumShouldMatch: number;
  filter?: Record<string, unknown>[];
}

// ─── Filters ───────────────────────────────────────────────────────────────

export interface CustomerFilters {
  storeId?: string;
  walletMin?: number; // cents
  walletMax?: number; // cents
  referralCodeEnabled?: boolean;
  placedFirstOrder?: boolean;
  eventParticipant?: EventParticipantStatus;
  city?: string;
  hasCartItems?: boolean;
}

export interface CustomerFilterOptions {
  eventParticipantOptions: EventParticipantStatus[];
  cityOptions: string[];
}

function serializeCustomer(c: any): AdminCustomer {
  return {
    ...c,
    _id: c._id?.toString() ?? "",
    userId: c.userId?.toString() ?? "",
    associatedStoreId: c.associatedStoreId?.toString() ?? "",
    referralCodeId: c.referralCodeId?.toString() ?? "",
    myreferralCodeId: c.myreferralCodeId?.toString() ?? "",
    referralCode: c.referralCode ?? "",
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : "",
    hasCartItems: !!c.hasCartItems,
  };
}

/**
 * Distinct values for building filter dropdowns without hardcoding enums
 * that might drift from what's actually in the DB.
 */
export async function getCustomerFilterOptions(): Promise<{
  success: boolean;
  data?: CustomerFilterOptions;
  error?: string;
}> {
  try {
    await dbConnect();

    const [eventParticipantOptions, cityOptions] = await Promise.all([
      Customer.distinct("eventParticipant"),
      Customer.distinct("city"),
    ]);

    return {
      success: true,
      data: {
        eventParticipantOptions: eventParticipantOptions
          .filter((v): v is EventParticipantStatus => !!v)
          .sort(),
        cityOptions: cityOptions.filter((v): v is string => !!v).sort(),
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getStoreCustomers(
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 12,
): Promise<GetCustomersResult> {
  try {
    await dbConnect();

    const currentPage = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (currentPage - 1) * limitNum;

    const match: Record<string, any> = {};

    if (storeId && mongoose.isValidObjectId(storeId)) {
      match.associatedStoreId = new mongoose.Types.ObjectId(storeId);
    }

    const totalCount = await Customer.countDocuments(match);
    const totalPages = Math.ceil(totalCount / limitNum);

    const data = await Customer.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },

      {
        $lookup: {
          from: "stores",
          localField: "associatedStoreId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "referralcodes",
          localField: "referralCodeId",
          foreignField: "_id",
          as: "referralCodeData",
        },
      },
      {
        $unwind: {
          path: "$referralCodeData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          storeName: "$store.name",
          referralCode: "$referralCodeData.code",
        },
      },
      { $project: { store: 0, referralCodeData: 0 } },
    ]);

    return {
      success: true,
      data: data.map(serializeCustomer),
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit: limitNum,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function getSearchCustomer(
  searchTerm: string,
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 10,
): Promise<GetCustomersResult> {
  try {
    await dbConnect();

    const cleanSearchTerm = searchTerm.trim();
    const currentPage = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (currentPage - 1) * limitNum;

    if (!cleanSearchTerm) {
      return getStoreCustomers(storeId, page, limit);
    }

    const pipeline: mongoose.PipelineStage[] = [];
    let totalCount = 0;

    if (mongoose.isValidObjectId(cleanSearchTerm)) {
      const exactMatch: Record<string, any> = {
        _id: new mongoose.Types.ObjectId(cleanSearchTerm),
      };

      if (storeId && mongoose.isValidObjectId(storeId)) {
        exactMatch.associatedStoreId = new mongoose.Types.ObjectId(storeId);
      }

      pipeline.push({ $match: exactMatch });
      totalCount = await Customer.countDocuments(exactMatch);
    } else {
      const compoundStage: SearchCompound = {
        should: [
          {
            autocomplete: {
              query: cleanSearchTerm,
              path: "name",
              fuzzy: { maxEdits: 1 },
            },
          },
          {
            autocomplete: {
              query: cleanSearchTerm,
              path: "email",
              fuzzy: { maxEdits: 1 },
            },
          },
          { text: { query: cleanSearchTerm, path: "mobile" } },
        ],
        minimumShouldMatch: 1,
      };

      if (storeId && mongoose.isValidObjectId(storeId)) {
        compoundStage.filter = [
          {
            equals: {
              path: "associatedStoreId",
              value: new mongoose.Types.ObjectId(storeId),
            },
          },
        ];
      }

      const searchStage: mongoose.PipelineStage = {
        $search: { index: "CustomerSearch", compound: compoundStage },
      };

      pipeline.push(searchStage);

      const metaAgg = await Customer.aggregate([
        searchStage,
        { $count: "total" },
      ]);

      totalCount = metaAgg[0]?.total || 0;
    }

    const totalPages = Math.ceil(totalCount / limitNum);

    pipeline.push(
      { $skip: skip },
      { $limit: limitNum },

      {
        $lookup: {
          from: "stores",
          localField: "associatedStoreId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "referralcodes",
          localField: "referralCodeId",
          foreignField: "_id",
          as: "referralCodeData",
        },
      },
      {
        $unwind: {
          path: "$referralCodeData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          storeName: "$store.name",
          referralCode: "$referralCodeData.code",
        },
      },
      { $project: { store: 0, referralCodeData: 0 } },
    );

    const data = await Customer.aggregate(pipeline);

    return {
      success: true,
      data: data.map(serializeCustomer),
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit: limitNum,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, data: [], error: errorMessage };
  }
}

// ─── Admin: search + filters combined ───────────────────────────────────────

/**
 * Admin-only. Handles free-text search (Atlas Search, same as getSearchCustomer)
 * AND structured filters (store, wallet range, referral/first-order flags,
 * event participation, city, and whether the customer currently has any
 * items sitting in their cart) in a single pipeline.
 *
 * Pass `searchTerm` as null/empty to filter without searching.
 */
export async function getCustomersFiltered(
  searchTerm: string | null | undefined,
  page: number = 1,
  limit: number = 12,
  filters: CustomerFilters = {},
): Promise<GetCustomersResult> {
  try {
    await dbConnect();

    const cleanSearchTerm = (searchTerm ?? "").trim();
    const currentPage = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (currentPage - 1) * limitNum;

    const pipeline: mongoose.PipelineStage[] = [];

    // Exact ObjectId lookup (barcode/manual ID search) takes priority
    const isObjectIdSearch =
      !!cleanSearchTerm && mongoose.isValidObjectId(cleanSearchTerm);

    if (isObjectIdSearch) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(cleanSearchTerm) },
      });
    } else if (cleanSearchTerm) {
      const compoundStage: SearchCompound = {
        should: [
          {
            autocomplete: {
              query: cleanSearchTerm,
              path: "name",
              fuzzy: { maxEdits: 1 },
            },
          },
          {
            autocomplete: {
              query: cleanSearchTerm,
              path: "email",
              fuzzy: { maxEdits: 1 },
            },
          },
          { text: { query: cleanSearchTerm, path: "mobile" } },
        ],
        minimumShouldMatch: 1,
      };
      pipeline.push({
        $search: { index: "CustomerSearch", compound: compoundStage },
      });
    }

    // Plain-field filters
    const matchStage: Record<string, any> = {};

    if (filters.storeId && mongoose.isValidObjectId(filters.storeId)) {
      matchStage.associatedStoreId = new mongoose.Types.ObjectId(
        filters.storeId,
      );
    }
    if (filters.walletMin !== undefined || filters.walletMax !== undefined) {
      matchStage.walletBalance = {};
      if (filters.walletMin !== undefined)
        matchStage.walletBalance.$gte = filters.walletMin;
      if (filters.walletMax !== undefined)
        matchStage.walletBalance.$lte = filters.walletMax;
    }
    if (filters.referralCodeEnabled !== undefined) {
      matchStage.referralCodeEnabled = filters.referralCodeEnabled;
    }
    if (filters.placedFirstOrder !== undefined) {
      matchStage.placedFirstOrder = filters.placedFirstOrder;
    }
    if (filters.eventParticipant) {
      matchStage.eventParticipant = filters.eventParticipant;
    }
    if (filters.city) {
      matchStage.city = filters.city;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Cart lookup — needed whenever hasCartItems is set, and also exposed
    // on every returned row so the UI can show a "has items" badge.
    pipeline.push(
      {
        $lookup: {
          from: "carts",
          localField: "_id",
          foreignField: "customerId",
          as: "cart",
        },
      },
      {
        $addFields: {
          cartItemCount: {
            $add: [
              {
                $size: {
                  $ifNull: [{ $arrayElemAt: ["$cart.items", 0] }, []],
                },
              },
              {
                $size: {
                  $ifNull: [{ $arrayElemAt: ["$cart.subsidyItems", 0] }, []],
                },
              },
              {
                $size: {
                  $ifNull: [{ $arrayElemAt: ["$cart.miscItems", 0] }, []],
                },
              },
            ],
          },
        },
      },
    );

    if (filters.hasCartItems !== undefined) {
      pipeline.push({
        $match: filters.hasCartItems
          ? { cartItemCount: { $gt: 0 } }
          : { cartItemCount: { $lte: 0 } },
      });
    }

    // Count total matches before pagination
    const countResult = await Customer.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);
    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / limitNum));

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },

      {
        $lookup: {
          from: "stores",
          localField: "associatedStoreId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "referralcodes",
          localField: "referralCodeId",
          foreignField: "_id",
          as: "referralCodeData",
        },
      },
      {
        $unwind: {
          path: "$referralCodeData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          storeName: "$store.name",
          referralCode: "$referralCodeData.code",
          hasCartItems: { $gt: ["$cartItemCount", 0] },
        },
      },
      { $project: { store: 0, referralCodeData: 0, cart: 0 } },
    );

    const data = await Customer.aggregate(pipeline);

    return {
      success: true,
      data: data.map(serializeCustomer),
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit: limitNum,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, data: [], error: errorMessage };
  }
}
