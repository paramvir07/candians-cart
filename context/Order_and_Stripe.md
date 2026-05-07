# Order Working Logic & Stripe Checkout

This document outlines how **Candian's Cart** handles the transition from a user's shopping cart to a finalized order, ensures historical data integrity, and securely processes payments using Stripe.

## 1. Point-in-Time Pricing Locks (`Orders.Model.ts`)

A critical rule in e-commerce architecture is **Point-in-Time Pricing**. When a user places an order, the prices, taxes, and product names must be "locked" into the order document.

If a store owner later changes the price of an apple from $1.00 to $2.00, historical orders must still show $1.00. Therefore, the Order model does _not_ just store Product IDs; it stores a snapshot of the product details at the exact moment of checkout.

```ts
// db/models/customer/Orders.Model.ts (Conceptual Schema)
import mongoose, { Schema, Types } from "mongoose";

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true }, // Locked name
  priceAtPurchase: { type: Number, required: true }, // Locked price in cents
  quantity: { type: Number, required: true },
  taxRateAtPurchase: { type: Number, required: true },
  isSubsidized: { type: Boolean, default: false },
});

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    stripeSessionId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
```

## 2. Converting Carts to Orders (`Order.Action.ts`)

Before a user is sent to Stripe, their Cart must be evaluated, checked against their available subsidy limits, and converted into a `pending` Order.

**Rule:** The creation of an Order document happens securely on the server via a Server Action.

```ts
// actions/customer/ProductAndStore/Order.Action.ts
"use server";

import Cart from "@/db/models/customer/cart.model";
import Order from "@/db/models/customer/Orders.Model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export const createPendingOrder = async () => {
  const session = await getUserSession();
  const userId = session.user.id;

  // 1. Fetch Cart and expand Product details
  const cart = await Cart.findOne({ userId })
    .populate("items.productId")
    .lean();

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  // 2. Map cart items to point-in-time order items
  const orderItems = cart.items.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    priceAtPurchase: item.productId.price,
    quantity: item.quantity,
    taxRateAtPurchase: item.productId.tax,
    isSubsidized: item.isSubsidized,
  }));

  // 3. Calculate Totals (applying subsidies vs wallet/Stripe charges)
  const totalAmount = orderItems.reduce(/* ... */);

  // 4. Create the Order in 'pending' status
  const newOrder = await Order.create({
    userId,
    storeId: cart.storeId,
    items: orderItems,
    totalAmount,
    paymentStatus: "pending",
  });

  return { success: true, orderId: newOrder._id.toString() };
};
```

## 3. Stripe Initialization (`checkout/route.ts` & `lib/stripe.ts`)

Once the pending order is generated, we use the Next.js Route Handler to create a Stripe Checkout Session.

**Crucial Architecture Step:** We MUST pass our internal `orderId` and `userId` into Stripe's `metadata` object. This is the only way Stripe can tell us exactly _which_ order was paid for when the webhook fires later.

```ts
// app/api/stripe/checkout/route.ts
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId, amount, userId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: { name: "Candian's Cart Order" },
            unit_amount: amount, // In cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/customer/wallet/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/customer/wallet/payment-cancel`,
      // CRITICAL: Metadata links the Stripe payment back to our Database
      metadata: {
        orderId: orderId,
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
```

## 4. Webhook Processing: The Source of Truth (`webhook/route.ts`)

**Golden Security Rule:** Never trust the client-side `success_url` to finalize an order. A user can easily fake a visit to `/payment-success`.

All order finalization, stock deduction, and cart clearing MUST happen inside the Stripe Webhook route. This is a secure server-to-server communication where Stripe cryptographically signs the payload.

```ts
// app/api/stripe/webhook/route.ts
import { stripe } from "@/lib/stripe";
import Order from "@/db/models/customer/Orders.Model";
import Cart from "@/db/models/customer/cart.model";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    // 1. Verify the event actually came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // 2. Handle the successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Extract the metadata we sent during creation
    const { orderId, userId } = session.metadata;

    // 3. Finalize the Order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      stripeSessionId: session.id,
    });

    // 4. Clear the user's cart now that payment is confirmed
    await Cart.findOneAndDelete({ userId });

    // (Optional) 5. Trigger Store Payout accruals here...
  }

  return new NextResponse("Webhook Handled", { status: 200 });
}
```
