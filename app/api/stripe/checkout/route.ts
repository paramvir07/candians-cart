import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { amount } = await req.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  try {
   const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "cad",
        product_data: {
          name: "Wallet Top-Up",
        },
        unit_amount: amount * 100,
      },
      quantity: 1,
    },
  ],
  metadata: {
    userId: "USER_ID_HERE",
    amount: amount.toString(),
  },
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/wallet?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/wallet?canceled=true`,
})


    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Stripe error" }, { status: 500 })
  }
}
