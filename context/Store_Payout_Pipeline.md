# Store Payout Pipeline (Calculations & Receipts)

This document outlines how **Candian Cart** manages the financial relationship between the platform and the individual stores. Because Candian Cart acts as the central marketplace, customer payments are collected centrally. The Payout Pipeline is responsible for calculating owed balances and generating official documentation (receipts) for store settlements.

## 1. The Payout Ledger (`storePayouts.model.ts`)

To maintain a strict financial audit trail, payouts are not just raw transfers; they are formalized documents stored in the database. Each payout record defines exactly how much was paid, for what period, and links to an immutable PDF receipt.

**Rule:** Payout records are historically immutable once set to `paid`.

```ts
// db/models/admin/storePayouts.model.ts (Conceptual Schema)
import mongoose, { Schema, Types } from "mongoose";

export interface IStorePayoutDB {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  totalOrders: number;
  totalAmountOwed: number; // Stored in cents
  status: "pending" | "processing" | "paid";
  receiptUrl?: string; // Link to the generated PDF
  receiptFileId?: string;
  createdAt: Date;
}

const StorePayoutSchema = new Schema<IStorePayoutDB>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    totalOrders: { type: Number, required: true },
    totalAmountOwed: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "paid"],
      default: "pending",
    },
    receiptUrl: { type: String },
    receiptFileId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.StorePayout ||
  mongoose.model("StorePayout", StorePayoutSchema);
```

## 2. Calculating Balances & Triggering Payouts (`trigger-payouts/route.ts`)

While the platform has cron jobs for automated scheduling, admins heavily rely on the manual trigger route to initiate out-of-cycle payouts or resolve balances.

The core logic requires aggregating all `paid` orders for a specific store within a requested timeframe.

**Rule of Idempotency:** The calculation logic must be safe to run multiple times. It should check if a payout already exists for the given period to prevent double-paying a store.

```ts
// app/api/admin/trigger-payouts/route.ts
import { NextResponse } from "next/server";
import Order from "@/db/models/customer/Orders.Model";
import StorePayout from "@/db/models/admin/storePayouts.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin")
      return new NextResponse("Unauthorized", { status: 403 });

    const { storeId, periodStart, periodEnd } = await req.json();

    // 1. Prevent Double-Payouts
    const existingPayout = await StorePayout.findOne({
      storeId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
    });
    if (existingPayout)
      return NextResponse.json({
        error: "Payout already generated for this period",
      });

    // 2. Aggregate Owed Balances
    const orders = await Order.find({
      storeId,
      paymentStatus: "paid",
      createdAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    }).lean();

    const totalOrders = orders.length;
    const totalAmountOwed = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    return NextResponse.json({
      success: true,
      data: { totalOrders, totalAmountOwed }, // Sent to next phase for receipt generation
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate payout" },
      { status: 500 },
    );
  }
}
```

## 3. PDF Receipt Generation (`generateReciept.ts`)

For tax and accounting purposes, both the Admin and the Store owner need a physical/digital paper trail. Once the calculation is complete, a Server Action generates a PDF containing a breakdown of the payout.

```ts
// actions/admin/reciept/generateReciept.ts
"use server";

import { generatePdfBuffer } from "@/lib/pdfGenerator"; // Abstracted PDF utility (e.g., pdfmake, puppeteer)

export const generatePayoutReceipt = async (payoutData: any) => {
  try {
    // Generates the PDF buffer containing the store details, period, and total amount
    const pdfBuffer = await generatePdfBuffer({
      title: "Store Settlement Receipt",
      storeName: payoutData.storeName,
      period: `${payoutData.periodStart} to ${payoutData.periodEnd}`,
      totalOwed: payoutData.totalAmountOwed,
      orderCount: payoutData.totalOrders,
    });

    // Note: In reality, this buffer is then uploaded to a storage provider (like AWS S3 or ImageKit)
    // to get a permanent URL before saving to the DB.

    return { success: true, pdfBuffer };
  } catch (error) {
    console.error("PDF Generation failed:", error);
    return { success: false, error: "Could not generate receipt" };
  }
};
```

## 4. Finalizing the Ledger (`saveStorePayout.ts`)

The final step in the pipeline. After the balances are calculated and the PDF receipt is generated (and uploaded), the official record is committed to the database.

```ts
// actions/admin/reciept/saveStorePayout.ts
"use server";

import StorePayout from "@/db/models/admin/storePayouts.model";

interface SavePayoutArgs {
  storeId: string;
  periodStart: Date;
  periodEnd: Date;
  totalOrders: number;
  totalAmountOwed: number;
  receiptUrl: string;
  receiptFileId: string;
}

export const saveStorePayout = async (data: SavePayoutArgs) => {
  try {
    const newPayout = await StorePayout.create({
      storeId: data.storeId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      totalOrders: data.totalOrders,
      totalAmountOwed: data.totalAmountOwed,
      status: "paid", // Marking as finalized
      receiptUrl: data.receiptUrl,
      receiptFileId: data.receiptFileId,
    });

    return {
      success: true,
      payoutId: newPayout._id.toString(),
    };
  } catch (error) {
    return { success: false, error: "Failed to save payout record to ledger" };
  }
};
```
