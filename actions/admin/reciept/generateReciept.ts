"use server";
/*
Orders Model has the following data -:

TotalGST, TotalPST We can get Total Tax (T.GST + T.PST) from here
cartTotal is the total amount of money the customer paid (CP)
subsidy (If any)

TotalDisposableFee is total amt of fee (If any)
BaseTotal is the sum of all product's base price

Then we can calculate totalMarkup(in cents) with this formula

Customer Paid = (Base Price + Total Markup + Tax + DisposableFee) - subsidy

Then we calculate Store Fix Value (This is the store direct cost) per order or we can find a quick way to calc this

SFV = Total Base Price + Total Disposable Fee + Total Tax

then what we are left with will be
grossMargin = Customer Paid - SFV

then we will give the store its 30% profit from grossMargin, so Store Payout is
Store Payout = SFV + 0.30(grossMargin) 

and then we will be left with platformProfit, CP - SP

For example (All in cents) -:

Milk 1 bottle
BP = 249
markup = 30%
disposableFee = 10
total tax = 0

So 8 Milk bottles becomes
BP = 1992, Total markup = 600, Disposablefee = 80, total tax = 0
Since the total Product price is now more than 2100 cents ($21) we give customer subsidy of 315 cents ($3.15) {Our business logic}

(We might need ot calc Total Markup since we are not storing that in Orders model)

Customer paid = (Base Price + Total Markup + Tax + DisposableFee) - subsidy
Customer Paid = 2357

SFV = BP + Total Disposable Fee + Total tax
SFV = 2072

grossMargin = CP - SFV = 285 (Our cost)

Store Profit = grossMargin * 0.30 = 85 cents

Store Payout = Store Profit + SFV = 2157

Our Profit = CP - SP = 200 (platformProfit)

Verify -:
Our Profit + Store Payout = Customer Paid
200 + 2157 = 2357

---



.........................................................new logic ..................................................

Customer paid = [Cart total]
Customer Paid = 2357

SFV = BP + Total Disposable Fee + Total tax
SFV = 2072

grossMargin = CP - SFV = 285 (Our cost)

the 0.30 or 30% Value can be changed in future.
Store Profit = (grossMargin + [subsidy] )) * 0.30 = 85 cents

totalCashCollected = Topup Cash Collectedv(If any) + Order Cash Collected

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
