"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import { CashierTopUp } from "@/db/models/cashier/cashierTopUp.model";
import { Cashier } from "@/db/models/cashier/cashier.model";
import Customer from "@/db/models/customer/customer.model";
import { cashierTopUpZodSchema } from "@/zod/schemas/cashier/cashierTopUpSchema";
import { zodErrorResponse } from "@/zod/validation/error";
import mongoose from "mongoose";

export const cashierTopUpAction = async (
  customerId: string,
  paymentMode: "cash" | "card",
  value: number,
): Promise<{
    success: boolean;
    message: string;
}> => {
  let session: mongoose.ClientSession | null = null;

  try {
    // ✅ Zod validation
    const result = cashierTopUpZodSchema.safeParse({
      customerId,
      paymentMode,
      value,
    });

    if (!result.success) {
      const errorMessage = zodErrorResponse(result);
      return { success: false, message: errorMessage || "Validation error" };
    }

    const data = result.data;

    const userData = await getUserSession();
    await dbConnect();

    const cashier = await Cashier.findOne({ userId: userData.user.id })
      .lean()
      .select("_id");

    if (!cashier) {
      return { success: false, message: "Cashier not found" };
    }

    // ✅ Transaction start
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await CashierTopUp.create(
        [
          {
            cashierId: cashier._id,
            customerId: data.customerId,
            paymentMode: data.paymentMode,
            value: data.value,
          },
        ],
        { session },
      );

      const updatedCustomer = await Customer.findByIdAndUpdate(
        data.customerId,
        { $inc: { walletBalance: data.value } },
        { session, returnDocument: "after" },
      );

      if (!updatedCustomer) {
        // causes transaction to abort
        throw new Error("Customer not found");
      }
    });

    return { success: true, message: "Wallet topped up successfully!!" };
  } catch (error) {
    console.log("Error while topping up customer's wallet: ", error);

    // if transaction throws, it’s already aborted automatically by withTransaction
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  } finally {
    if (session) session.endSession();
  }
};

export const getCashierTopUpHistoryAction = async () => {
  const userData = await getUserSession();
  await dbConnect();
  try {
    const customer = await Customer.findOne({ userId: userData.user.id })
      .lean()
      .select("_id");
    if (!customer)
      return {
        success: false,
        message: "Customer not found",
      };

    const cashierTopUpHistory = await CashierTopUp.find({
      customerId: customer._id,
    }).lean();

    const serializedCashierTopUpHistory = JSON.parse(
      JSON.stringify(cashierTopUpHistory),
    );

    return {
      success: true,
      cashierTopUpHistory: serializedCashierTopUpHistory,
    };
  } catch (error) {
    console.log("Error while getting customer's top up history: ", error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};
