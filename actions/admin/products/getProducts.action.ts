"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import mongoose from "mongoose";

// Updated interface to reflect serialized string values
export interface AdminProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  markup: number;
  tax: number;
  disposableFee?: number;
  price: number;
  stock: boolean;
  subsidised: boolean;
  isFeatured: boolean;
  storeId: string;
  storeName: string;
  InvoiceId?: string;
  createdAt: string; 
  updatedAt: string;
  images?: {
    url: string;
    fileId: string;
    _id?: string;
  }[];
}

export interface GetProductsResult {
  success: boolean;
  data: AdminProduct[];
  totalPages: number;
  totalCount: number;
  error?: string;
}

// Utility type for Mongoose Aggregation Output
type AggregatedProduct = Omit<AdminProduct, '_id' | 'storeId' | 'InvoiceId' | 'createdAt' | 'updatedAt' | 'images'> & {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  InvoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  images?: { url: string; fileId: string; _id: mongoose.Types.ObjectId }[];
};

/**
 * Helper function to safely serialize the Mongoose Product Document
 */
function serializeProduct(p: AggregatedProduct): AdminProduct {
  return {
    ...p,
    _id: p._id.toString(),
    storeId: p.storeId?.toString() ?? "",
    InvoiceId: p.InvoiceId ? p.InvoiceId.toString() : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    images: p.images?.map((img) => ({
      url: img.url,
      fileId: img.fileId,
      _id: img._id?.toString(),
    })),
  };
}

export async function getStoreProductsPaginated(
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 12,
): Promise<GetProductsResult> {
  try {
    await dbConnect();

    const match: Record<string, mongoose.Types.ObjectId> = {};
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      productsModel.aggregate<AggregatedProduct>([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "stores",
            localField: "storeId",
            foreignField: "_id",
            as: "store",
          },
        },
        { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            storeName: "$store.name",
          },
        },
        { $project: { store: 0 } },
      ]),
      productsModel.countDocuments(match),
    ]);

    return {
      success: true,
      data: data.map(serializeProduct),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: err.message,
    };
  }
}

export async function searchProducts(
  query: string,
  storeId?: string | null,
): Promise<GetProductsResult> {
  try {
    await dbConnect();

    const match: Record<string, unknown> = {
      name: { $regex: query, $options: "i" },
    };
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

    const data = await productsModel.aggregate<AggregatedProduct>([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
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
      data: data.map(serializeProduct),
      totalPages: 1,
      totalCount: data.length,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: err.message,
    };
  }
}