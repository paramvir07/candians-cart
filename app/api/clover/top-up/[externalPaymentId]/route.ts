import { NextResponse } from "next/server";
import { dbConnect } from "@/db/dbConnect";
import { CloverTopUpAttempt } from "@/db/models/cashier/cloverTopUpAttempt.model";
import { getTopUpActorFromRequest } from "@/lib/wallet/top-up-auth";
import {
  getCloverPaymentByExternalId,
  isSuccessfulCloverPayment,
  showCloverWelcomeScreen,
} from "@/lib/clover/clover.client";
import { completeCloverWalletTopUp } from "@/lib/wallet/complete-clover-top-up";
import { ReloadCartpusher } from "@/actions/pusher/pusherAction";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  request: Request,
  context: { params: Promise<{ externalPaymentId: string }> },
) {
  const actor = await getTopUpActorFromRequest(request);
  if (!actor) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { externalPaymentId } = await context.params;
  if (!/^[A-Za-z0-9_-]{13,32}$/.test(externalPaymentId)) {
    return NextResponse.json(
      { message: "Invalid external payment ID" },
      { status: 400 },
    );
  }

  await dbConnect();
  const attempt = await CloverTopUpAttempt.findOne({ externalPaymentId });
  if (!attempt) {
    return NextResponse.json({ message: "Attempt not found" }, { status: 404 });
  }

  if (attempt.status === "completed") {
    return NextResponse.json({
      success: true,
      status: "completed",
      message: "Wallet top-up is complete.",
      externalPaymentId,
    });
  }

  if (attempt.status === "failed") {
    return NextResponse.json({
      success: false,
      status: "failed",
      message: attempt.failureMessage || "Clover payment failed.",
      externalPaymentId,
    });
  }

  try {
    const response = await getCloverPaymentByExternalId(externalPaymentId);

    if (!isSuccessfulCloverPayment(response, attempt.amount)) {
      return NextResponse.json({
        success: false,
        status: attempt.status,
        message: "The Clover payment is not confirmed as completed yet.",
        externalPaymentId,
      });
    }

    const completed = await completeCloverWalletTopUp({
      externalPaymentId,
      payment: response.payment,
    });

    if (completed.newlyCompleted) {
      await ReloadCartpusher("Wallet topped up successfully!!");
      revalidatePath(`/cashier/customer/${String(attempt.customerId)}/wallet`);
      revalidatePath(`/cashier/customer/${actor.authUserId}/wallet`);
    }

    await showCloverWelcomeScreen();

    return NextResponse.json({
      success: true,
      status: "completed",
      message: "Card payment confirmed. Wallet topped up.",
      externalPaymentId,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: attempt.status,
      message:
        error instanceof Error
          ? error.message
          : "Could not check the Clover payment status",
      externalPaymentId,
    });
  }
}
