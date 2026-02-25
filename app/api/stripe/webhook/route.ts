import Stripe from "stripe"
import { NextResponse } from "next/server"
import { dbConnect } from "@/db/dbConnect"
import { getUser, GetUserfromSession } from "@/actions/customer/User.action"
import WalletPayment from "@/db/models/customer/WalletPayment.model"
import Customer from "@/db/models/customer/customer.model"

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
  if(event.type === "checkout.session.completed"){
const session = event.data.object as Stripe.Checkout.Session;

// create payment record
await dbConnect();
const User = await GetUserfromSession(session.metadata?.userId || null)

if(!User){
  console.log("No user found for session ID: " + session.metadata?.userId)
} 

 const paymentRecord = await WalletPayment.create({
  userId: User?._id,
  stripeEventId: event.id,
  checkoutSessionId: session.id,
  paymentIntentId: session.payment_intent as string,
  amount: session.amount_total || 0,
  currency: session.currency || "cad",
  status: session.payment_status || "pending"
 })

 // Reflect amount in user's wallet balance
 if(paymentRecord){
  await Customer.findByIdAndUpdate(User?._id,{
    $inc: { walletBalance: session.amount_total ? session.amount_total / 100 : 0 }
  })
  
  // console.log("Payment record created and wallet updated for user: " + User?.email)
 }
}

  return new NextResponse("OK", { status: 200 })
}