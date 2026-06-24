"use server";
/*
Check the following link for the logic
https://docs.google.com/document/d/1msayLur-Ofb5cjI1PPnytFw_ohjKGi9cmftKTKQy6AE/edit?usp=sharing

NOTE: All monetary values in this file are in CENTS (integers), matching the
DB schema (cartTotal, BaseTotal, TotalGST, TotalPST, etc. are all stored as cents).
Rounding only happens ONCE, at the very end of the derivation, via round_(). Do not
round any intermediate value (totalGST, totalBasePrice, basePercent, etc.) before
that point -- doing so was the source of the mismatch against tests/test-payout.js.
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

export interface GetRecieptParams {
  startDate: Date;
  endDate: Date;
  storeId?: string | Types.ObjectId;
  status?: PlaceOrderI["status"];
}

export interface AggregatedReciept {
  _id: string | null;
  orderCount: number;
  totalPlatformFee: number;
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
  platformMarkupGSTTax: number;
  platformMarkupPSTTax: number;
  platformProfit: number;
  platformCommision: number;
  totalWalletTopUpCashCollected: number;
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
  allMiscItems: PlaceOrderMiscItem[][];
  totalStoreProfitRaw: number;
  totalPlatformProfitRaw: number;
};

// Round to the nearest whole cent. This must be the ONLY place rounding happens
// in the payout derivation -- applied once, to each final output field.
const round_ = (n: number): number => Math.round(n);

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
          allMiscItems: { $push: "$miscItems" },
          totalStoreProfitRaw: { $sum: "$storeProfit" },
          totalPlatformProfitRaw: { $sum: "$platformProfit" },
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

    const STORE_PROFIT_MARGIN = 0.5;
    const PLATFORM_FEE = 50; //50 cents

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
          // product.price / disposableFee are assumed to already be in cents,
          // matching the rest of the schema
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

      // --- Everything below is RAW (unrounded) until the return statement ---
      // All values are in cents.

      const totalPlatformFeeRaw = PLATFORM_FEE * receipt.orderCount;

      const dbStoreProfitRaw = receipt.totalStoreProfitRaw;
      const dbPlatformProfitRaw =
        receipt.totalPlatformProfitRaw - totalPlatformFeeRaw;

      const totalCustomerPaidRaw =
        receipt.totalCustomerPaid - totalPlatformFeeRaw;
      const totalBasePriceRaw =
        receipt.totalBasePrice - oldMiscGenericTotal + miscBaseAdjustment;
      const totalDisposableFeeRaw =
        receipt.totalDisposableFee + miscDisposableAdjustment;
      const totalGSTRaw = receipt.totalGST + miscTaxGSTAdjustment;
      const totalPSTRaw = receipt.totalPST + miscTaxPSTAdjustment;
      const totalSubsidyRaw = receipt.totalSubsidy;

      const totalWalletTopUpCashCollectedRaw = topUpMap.get(storeKey) || 0;

      // 1. Calculate Tax & Markup
      const totalTaxRaw = totalGSTRaw + totalPSTRaw;
      const totalMarkupRaw =
        totalCustomerPaidRaw -
        (totalBasePriceRaw + totalDisposableFeeRaw + totalTaxRaw);

      // 2. Calculate Proportional Tax (Val, Base%, Markup%)
      const valRaw = totalBasePriceRaw + totalMarkupRaw;
      const basePercent = valRaw > 0 ? totalBasePriceRaw / valRaw : 0;
      const markupPercent = valRaw > 0 ? totalMarkupRaw / valRaw : 0;

      // GST and PST split proportionally by basePercent
      const storebasetaxGSTRaw = totalGSTRaw * basePercent;
      const storebasetaxPSTRaw = totalPSTRaw * basePercent;
      const baseTaxRaw = storebasetaxGSTRaw + storebasetaxPSTRaw;

      // Markup tax: proportional split (mirrors tests/test-payout.js exactly)
      const markupTaxRaw = totalTaxRaw * markupPercent;
      const platformMarkuptaxRaw = markupTaxRaw;

      // Breaking up the total platform markup tax into GST/PST components
      const gstPercentage = totalTaxRaw > 0 ? totalGSTRaw / totalTaxRaw : 0;
      const platformMarkupGSTTaxRaw = markupTaxRaw * gstPercentage;
      const platformMarkupPSTTaxRaw = markupTaxRaw - platformMarkupGSTTaxRaw;

      const storeMarkupTaxRaw = markupTaxRaw * STORE_PROFIT_MARGIN;

      // 3. Store Metrics
      const storeFixedValueRaw =
        totalBasePriceRaw +
        totalDisposableFeeRaw +
        baseTaxRaw +
        storeMarkupTaxRaw;

      const grossMarginRaw =
        totalCustomerPaidRaw - storeFixedValueRaw - totalSubsidyRaw;

      // const grossMarginRaw = totalCustomerPaidRaw - storeFixedValueRaw;

      const storeProfitRaw = grossMarginRaw * STORE_PROFIT_MARGIN;

      // 4. Payout Calculations
      const totalCashCollectedRaw = totalWalletTopUpCashCollectedRaw;
      const storePayoutRaw =
        storeProfitRaw + storeFixedValueRaw - totalCashCollectedRaw;

      // 5. Platform Metrics
      const platformProfitRaw =
        grossMarginRaw - (storeProfitRaw + totalPlatformFeeRaw);

      // const platformProfitRaw =
      // totalCustomerPaidRaw - (storeProfitRaw + storeFixedValueRaw);
      const platformCommisionRaw = platformProfitRaw + totalSubsidyRaw;

      // --- Round to the nearest cent ONLY here, on the final output values ---

      // --- Debug logs, mirrored from tests/test-payout.js ---
      // Values here are in cents, so we convert to dollars (/100) for display,
      // same as the test script's dollar-denominated console output.
      const d = (cents: number) => (cents / 100).toFixed(2);

      console.log("--- Order Financials Tester ---");

      console.log("\n--- Tax & Markup Breakdown ---");
      console.log(
        `Total Tax = ${d(totalGSTRaw)} (GST) + ${d(totalPSTRaw)} (PST) = $${d(totalTaxRaw)}`,
      );

      console.log(
        `Total Markup = ${d(totalCustomerPaidRaw)} (Cart Total) - [${d(totalBasePriceRaw)} (Base Price) + ${d(totalDisposableFeeRaw)} (Disposable Fee) + ${d(totalTaxRaw)} (Total Tax)] = $${d(totalMarkupRaw)}`,
      );

      console.log("\n--- Value (Val) Metrics ---");
      console.log(
        `Val = ${d(totalBasePriceRaw)} (Base Price) + ${d(totalMarkupRaw)} (Total Markup) = ${d(valRaw)}`,
      );

      console.log(
        `Base % = ${(basePercent * 100).toFixed(2)}% | Markup % = ${(markupPercent * 100).toFixed(2)}%`,
      );

      console.log(
        `Base Tax = $${d(baseTaxRaw)} | Markup Tax = $${d(markupTaxRaw)}`,
      );

      console.log("\n--- Store Metrics ---");
      console.log(
        `SFV = ${d(totalBasePriceRaw)} (base price) + ${d(totalDisposableFeeRaw)} (disposable fee) + ${d(baseTaxRaw)} (base tax) + ${d(storeMarkupTaxRaw)} (store markup tax) = $${d(storeFixedValueRaw)}`,
      );

      console.log(
        `Gross Margin = ${d(totalCustomerPaidRaw)} (Cart Total) - ${d(storeFixedValueRaw)} (SFV) = $${d(grossMarginRaw)}`,
      );

      console.log(
        `Store Profit (50%) = ${d(grossMarginRaw)} (Gross Margin) * 0.50 = $${d(storeProfitRaw)}`,
      );

      console.log(
        `Store Payout = ${d(storeProfitRaw)} (Store Profit) + ${d(storeFixedValueRaw)} (SFV) - ${d(totalCashCollectedRaw)} (Cash Collected) = $${d(storePayoutRaw)}`,
      );

      console.log("\n--- Platform Metrics ---");
      console.log(
        `Platform Profit = ${d(totalCustomerPaidRaw)} (Cart Total) - [${d(storeProfitRaw)} (Store Profit) + ${d(storeFixedValueRaw)} (SFV)] = $${d(platformProfitRaw)}`,
      );

      console.log(
        `Platform Commission = ${d(platformProfitRaw)} (Platform Profit) + ${d(totalSubsidyRaw)} (Subsidy) = $${d(platformCommisionRaw)}`,
      );

      // Verification
      console.log(`\n--- Verification ---`);

      const customerPaidCalc =
        platformProfitRaw + storePayoutRaw + totalCashCollectedRaw;

      console.log(
        `Customer Paid Check: ${d(customerPaidCalc)} vs ${d(totalCustomerPaidRaw)}`,
      );

      console.log(
        `Percentage Split Verification: ${((basePercent + markupPercent) * 100).toFixed(2)}%`,
      );

      const effectiveTaxRate = valRaw > 0 ? totalTaxRaw / valRaw : 0;
      const taxOnBasePrice = totalBasePriceRaw * effectiveTaxRate;

      console.log(
        `Tax Verification Check: ${d(taxOnBasePrice)} vs ${d(baseTaxRaw)}`,
      );

      console.log("Total platform fee: ", totalPlatformFeeRaw);
      console.log(
        "Total Customer paid before platform fee: ",
        totalCustomerPaidRaw,
      );
      console.log(
        "Total platform profit before platform fee: ",
        platformProfitRaw,
      );
      console.log("Store Profit: ", storeProfitRaw);

      console.log("Platform fee: ", totalPlatformFeeRaw);

      return {
        _id: storeKey === "global" ? null : storeKey,
        orderCount: receipt.orderCount,
        totalPlatformFee: round_(totalPlatformFeeRaw),
        orderIds: receipt.orderIds.map((id) => id.toString()),
        totalCustomerPaid: round_(totalCustomerPaidRaw + totalPlatformFeeRaw),
        totalBasePrice: round_(totalBasePriceRaw),
        totalDisposableFee: round_(totalDisposableFeeRaw),
        totalGST: round_(totalGSTRaw),
        totalPST: round_(totalPSTRaw),
        totalTax: round_(totalTaxRaw),
        totalSubsidy: round_(totalSubsidyRaw),
        baseTax: round_(baseTaxRaw),
        markupTax: round_(markupTaxRaw),
        platformMarkupGSTTax: round_(platformMarkupGSTTaxRaw),
        platformMarkupPSTTax: round_(platformMarkupPSTTaxRaw),
        storebasetaxGST: round_(storebasetaxGSTRaw),
        storebasetaxPST: round_(storebasetaxPSTRaw),
        storeMarkupTax: round_(storeMarkupTaxRaw),
        platformMarkuptax: round_(platformMarkuptaxRaw),
        storeFixedValue: round_(storeFixedValueRaw),
        grossMargin: round_(grossMarginRaw),
        storeProfit: round_(dbStoreProfitRaw),
        storePayout: round_(storePayoutRaw),
        platformProfit: round_(dbPlatformProfitRaw),
        platformCommision: round_(platformCommisionRaw),
        totalWalletTopUpCashCollected: round_(totalWalletTopUpCashCollectedRaw),
        totalCashCollected: round_(totalCashCollectedRaw),
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
