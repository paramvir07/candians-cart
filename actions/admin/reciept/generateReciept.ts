"use server";
/*
Check the following link for the logic
https://docs.google.com/document/d/1msayLur-Ofb5cjI1PPnytFw_ohjKGi9cmftKTKQy6AE/edit?usp=sharing
*/
import mongoose, { PipelineStage, Types } from "mongoose";
import OrderModel, { PlaceOrderI } from "@/db/models/customer/Orders.Model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export interface GetRecieptParams {
  startDate: Date;
  endDate: Date;
  storeId?: string | Types.ObjectId;
  status?: PlaceOrderI["status"];
}

export interface AggregatedReciept {
  _id: string | null;
  orderCount: number;
  orderIds: string[];
  totalCustomerPaid: number;
  totalBasePrice: number;
  totalDisposableFee: number;
  totalGST: number;
  totalPST: number;
  totalTax: number;
  totalSubsidy: number;
  baseTax: number;
  markupTax: number;
  storebasetaxGST: number;
  storebasetaxPST: number;
  platformMarkuptax: number;
  storeFixedValue: number;
  grossMargin: number;
  storeProfit: number;
  storePayout: number;
  platformProfit: number;
  platformCommision: number;
  totalWalletTopUpCashCollected: number;
  totalOrderCashCollected: number;
  totalCashCollected: number;
}

// Cleanly define the raw data coming out of the MongoDB aggregation
type OrderAggregateResult = {
  _id: Types.ObjectId | null;
  orderCount: number;
  orderIds: Types.ObjectId[];
  totalCustomerPaid: number;
  totalBasePrice: number;
  totalDisposableFee: number;
  totalGST: number;
  totalPST: number;
  totalSubsidy: number;
  totalOrderCashCollected: number;
};

export async function getRecieptDataByDateRange(
  params: GetRecieptParams,
): Promise<AggregatedReciept[]> {
  const session = await getUserSession();

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const { startDate, endDate, storeId, status = "completed" } = params;

  try {
    if (startDate > endDate) {
      throw new Error("Start date must be before end date");
    }

    await dbConnect();

    const matchStage: PipelineStage.Match = {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: status,
      },
    };

    const parsedStoreId = storeId
      ? typeof storeId === "string"
        ? new mongoose.Types.ObjectId(storeId)
        : storeId
      : undefined;

    if (parsedStoreId) {
      matchStage.$match.storeId = parsedStoreId;
    }

    // Keep the DB pipeline simple: Just group and sum the raw metrics
    const orderPipeline: PipelineStage[] = [
      matchStage,
      {
        $group: {
          _id: storeId ? "$storeId" : null,
          orderCount: { $sum: 1 },
          orderIds: { $push: "$_id" },
          totalCustomerPaid: { $sum: "$cartTotal" },
          totalBasePrice: { $sum: "$BaseTotal" },
          totalDisposableFee: { $sum: "$TotalDisposableFee" },
          totalGST: { $sum: "$TotalGST" },
          totalPST: { $sum: "$TotalPST" },
          totalSubsidy: { $sum: "$subsidy" },
          totalOrderCashCollected: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "cash"] }, "$cartTotal", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const topUpPipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentMode: "cash",
        },
      },
      {
        $addFields: {
          cashierObjectId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "cashiers",
          localField: "cashierObjectId",
          foreignField: "_id",
          as: "cashierDoc",
        },
      },
      {
        $unwind: { path: "$cashierDoc", preserveNullAndEmptyArrays: false },
      },
    ];

    if (parsedStoreId) {
      topUpPipeline.push({
        $match: {
          "cashierDoc.storeId": parsedStoreId,
        },
      });
    }

    topUpPipeline.push({
      $group: {
        _id: parsedStoreId ? "$cashierDoc.storeId" : null,
        totalWalletTopUpCashCollected: { $sum: "$value" },
      },
    });

    const [receiptsRaw, topUpsRaw] = await Promise.all([
      OrderModel.aggregate<OrderAggregateResult>(orderPipeline).exec(),
      WalletTopUp.aggregate<{
        _id: Types.ObjectId | null;
        totalWalletTopUpCashCollected: number;
      }>(topUpPipeline).exec(),
    ]);

    if (!receiptsRaw || receiptsRaw.length === 0) {
      throw new Error("No completed orders found for this date range.");
    }

    const topUpMap = new Map(
      topUpsRaw.map((topUp) => [
        topUp._id ? topUp._id.toString() : "global",
        topUp.totalWalletTopUpCashCollected,
      ]),
    );

    // Perform business logic transforms here (easier to test, type-safe, and avoids Mongo floating point bugs)
    return receiptsRaw.map((receipt) => {
      const storeKey = receipt._id ? receipt._id.toString() : "global";

      // Ensure all raw values are cleanly rounded to integers (cents)
      const totalCustomerPaid = Math.round(receipt.totalCustomerPaid);
      const totalBasePrice = Math.round(receipt.totalBasePrice);
      const totalDisposableFee = Math.round(receipt.totalDisposableFee);
      const totalGST = Math.round(receipt.totalGST);
      const totalPST = Math.round(receipt.totalPST);
      const totalSubsidy = Math.round(receipt.totalSubsidy);
      const totalOrderCashCollected = Math.round(
        receipt.totalOrderCashCollected,
      );
      const totalWalletTopUpCashCollected = Math.round(
        topUpMap.get(storeKey) || 0,
      );

      // 1. Calculate Tax & Markup
      const totalTax = totalGST + totalPST;
      const totalMarkup =
        totalCustomerPaid - (totalBasePrice + totalDisposableFee + totalTax);

      // 2. Calculate Proportional Tax (Val, Base%, Markup%)
      const val = totalBasePrice + totalMarkup;
      const basePercent = val > 0 ? totalBasePrice / val : 0;

      // To prevent fraction-of-a-cent losses, compute GST and PST separately, then add
      const storebasetaxGST = Math.round(totalGST * basePercent);
      const storebasetaxPST = Math.round(totalPST * basePercent);
      const baseTax = storebasetaxGST + storebasetaxPST;

      // Markup tax is simply the remainder of the total tax
      const markupTax = totalTax - baseTax;
      const platformMarkuptax = markupTax;

      // 3. Store Metrics
      const storeFixedValue = totalBasePrice + totalDisposableFee + baseTax;
      const grossMargin = totalCustomerPaid - storeFixedValue;

      // Easily adjustable margin variable. Set to 0.35 to match the terminal verification script.
      const STORE_PROFIT_MARGIN = 0.35;

      // Added totalSubsidy back in based on the formula: (grossMargin + [subsidy]) * 0.35
      const storeProfit = Math.round(
        (grossMargin + totalSubsidy) * STORE_PROFIT_MARGIN,
      );

      // 4. Payout Calculations
      const totalCashCollected =
        totalOrderCashCollected + totalWalletTopUpCashCollected;
      const storePayout = storeProfit + storeFixedValue - totalCashCollected;

      // 5. Platform Metrics
      const platformProfit =
        totalCustomerPaid - (storeProfit + storeFixedValue);
      const platformCommision = platformProfit + totalSubsidy;

      return {
        _id: storeKey === "global" ? null : storeKey,
        orderCount: receipt.orderCount,
        orderIds: receipt.orderIds.map((id) => id.toString()),
        totalCustomerPaid,
        totalBasePrice,
        totalDisposableFee,
        totalGST,
        totalPST,
        totalTax,
        totalSubsidy,
        baseTax,
        markupTax,
        storebasetaxGST,
        storebasetaxPST,
        platformMarkuptax,
        storeFixedValue,
        grossMargin,
        storeProfit,
        storePayout,
        platformProfit,
        platformCommision,
        totalWalletTopUpCashCollected,
        totalOrderCashCollected,
        totalCashCollected,
      };
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[getReceiptDataByDateRange] Database error:", errorMessage);
    throw new Error(
      "Failed to fetch aggregate receipt data for the specified date range.",
    );
  }
}
