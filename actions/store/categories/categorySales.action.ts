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

      const matchStage: Record<string, any> = {
        status: "completed",
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (storeId !== "all") {
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
          throw new Error("Invalid store ID provided.");
        }
        matchStage.storeId = new mongoose.Types.ObjectId(storeId);
      }

      const aggregationPipeline: PipelineStage[] = [
        { $match: matchStage },
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
        { $unwind: "$allItems" },
        {
          $lookup: {
            from: "products",
            localField: "allItems.productId",
            foreignField: "_id",
            as: "productDoc",
          },
        },
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
            // carry the flag through — $first is fine since it's constant per product
            isMeasuredInWeight: { $first: "$productDoc.isMeasuredInWeight" },
          },
        },
        // 7. Second Grouping: Group by Category
        {
          $group: {
            _id: "$_id.category",
            totalCategorySales: { $sum: "$productSalesQuantity" },
            // true if ANY product in this category is weight-measured
            // (Mongo compares booleans as false < true, so $max works here)
            categoryIsMeasuredInWeight: { $max: "$isMeasuredInWeight" },
            details: {
              $push: {
                productId: "$_id.productId",
                productName: "$_id.productName",
                sales: "$productSalesQuantity",
                date: "$latestSaleDate",
                isMeasuredInWeight: "$isMeasuredInWeight",
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
            isMeasuredInWeight: {
              $ifNull: ["$categoryIsMeasuredInWeight", false],
            },
            details: 1,
          },
        },
        { $sort: { totalSales: -1 } },
      ];

      const rawResults = await OrderModel.aggregate(aggregationPipeline);

      const serializedData: ICategorySales[] = rawResults.map(
        (categoryGroup) => ({
          category: categoryGroup.category,
          totalSales: categoryGroup.totalSales,
          isMeasuredInWeight: !!categoryGroup.isMeasuredInWeight,
          details: categoryGroup.details.map((detail: Record<string, any>) => ({
            productId: detail.productId.toString(),
            productName: detail.productName,
            sales: detail.sales,
            date: new Date(detail.date).toISOString(),
            isMeasuredInWeight: !!detail.isMeasuredInWeight,
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
