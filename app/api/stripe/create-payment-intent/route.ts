import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, userId } = body;

  // basic validation
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,           // amount in cents
    currency: "cad",  // change if needed
    metadata: { userId },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  });
}