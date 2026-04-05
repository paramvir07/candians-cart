"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import { Cashier } from "@/db/models/cashier/cashier.model";
import Customer from "@/db/models/customer/customer.model";
import { walletTopUpZodSchema } from "@/zod/schemas/cashier/cashierTopUpSchema";
import { zodErrorResponse } from "@/zod/validation/error";
import mongoose from "mongoose";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";

export const walletTopUpAction = async (
  customerId: string,
  paymentMode: "cash" | "card" | "gift",
  value: number,
  userRole: "admin" | "cashier",
): Promise<{
  success: boolean;
  message: string;
}> => {
  const adminRole = userRole === "admin";
  const cashierRole = userRole === "cashier";

  let session: mongoose.ClientSession | null = null;

  try {
    // ✅ Zod validation
    const result = walletTopUpZodSchema.safeParse({
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
    
    let userId;

    if (cashierRole) {
      const cashier = await Cashier.findOne({ userId: userData.user.id })
        .lean()
        .select("_id");
      userId = cashier?._id;
    } else if (adminRole) {
      userId = userData.user.id;
    }

    if (!userId) {
      return { success: false, message: "Authenticated User not found" };
    }

    // ✅ Transaction start
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await WalletTopUp.create(
        [
          {
            userId,
            userRole,
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
