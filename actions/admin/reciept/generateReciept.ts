"use server";
/*
Check the following link for the logic
https://docs.google.com/document/d/1msayLur-Ofb5cjI1PPnytFw_ohjKGi9cmftKTKQy6AE/edit?usp=sharing
*/
import mongoose, { PipelineStage, Types } from "mongoose";
import OrderModel, {
  PlaceOrderI,
  PlaceOrderMiscItem,
} from "@/db/models/customer/Orders.Model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { MiscellaneousItemsModel } from "@/db/models/customer/MiscItem.model";
import ProductModel from "@/db/models/store/products.model";

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
  storeMarkupTax: number;
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
  allMiscItems: PlaceOrderMiscItem[][];
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

    const parsedStoreId = storeId
      ? typeof storeId === "string"
        ? new mongoose.Types.ObjectId(storeId)
        : storeId
      : undefined;

    const matchStage: PipelineStage.Match = {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: status,
        ...(parsedStoreId && { storeId: parsedStoreId }),
      },
    };

    // if (parsedStoreId) {
    //   matchStage.$match.storeId = parsedStoreId;
    // }

    const ordersWithMisc = await OrderModel.find({
      ...matchStage.$match,
      "miscItems.0": { $exists: true }, // Only query orders that actually have misc items
    })
      .select("miscItems")
      .lean();

    const uniqueMiscItemIds = [
      ...new Set(
        ordersWithMisc.flatMap((o) =>
          o.miscItems.map((m) => m.miscItemId.toString()),
        ),
      ),
    ];

    // map holding our product data
    const miscProductDataMap = new Map<string, any>();

    if (uniqueMiscItemIds.length > 0) {
      const fetchedMiscItems = await MiscellaneousItemsModel.find({
        _id: { $in: uniqueMiscItemIds },
      })
        .populate("productId")
        .lean();
      const unaddedItems = fetchedMiscItems.filter((item) => !item.isAdded);
      if (unaddedItems.length > 0) {
        const errorNames = unaddedItems.map((i) => i.productName).join(", ");
        throw new Error(
          `Cannot calculate payout. The following miscellaneous items must be added as products first: ${errorNames}`,
        );
      }
      fetchedMiscItems.forEach((item) => {
        if (item.productId) {
          miscProductDataMap.set(item._id.toString(), item.productId);
        }
      });
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
          allMiscItems: { $push: "$miscItems" },
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

      // Totals for linked product data
      const storeMiscItems = receipt.allMiscItems.flat();
      let miscBaseAdjustment = 0;
      let miscTaxGSTAdjustment = 0;
      let miscTaxPSTAdjustment = 0;
      let miscDisposableAdjustment = 0;
      let oldMiscGenericTotal = 0;

      storeMiscItems.forEach((miscItem) => {
        oldMiscGenericTotal += miscItem.total;

        const product = miscProductDataMap.get(miscItem.miscItemId.toString());
        if (product) {
          const basePrice = product.price * miscItem.quantity;
          const disposableFee =
            (product.disposableFee || 0) * miscItem.quantity;

          let gst = 0;
          let pst = 0;
          if (product.tax === 0.05) gst = basePrice * 0.05;
          else if (product.tax === 0.07) pst = basePrice * 0.07;
          else if (product.tax === 0.12) {
            gst = basePrice * 0.05;
            pst = basePrice * 0.07;
          }
          miscBaseAdjustment += basePrice;
          miscDisposableAdjustment += disposableFee;
          miscTaxGSTAdjustment += gst;
          miscTaxPSTAdjustment += pst;
        }
      });

      console.log(
        "Misc Data: ",
        miscBaseAdjustment,
        miscTaxGSTAdjustment,
        miscTaxPSTAdjustment,
        miscDisposableAdjustment,
        "Old Misc generic total",
        oldMiscGenericTotal,
      );

      // Ensure all raw values are cleanly rounded to integers (cents)
      const totalCustomerPaid = Math.round(receipt.totalCustomerPaid);
      const totalBasePrice = Math.round(
        receipt.totalBasePrice - oldMiscGenericTotal + miscBaseAdjustment,
      );
      const totalDisposableFee = Math.round(
        receipt.totalDisposableFee + miscDisposableAdjustment,
      );
      const totalGST = Math.round(receipt.totalGST + miscTaxGSTAdjustment);
      const totalPST = Math.round(receipt.totalPST + miscTaxPSTAdjustment);
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
      const STORE_PROFIT_MARGIN = 0.5;
      const storeMarkupTax = Math.round(markupTax * STORE_PROFIT_MARGIN);

      // 3. Store Metrics
      const storeFixedValue =
        totalBasePrice + totalDisposableFee + baseTax + storeMarkupTax;
      const grossMargin = totalCustomerPaid - storeFixedValue;

      // Added totalSubsidy back in based on the formula: (grossMargin + [subsidy]) * 0.35
      const storeProfit = Math.round(grossMargin * STORE_PROFIT_MARGIN);

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
        storeMarkupTax,
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
      errorMessage ||
        "An error occurred while generating the receipt. Please try again later.",
    );
  }
}
