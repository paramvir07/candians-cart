import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { CloverTopUpAttempt } from "@/db/models/cashier/cloverTopUpAttempt.model";
import { getTopUpActorFromRequest } from "@/lib/wallet/top-up-auth";
import {
  CloverRequestError,
  getCloverPaymentByExternalId,
  isSuccessfulCloverPayment,
  showCloverWelcomeScreen,
  startCloverPayment,
} from "@/lib/clover/clover.client";
import { completeCloverWalletTopUp } from "@/lib/wallet/complete-clover-top-up";
import { ReloadCartpusher } from "@/actions/pusher/pusherAction";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const requestSchema = z.object({
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  amount: z.number().int().positive().max(999_999_999),
  externalPaymentId: z
    .string()
    .min(13)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/),
});

const notifyWalletChange = async (
  customerId: string,
  authUserId: string,
) => {
  await ReloadCartpusher("Wallet topped up successfully!!");
  revalidatePath(`/cashier/customer/${customerId}/wallet`);
  revalidatePath(`/cashier/customer/${authUserId}/wallet`);
};

const tryReconcile = async ({
  externalPaymentId,
  amount,
  customerId,
  authUserId,
}: {
  externalPaymentId: string;
  amount: number;
  customerId: string;
  authUserId: string;
}) => {
  try {
    const retrieved = await getCloverPaymentByExternalId(externalPaymentId);
    if (!isSuccessfulCloverPayment(retrieved, amount)) return null;

    const completed = await completeCloverWalletTopUp({
      externalPaymentId,
      payment: retrieved.payment,
    });

    if (completed.newlyCompleted) {
      await notifyWalletChange(customerId, authUserId);
    }

    return completed;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const actor = await getTopUpActorFromRequest(request);
  if (!actor) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid Clover top-up request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { customerId, amount, externalPaymentId } = parsed.data;
  await dbConnect();

  const customerExists = await Customer.exists({ _id: customerId });
  if (!customerExists) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }

  let attempt = await CloverTopUpAttempt.findOne({ externalPaymentId });
  const isNewAttempt = !attempt;

  if (!attempt) {
    attempt = await CloverTopUpAttempt.create({
      customerId,
      initiatedByAuthUserId: actor.authUserId,
      userId: actor.userId,
      userRole: actor.userRole,
      amount,
      externalPaymentId,
      status: "pending",
    });
  } else if (
    String(attempt.customerId) !== customerId ||
    attempt.amount !== amount
  ) {
    return NextResponse.json(
      { message: "This payment attempt ID belongs to a different top-up" },
      { status: 409 },
    );
  }

  if (attempt.status === "completed") {
    return NextResponse.json({
      success: true,
      status: "completed",
      message: "Wallet was already topped up for this Clover payment.",
      externalPaymentId,
    });
  }

  if (!isNewAttempt && ["processing", "unknown", "crediting"].includes(attempt.status)) {
    const reconciled = await tryReconcile({
      externalPaymentId,
      amount,
      customerId,
      authUserId: actor.authUserId,
    });

    if (reconciled) {
      return NextResponse.json({
        success: true,
        status: "completed",
        message: "Card payment confirmed and wallet topped up.",
        externalPaymentId,
      });
    }
  }

  if (attempt.status === "failed") {
    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message:
          attempt.failureMessage ||
          "This Clover top-up attempt failed. Start a new payment.",
        externalPaymentId,
      },
      { status: 409 },
    );
  }

  attempt.status = "processing";
  attempt.failureCode = undefined;
  attempt.failureMessage = undefined;
  await attempt.save();

  try {
    const response = await startCloverPayment({ amount, externalPaymentId });

    if (!isSuccessfulCloverPayment(response, amount)) {
      attempt.status = "unknown";
      attempt.cloverPaymentId = response.payment?.id;
      attempt.cloverResult = response.payment?.result;
      attempt.cloverCardState = response.payment?.cardTransaction?.state;
      attempt.failureMessage = "Clover returned an unexpected payment state";
      await attempt.save();

      return NextResponse.json(
        {
          success: false,
          status: "unknown",
          message:
            "Clover responded, but the completed payment could not be verified. Do not run another card payment yet.",
          externalPaymentId,
        },
        { status: 502 },
      );
    }

    const completed = await completeCloverWalletTopUp({
      externalPaymentId,
      payment: response.payment,
    });

    if (completed.newlyCompleted) {
      await notifyWalletChange(customerId, actor.authUserId);
    }

    await showCloverWelcomeScreen();

    return NextResponse.json({
      success: true,
      status: "completed",
      message: "Card payment successful. Wallet topped up.",
      externalPaymentId,
      paymentId: response.payment.id,
    });
  } catch (error) {
    const reconciled = await tryReconcile({
      externalPaymentId,
      amount,
      customerId,
      authUserId: actor.authUserId,
    });

    if (reconciled) {
      await showCloverWelcomeScreen();
      return NextResponse.json({
        success: true,
        status: "completed",
        message: "Card payment confirmed and wallet topped up.",
        externalPaymentId,
      });
    }

    const definiteFailure =
      error instanceof CloverRequestError &&
      [209, 400, 401, 415, 501, 503].includes(error.status);
    const uncertainStatus = !definiteFailure;

    attempt.status = uncertainStatus ? "unknown" : "failed";
    attempt.failureCode =
      error instanceof CloverRequestError ? String(error.status) : "request_error";
    attempt.failureMessage =
      error instanceof Error ? error.message : "Clover payment failed";
    await attempt.save();

    return NextResponse.json(
      {
        success: false,
        status: attempt.status,
        message: uncertainStatus
          ? "The Clover payment status is uncertain. Do not charge the card again until the status is checked."
          : attempt.failureMessage,
        externalPaymentId,
        details:
          error instanceof CloverRequestError ? error.payload : undefined,
      },
      { status: uncertainStatus ? 502 : 400 },
    );
  }
}
