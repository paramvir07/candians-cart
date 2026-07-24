"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";
import { walletTopUpZodSchema } from "@/zod/schemas/cashier/cashierTopUpSchema";
import { zodErrorResponse } from "@/zod/validation/error";
import mongoose from "mongoose";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import { revalidatePath } from "next/cache";
import { ReloadCartpusher } from "../pusher/pusherAction";
import { resolveTopUpActor } from "@/lib/wallet/top-up-auth";

export const walletTopUpAction = async (
  customerId: string,
  paymentMode: "cash" | "card" | "gift" | "referral",
  value: number,
  cashReceived: number,
  cashDue: number,
): Promise<{ success: boolean; message: string }> => {
  let mongoSession: mongoose.ClientSession | null = null;

  try {
    const result = walletTopUpZodSchema.safeParse({
      customerId,
      paymentMode,
      value,
      cashReceived,
      cashDue,
    });

    if (!result.success) {
      return {
        success: false,
        message: zodErrorResponse(result) || "Validation error",
      };
    }

    if (result.data.paymentMode === "card") {
      return {
        success: false,
        message: "Card top-ups must be completed on the Clover terminal.",
      };
    }

    const userData = await getUserSession();
    const actor = await resolveTopUpActor({
      id: userData.user.id,
      role: (userData.user as { role?: string }).role,
    });

    if (
      actor.userRole === "admin" &&
      !["gift", "referral"].includes(result.data.paymentMode)
    ) {
      return {
        success: false,
        message: "Admin top-ups must use gift or referral mode.",
      };
    }

    await dbConnect();
    mongoSession = await mongoose.startSession();

    await mongoSession.withTransaction(async () => {
      await WalletTopUp.create(
        [
          {
            userId: actor.userId,
            userRole: actor.userRole,
            customerId: result.data.customerId,
            paymentMode: result.data.paymentMode,
            cashPaid:
              result.data.paymentMode === "cash" ? result.data.cashReceived : 0,
            cashDue:
              result.data.paymentMode === "cash" ? result.data.cashDue : 0,
            value: result.data.value,
            paymentStatus: "completed",
          },
        ],
        { session: mongoSession },
      );

      const updatedCustomer = await Customer.findByIdAndUpdate(
        result.data.customerId,
        { $inc: { walletBalance: result.data.value } },
        { session: mongoSession, new: true },
      );

      if (!updatedCustomer) throw new Error("Customer not found");
    });

    await ReloadCartpusher("Wallet topped up successfully!!");
    revalidatePath(`/cashier/customer/${customerId}/wallet`);
    revalidatePath(`/cashier/customer/${userData.user.id}/wallet`);

    return { success: true, message: "Wallet topped up successfully!!" };
  } catch (error) {
    console.error("Error while topping up customer's wallet:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  } finally {
    if (mongoSession) await mongoSession.endSession();
  }
};
