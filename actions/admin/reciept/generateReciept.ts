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

Store Payout = Store Profit + SFV = 2157

Our Profit = CP - SP(store payout) = 200 (platformProfit)

[platform commission = our profit  + subsidy (for store reciept) ]

Verify -:
Our Profit + Store Payout = Customer Paid
200 + 2157 = 2357

*/

import mongoose, { PipelineStage, Types } from "mongoose";
import OrderModel, { PlaceOrderI } from "@/db/models/customer/Orders.Model";
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
  _id: Types.ObjectId | null;
  orderCount: number;
  totalCustomerPaid: number; // sum of individual cart totals
  totalBasePrice: number;
  totalDisposableFee: number;
  totalGST: number;
  totalPST: number;
  totalTax: number; // totalGST + totalPST
  totalSubsidy: number;
  totalMarkup: number;
  storeFixedValue: number;
  grossMargin: number; // Customer Paid - SFV
  storeProfit: number;
  storePayout: number;
  platformProfit: number; // Our profit
}

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

    if (storeId) {
      matchStage.$match.storeId =
        typeof storeId === "string"
          ? new mongoose.Types.ObjectId(storeId)
          : storeId;
    }

    const pipeline: PipelineStage[] = [
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
          totalMarkup: {
            $add: [
              {
                $subtract: [
                  "$totalCustomerPaid",
                  {
                    $add: [
                      "$totalBasePrice",
                      "$totalTax",
                      "$totalDisposableFee",
                    ],
                  },
                ],
              },
              "$totalSubsidy",
            ],
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
      // Final payout
      {
        $addFields: {
          storePayout: { $add: ["$storeFixedValue", "$storeProfit"] },
          platformProfit: {
            $subtract: ["$totalCustomerPaid", "$storePayout"],
          },
          // platform Profit = (Cart Total - Store Payout)
          // [platform commission = platform Profit  + subsidy (for store reciept) ]
          platformCommision: {
            $add: ["$platformProfit", "$subsidy"],
          },
        },
      },

      // Sort if multiple stores
      {
        $sort: { _id: 1 },
      },
    ];

    const receipts =
      await OrderModel.aggregate<AggregatedReciept>(pipeline).exec();

    if (!receipts || receipts.length === 0) {
      throw new Error("No completed orders found for this date range.");
    }

    const serialisedReceipts = JSON.parse(JSON.stringify(receipts));

    return serialisedReceipts;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[getReceiptDataByDateRange] Database error:", errorMessage);
    throw new Error(
      "Failed to fetch aggregate receipt data for the specified date range.",
    );
  }
}
