import Stripe from "stripe";
import { NextResponse } from "next/server";
import { dbConnect } from "@/db/dbConnect";
import WalletPayment from "@/db/models/customer/WalletPayment.model";
import Customer from "@/db/models/customer/customer.model";
import mongoose from "mongoose";
import { GetUserfromSession } from "@/actions/customer/User.action";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook signature failed", error.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  console.log("EVENT TYPE:", event.type);

  const successfulEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ];

  if (event.type === "payment_intent.succeeded") {
    console.log("PAYMENT INTENT IS SUCCESSFULL");
  }
  if (successfulEvents.includes(event.type)) {
    // Starting stripe session
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata;

    if (!metadata || !metadata.userId || !metadata.requestedAmount) {
      console.error("Missing metadata in session: ", session.id);
      return new NextResponse("Missing session metadata", { status: 400 });
    }

    // Checking if payment happned or not (Ignoring bank transfers delays until paid)
    if (session.payment_status !== "paid") {
      // Telling stripe that message is recieved and we wait for the new webhook to arive (Bank to bank transfer takes 3-5 days)
      console.log(
        `Payment status is ${session.payment_status}, ignoring for now`,
      );
      return new NextResponse("OK", { status: 200 });
    }

    const userId = metadata.userId;

    if (!userId) {
      console.log("No user found for session ID: " + session.metadata?.userId);
      throw new Error(`No user found with the session Metadata: ${userId}`);
    }

    const topUpAmount = parseInt(metadata.requestedAmount, 10);
    const totalAmount = session.amount_total || 0;
    const stripeFee = totalAmount - topUpAmount;

    await dbConnect();

    const UserData = await GetUserfromSession(userId); // Getting mongo _id from auth id
    if (!UserData) {
      return new NextResponse("User not Found ", { status: 400 });
    }

    // Starting mongo session
    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // Check if same payment didnt happned
        const existingPayment = await WalletPayment.findOne({
          stripeEventId: event.id,
        }).session(dbSession);

        if (existingPayment) {
          console.log(`Webhook already processed for event: ${event.id}`);
          return; // Exit without doing anything
        }

        // Check if user exists in DB
        const userExists = await Customer.findById(UserData._id).session(
          dbSession,
        ); // checking this within the session to prevent any lekage
        if (!userExists) {
          throw new Error(`No user found in DB with the auth ID: ${userId}`);
        }

        // creating payment record
        await WalletPayment.create(
          [
            {
              userId: UserData._id, // This here is the Mongo ID NOT AuthID
              stripeEventId: event.id,
              checkoutSessionId: session.id,
              paymentIntentId: session.payment_intent as string,
              amount: session.amount_total || 0,
              topUpAmount: topUpAmount || 0,
              stripeFee: stripeFee || 0,
              currency: session.currency || "cad",
              status: session.payment_status || "pending",
            },
          ],
          { session: dbSession },
        );

        await Customer.findByIdAndUpdate(
          UserData._id,
          { $inc: { walletBalance: topUpAmount } },
          { session: dbSession },
        );

        console.log(
          `Successfully added ${topUpAmount} to user ${userId} wallet`,
        );
      });
    } catch (e: unknown) {
      const error = e as Error;
      console.error("Transaction error: ", error.message);
      return new NextResponse("Internal Server Error", { status: 500 });
    } finally {
      await dbSession.endSession();
    }
  }

  return new NextResponse("OK", { status: 200 });
}
