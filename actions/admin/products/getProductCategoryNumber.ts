"use server";

import { dbConnect } from "@/db/dbConnect";
import mongoose from "mongoose";
import Product from "@/db/models/store/products.model";
import { ProductCategory } from "@/types/store/products.types";
import { categories } from "@/lib/categories";

export type CategoryCountResponse =
  | { success: true; data: Partial<Record<ProductCategory, number>> }
  | { success: false; error: string };

export const getCategoryCounts = async (
  storeId?: string,
): Promise<CategoryCountResponse> => {
  try {
    await dbConnect();

    const matchStage: Record<string, mongoose.Types.ObjectId> = {};

    if (storeId) {
      matchStage.storeId = new mongoose.Types.ObjectId(storeId);
    }

    const counts = await Product.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const result: Partial<Record<ProductCategory, number>> = {};

    categories.forEach((cat) => {
      result[cat as ProductCategory] = 0;
    });
    counts.forEach((item: { _id: ProductCategory; count: number }) => {
      if (item._id) {
        result[item._id] = item.count;
      }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return { success: false, error: "Failed to fetch category counts" };
  }
};
