import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  const { amount } = await req.json();
  const Authsession = getUserSession()
  const userId = (await Authsession).user.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Wallet Top-up",
          },
          unit_amount: amount, // cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId,
    },
    success_url:`${process.env.NEXT_PUBLIC_BASE_URL}/customer/wallet/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/wallet/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,  
});

  return NextResponse.json({ url: session.url });
}