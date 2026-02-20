import Stripe from "stripe";


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

