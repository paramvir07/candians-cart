"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import mongoose from "mongoose";

export interface RecentCustomer {
  customerId: string;
  name: string;
  email: string;
  city: string;
  province: string;
  storeName: string;
  storeId: string;
  joinedAt: Date;
}

export async function getRecentCustomers(
  storeId?: string | null,
  limit = 6,
): Promise<RecentCustomer[]> {
  await dbConnect();

  const match: Record<string, any> = {};
  if (storeId) match.associatedStoreId = new mongoose.Types.ObjectId(storeId);

  const docs = await Customer.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
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
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        city: 1,
        province: 1,
        storeName: "$store.name",
        storeId: "$associatedStoreId",
        createdAt: 1,
      },
    },
  ]);

  return docs.map((c: any) => ({
    customerId: c._id.toString(),
    name: c.name ?? "Unknown",
    email: c.email ?? "",
    city: c.city ?? "",
    province: c.province ?? "",
    storeName: c.storeName ?? "Unknown Store",
    storeId: c.storeId?.toString() ?? "",
    joinedAt: c.createdAt,
  }));
}
