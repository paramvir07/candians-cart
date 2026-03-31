"use server";
/*
.........................................................new logic ..................................................

Customer paid = [Cart total]
Customer Paid (CP) = 2357

--- Calculating Markup
Total Markup = Cart Total - (Total Base Price + Total Disposable Fee + Total Tax)

Now Note that the Total tax we are getting uptill this point is calc. based on the base price and the markup. So this isnt the real Tax.
The tax the store gets has to be based on markup.

Val = Total Base Price + Total Markup
now from this Val we can calculate how much is % is Base Price and how much is Total Markup
eg -: Base Price = 100 | Total Markup = 30, so Val becomes 130;
So Base in percentage = (Total Base / Val) * 100 | Markup in percentage = (Total Markup / Val) * 100
Base in percentage = 76.92%
Markup in percentage = 23.07%

Verify (Sum of both should be 100%)

So total Tax 23.07% is Markup Tax

now 30 % of Markup tax is gonna go to Store {$1.50}

and tax on Base Price 76.92 will also go to Store

Store Fixed Value (SFV) = Total Base Price + Total Disposable Fee + Markup tax + Base tax
SFV = 2072

grossMargin = Customer Paid - SFV = 285 (Our cost)

the 0.30 or 30% Value can be changed in future.
Store Profit = (grossMargin + [subsidy]) * 0.30 = 85 cents

totalCashCollected = Topup Cash Collected (If any) + Order Cash Collected

Store Payout = (Store Profit + SFV) - totalCashCollected = 2157

--- New, PlatformProfit, Not taking totalCashCollected
Our Profit = CP - (Store Profit + SFV)

[platform commission = our profit  + subsidy (for store reciept) ]

Verify -:
Our Profit + Store Payout = Customer Paid
200 + 2157 = 2357

*/

import mongoose, { PipelineStage, Types } from "mongoose";
import OrderModel, { PlaceOrderI } from "@/db/models/customer/Orders.Model";
import {
  WalletTopUp,
  IWalletTopUp,
} from "@/db/models/cashier/walletTopUp.model";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export interface GetRecieptParams {
  startDate: Date;
  endDate: Date;
  storeId?: string | Types.ObjectId; // If storeIf then "How much i need to pay the store", If !storeId then "How much the whole platform made this month"
  status?: PlaceOrderI["status"];
  /*
  Status -:
  We will NOT take 
  pending (incomplete)
  refunded (because the amount has left the store and platform)

  We will take
    completed
  */
}

export interface AggregatedReciept {
  _id: string | null;
  orderCount: number;
  totalCustomerPaid: number; // sum of individual cart totals
  totalBasePrice: number;
  totalDisposableFee: number;
  totalGST: number;
  totalPST: number;
  totalTax: number; // totalGST + totalPST
  totalSubsidy: number;
  storeFixedValue: number;
  grossMargin: number; // Customer Paid - SFV
  storeProfit: number;
  storePayout: number;
  platformProfit: number; // Our profit
  platformCommision: number;
  totalWalletTopUpCashCollected: number;
  totalOrderCashCollected: number;
  totalCashCollected: number;
}

type OrderAggregateResult = Omit<
  AggregatedReciept,
  | "storePayout"
  | "platformProfit"
  | "platformCommision"
  | "totalWalletTopUpCashCollected"
  | "totalCashCollected"
>;

export async function getRecieptDataByDateRange(
  params: GetRecieptParams,
  // only take orders with the status completed
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

    const orderPipeline: PipelineStage[] = [
      matchStage,
      // Adding up raw totals
      {
        $group: {
          _id: storeId ? "$storeId" : null, // Group by storeId or null for global sum
          orderCount: { $sum: 1 },
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

      // Derive base calculated metrics
      {
        $addFields: {
          totalTax: { $add: ["$totalGST", "$totalPST"] },
          storeFixedValue: {
            $add: [
              "$totalBasePrice",
              "$totalDisposableFee",
              { $add: ["$totalGST", "$totalPST"] },
            ],
          },
        },
      },

      //   calc Markup and grossMargin | Markup = (Customer Paid - Base Price - Tax - DisposableFee) + subsidy
      {
        $addFields: {
          grossMargin: {
            $subtract: ["$totalCustomerPaid", "$storeFixedValue"],
          },
        },
      },
      // Deriving Store profit, giving 30%
      {
        $addFields: {
          storeProfit: {
            $round: [
              {
                $multiply: [{ $add: ["$grossMargin", "$totalSubsidy"] }, 0.3],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    // Also adding wallet topup cash collected in the total cash collected
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

    // BEST PRACTICE: Run completely independent operations concurrently
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

    // BEST PRACTICE: O(1) Map Lookup for merging results (instead of `.find()` in a loop)
    const topUpMap = new Map(
      topUpsRaw.map((topUp) => [
        topUp._id ? topUp._id.toString() : "global",
        topUp.totalWalletTopUpCashCollected,
      ]),
    );

    return receiptsRaw.map((receipt) => {
      const storeKey = receipt._id ? receipt._id.toString() : "global";
      const totalWalletTopUpCashCollected = topUpMap.get(storeKey) || 0;

      // 1. Calculate Combined Total Cash
      const totalCashCollected =
        receipt.totalOrderCashCollected + totalWalletTopUpCashCollected;

      // 2. Calculate Final Store Payout
      const storePayout =
        receipt.storeFixedValue + receipt.storeProfit - totalCashCollected;

      // 3. Calculate Platform Profit & Commisions
      const platformProfit =
        receipt.totalCustomerPaid -
        (receipt.storeProfit + receipt.storeFixedValue);
      const platformCommision = platformProfit + receipt.totalSubsidy;

      return {
        ...receipt,
        _id: receipt._id ? receipt._id.toString() : null,
        totalWalletTopUpCashCollected,
        totalCashCollected,
        storePayout,
        platformProfit,
        platformCommision,
      };
    }) as AggregatedReciept[];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[getReceiptDataByDateRange] Database error:", errorMessage);
    throw new Error(
      "Failed to fetch aggregate receipt data for the specified date range.",
    );
  }
}
