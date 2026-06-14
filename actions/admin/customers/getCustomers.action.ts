"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
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
  associatedStoreId: string;
  storeName: string;
  createdAt: Date;
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

export async function getStoreCustomers(
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 25,
): Promise<GetCustomersResult> {
  try {
    await dbConnect();

    const currentPage = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (currentPage - 1) * limitNum;

    const match: Record<string, any> = {};
    if (storeId) match.associatedStoreId = new mongoose.Types.ObjectId(storeId);

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
      { $addFields: { storeName: "$store.name" } },
      { $project: { store: 0 } },
    ]);

    return {
      success: true,
      data: data.map((c: any) => ({
        ...c,
        _id: c._id?.toString(),
        userId: c.userId?.toString() ?? "",
        associatedStoreId: c.associatedStoreId?.toString() ?? "",
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
        updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : "",
      })),
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
      const exactMatch: Record<string, mongoose.Types.ObjectId> = {
        _id: new mongoose.Types.ObjectId(cleanSearchTerm),
      };
      if (storeId) {
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
      if (storeId) {
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
        $search: {
          index: "CustomerSearch",
          compound: compoundStage,
        },
      };
      pipeline.push(searchStage);

      const metaAgg = await Customer.aggregate([
        searchStage,
        { $count: "total" },
      ]);
      totalCount = metaAgg[0].total || 0;
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
      { $addFields: { storeName: "$store.name" } },
      { $project: { store: 0 } },
    );

    const data = await Customer.aggregate(pipeline);

    return {
      success: true,
      data: data.map((c) => ({
        ...c,
        _id: c._id?.toString() ?? "",
        userId: c.userId?.toString() ?? "",
        associatedStoreId: c.associatedStoreId?.toString() ?? "",
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
        updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : "",
      })),
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
