import Stripe from "stripe"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature failed")
    return new NextResponse("Invalid signature", { status: 400 })
  }

  console.log("EVENT TYPE:", event.type)

  if (event.type === "payment_intent.succeeded") {
    console.log("PAYMENT SUCCESS")
  }

  return new NextResponse("OK", { status: 200 })
}