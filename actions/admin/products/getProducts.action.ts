"use server";

import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import mongoose from "mongoose";

export interface AdminProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: boolean;
  subsidised: boolean;
  storeId: string;
  storeName: string;
  createdAt: Date;
  // ...rest of IProduct fields passed through
  [key: string]: any;
}

export interface GetProductsResult {
  success: boolean;
  data: AdminProduct[];
  totalPages: number;
  totalCount: number;
  error?: string;
}

export async function getStoreProductsPaginated(
  storeId: string | null | undefined,
  page: number = 1,
  limit: number = 12,
): Promise<GetProductsResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {};
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      productsModel.aggregate([
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
      data: data.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        storeId: p.storeId?.toString() ?? "",
      })),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error.message,
    };
  }
}

export async function searchProducts(
  query: string,
  storeId?: string | null,
): Promise<GetProductsResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {
      name: { $regex: query, $options: "i" },
    };
    if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);

    const data = await productsModel.aggregate([
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
      data: data.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        storeId: p.storeId?.toString() ?? "",
      })),
      totalPages: 1,
      totalCount: data.length,
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error.message,
    };
  }
}
