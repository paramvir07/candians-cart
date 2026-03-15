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

export interface GetCustomersResult {
  success: boolean;
  data: AdminCustomer[];
  error?: string;
}

export async function getStoreCustomers(
  storeId: string | null | undefined,
): Promise<GetCustomersResult> {
  try {
    await dbConnect();

    const match: Record<string, any> = {};
    if (storeId) match.associatedStoreId = new mongoose.Types.ObjectId(storeId);

    const data = await Customer.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
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
        _id: c._id.toString(),
        associatedStoreId: c.associatedStoreId?.toString() ?? "",
      })),
    };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}
