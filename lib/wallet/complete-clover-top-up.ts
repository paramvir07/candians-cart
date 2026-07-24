import mongoose from "mongoose";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import { CloverTopUpAttempt } from "@/db/models/cashier/cloverTopUpAttempt.model";
import type { CloverPayment } from "@/lib/clover/clover.client";

export interface CompleteCloverTopUpResult {
  success: true;
  newlyCompleted: boolean;
  walletTopUpId: string;
}

export const completeCloverWalletTopUp = async ({
  externalPaymentId,
  payment,
}: {
  externalPaymentId: string;
  payment: CloverPayment;
}): Promise<CompleteCloverTopUpResult> => {
  if (!payment.id) throw new Error("Clover payment ID is missing");

  await dbConnect();
  const session = await mongoose.startSession();
  let result: CompleteCloverTopUpResult | null = null;

  try {
    await session.withTransaction(async () => {
      const attempt = await CloverTopUpAttempt.findOne({ externalPaymentId })
        .session(session)
        .exec();

      if (!attempt) throw new Error("Clover top-up attempt was not found");

      if (payment.amount !== attempt.amount) {
        throw new Error("Clover payment amount does not match the wallet top-up");
      }

      if (attempt.status === "completed" && attempt.walletTopUpId) {
        result = {
          success: true,
          newlyCompleted: false,
          walletTopUpId: String(attempt.walletTopUpId),
        };
        return;
      }

      const existingWalletTopUp = await WalletTopUp.findOne({
        cloverExternalPaymentId: externalPaymentId,
      })
        .session(session)
        .exec();

      if (existingWalletTopUp) {
        attempt.status = "completed";
        attempt.cloverPaymentId = payment.id;
        attempt.walletTopUpId = existingWalletTopUp._id;
        attempt.completedAt = attempt.completedAt ?? new Date();
        await attempt.save({ session });

        result = {
          success: true,
          newlyCompleted: false,
          walletTopUpId: String(existingWalletTopUp._id),
        };
        return;
      }

      attempt.status = "crediting";
      await attempt.save({ session });

      const [walletTopUp] = await WalletTopUp.create(
        [
          {
            customerId: attempt.customerId,
            userId: attempt.userId,
            userRole: attempt.userRole,
            value: attempt.amount,
            cashPaid: 0,
            cashDue: 0,
            paymentMode: "card",
            paymentStatus: "completed",
            cloverPaymentId: payment.id,
            cloverExternalPaymentId: externalPaymentId,
            cloverCardType: payment.cardTransaction?.cardType,
            cloverCardLast4: payment.cardTransaction?.last4,
            cloverReferenceId: payment.cardTransaction?.referenceId,
            cloverTransactionNo: payment.cardTransaction?.transactionNo,
          },
        ],
        { session },
      );

      const customer = await Customer.findByIdAndUpdate(
        attempt.customerId,
        { $inc: { walletBalance: attempt.amount } },
        { session, new: true },
      );

      if (!customer) throw new Error("Customer not found");

      attempt.status = "completed";
      attempt.cloverPaymentId = payment.id;
      attempt.cloverResult = payment.result;
      attempt.cloverCardState = payment.cardTransaction?.state;
      attempt.cloverCardType = payment.cardTransaction?.cardType;
      attempt.cloverCardLast4 = payment.cardTransaction?.last4;
      attempt.walletTopUpId = walletTopUp._id;
      attempt.completedAt = new Date();
      attempt.failureCode = undefined;
      attempt.failureMessage = undefined;
      await attempt.save({ session });

      result = {
        success: true,
        newlyCompleted: true,
        walletTopUpId: String(walletTopUp._id),
      };
    });

    if (!result) throw new Error("Wallet top-up transaction did not complete");
    return result;
  } finally {
    await session.endSession();
  }
};
