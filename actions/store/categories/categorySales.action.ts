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

      // Ensure storeId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        throw new Error("Invalid store ID provided.");
      }

      const storeObjectId = new mongoose.Types.ObjectId(storeId);

      const aggregationPipeline: PipelineStage[] = [
        // 1. Match orders for the given store, in the date range, that are completed
        {
          $match: {
            storeId: storeObjectId,
            status: "completed",
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        // 2. Combine standard products and subsidy items into a single array for easier unwinding
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
        // 3. Unwind the combined items array to process each product sale individually
        {
          $unwind: "$allItems",
        },
        // 4. Join with the Products collection to get the product name and category
        {
          $lookup: {
            from: "products", // Mongoose uses lowercased, pluralized collection names
            localField: "allItems.productId",
            foreignField: "_id",
            as: "productDoc",
          },
        },
        // 5. Unwind the product document array created by the lookup
        {
          $unwind: "$productDoc",
        },
        // 6. First Grouping: Group by Product ID to calculate total quantity sold per product
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
        // 7. Second Grouping: Group by Category to compile the final array and total sales
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
        // 8. Project to match our ICategorySales interface exactly
        {
          $project: {
            _id: 0,
            category: "$_id",
            totalSales: "$totalCategorySales",
            details: 1,
          },
        },
        // 9. Sort categories by highest sales volume
        {
          $sort: { totalSales: -1 },
        },
      ];

      // Execute the aggregation
      // We use Record<string, any> type assertion because aggregate returns an array of any
      const rawResults = await OrderModel.aggregate(aggregationPipeline);

      // Serialize the data thoroughly (Convert Dates & ObjectIds to Strings for Client Components)
      const serializedData: ICategorySales[] = rawResults.map(
        (categoryGroup) => ({
          category: categoryGroup.category,
          totalSales: categoryGroup.totalSales,
          details: categoryGroup.details.map((detail: Record<string, any>) => ({
            productId: detail.productId.toString(),
            productName: detail.productName,
            sales: detail.sales,
            // Convert the ISODate object to an ISO string
            date: new Date(detail.date).toISOString(),
          })),
        }),
      );

      console.log(serializedData);

      return serializedData;
    } catch (error) {
      console.error("[CATEGORY_SALES_AGGREGATION_ERROR]:", error);
      // Return empty array as a safe fallback
      return [];
    }
  },
);
