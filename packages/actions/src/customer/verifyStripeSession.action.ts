// actions/stripe/verifySession.actions.ts
"use server"

import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function verifyStripeSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    // Must be paid AND mode is payment
    if (session.payment_status !== "paid") {
      return { valid: false }
    }

    return {
      valid: true,
      userId: session.metadata?.userId,
    }
  } catch {
    return { valid: false }
  }
}

export async function verifyStripeCancelSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status === "open" || session.status === "expired") {
      return { valid: true }
    }

    return { valid: false }
  } catch {
    return { valid: false }
  }
}