"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";
import WalletPayment from "@/db/models/customer/WalletPayment.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";

export const getWalletTopUpHistory = async (recievedCustomerId?: string) => {
  try {
    const session = await getUserSession();
    await dbConnect();
    let customerId;
    if (session.user.role === "cashier") {
      customerId = recievedCustomerId;
    } else {
      const customer = await Customer.findOne({ userId: session.user.id })
        .select("_id")
        .lean();
      customerId = customer?._id;
    }

    if (!customerId)
      return {
        success: false,
        message: "Customer not found",
      };

    const stripeTopUpHistory = await WalletPayment.find({
      userId: customerId,
    }).lean();
    if (!stripeTopUpHistory)
      return {
        success: false,
        message: "Stripe Top up history not found",
      };
    const walletTopUpHistory = await WalletTopUp.find({
      customerId: customerId,
    }).lean();

    if (!walletTopUpHistory)
      return {
        success: false,
        message: "Store Top up history not found",
      };
    const serializedStripeTopUpHistory = JSON.parse(
      JSON.stringify(stripeTopUpHistory),
    );
    const serializedWalletTopUpHistory = JSON.parse(
      JSON.stringify(walletTopUpHistory),
    );
    return {
      success: true,
      message: "Fetched wallet top up history successfully!!",
      walletTopUpHistory: {
        stripeTopUps: serializedStripeTopUpHistory,
        walletTopUps: serializedWalletTopUpHistory,
      },
    };
  } catch (error) {
    console.log("Error while fetching wallet top up history: ", error);
    return {
      success: false,
      message: "Something went wrongwhile fetching wallet top up history",
    };
  }
};
