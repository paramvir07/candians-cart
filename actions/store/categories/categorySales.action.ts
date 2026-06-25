"use server";

import { cache } from "react";
import mongoose, { PipelineStage } from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import OrderModel from "@/db/models/customer/Orders.Model";
import { ICategorySales } from "@/types/store/categorySales.types";

export const getCategorySales = cache(
  async (
    storeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ICategorySales[]> => {
    try {
      await dbConnect();

      // Dynamically build the match stage
      const matchStage: Record<string, any> = {
        status: "completed",
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      // Only filter by storeId if it's NOT "all"
      if (storeId !== "all") {
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
          throw new Error("Invalid store ID provided.");
        }
        matchStage.storeId = new mongoose.Types.ObjectId(storeId);
      }

      const aggregationPipeline: PipelineStage[] = [
        // 1. Match orders based on date, status, and optionally storeId
        { $match: matchStage },
        // 2. Combine standard products and subsidy items into a single array
        {
          $project: {
            createdAt: 1,
            allItems: {
              $concatArrays: [
                { $ifNull: ["$products", []] },
                { $ifNull: ["$subsidyItems", []] },
              ],
            },
          },
        },
        // 3. Unwind the combined items array
        { $unwind: "$allItems" },
        // 4. Join with the Products collection
        {
          $lookup: {
            from: "products", 
            localField: "allItems.productId",
            foreignField: "_id",
            as: "productDoc",
          },
        },
        // 5. Unwind the product document array
        { $unwind: "$productDoc" },
        // 6. First Grouping: Group by Product ID
        {
          $group: {
            _id: {
              category: "$productDoc.category",
              productId: "$allItems.productId",
              productName: "$productDoc.name",
            },
            productSalesQuantity: { $sum: "$allItems.quantity" },
            latestSaleDate: { $max: "$createdAt" },
          },
        },
        // 7. Second Grouping: Group by Category
        {
          $group: {
            _id: "$_id.category",
            totalCategorySales: { $sum: "$productSalesQuantity" },
            details: {
              $push: {
                productId: "$_id.productId",
                productName: "$_id.productName",
                sales: "$productSalesQuantity",
                date: "$latestSaleDate",
              },
            },
          },
        },
        // 8. Project to match our ICategorySales interface
        {
          $project: {
            _id: 0,
            category: "$_id",
            totalSales: "$totalCategorySales",
            details: 1,
          },
        },
        // 9. Sort categories by highest sales volume
        { $sort: { totalSales: -1 } },
      ];

      const rawResults = await OrderModel.aggregate(aggregationPipeline);

      const serializedData: ICategorySales[] = rawResults.map(
        (categoryGroup) => ({
          category: categoryGroup.category,
          totalSales: categoryGroup.totalSales,
          details: categoryGroup.details.map((detail: Record<string, any>) => ({
            productId: detail.productId.toString(),
            productName: detail.productName,
            sales: detail.sales,
            date: new Date(detail.date).toISOString(),
          })),
        }),
      );

      return serializedData;
    } catch (error) {
      console.error("[CATEGORY_SALES_AGGREGATION_ERROR]:", error);
      return [];
    }
  },
);