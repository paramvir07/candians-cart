import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

interface TopUpRequest {
  amount: number; // The requested top-up amount in cents
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TopUpRequest;
    const targetAmountCents = body.amount;

    const Authsession = getUserSession();
    const userId = (await Authsession).user.id;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // According to stripe they take 2.9% + 30 cents per transaction, so we need to calculate the total charge amount to ensure the user receives the intended top-up amount after fees.

    const fixedFeeCents = 30; // Fixed 30 cent fee
    const percentageFee = 0.029; // 2.9%
    const totalChargeCents = Math.ceil(
      (targetAmountCents + fixedFeeCents) / (1 - percentageFee),
    );

    const calculatedFeeCents = totalChargeCents - targetAmountCents;

    if (!targetAmountCents || targetAmountCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Wallet Top-up",
              description: "Candian Cart Wallet Recharge",
            },
            unit_amount: targetAmountCents, // cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Processing Fee",
              description: "Stripe transaction costs (2.9% + 30¢)",
            },
            unit_amount: calculatedFeeCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        requestedAmount: targetAmountCents.toString(),
      },
      custom_text: {
        submit: {
          message:
            "⚠️ NOTE: A calculated processing fee is added to cover Stripe's transaction costs. To avoid this fee, please recharge directly at your assigned Candian Cart store.",
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/wallet/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/wallet/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Stripe Checkout Session Error:", err.message);

    return NextResponse.json(
      { error: "Failed to initialize secure checkout session." },
      { status: 500 },
    );
  }
}
