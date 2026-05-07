# Cart Working Logic (State, Limits & DB Syncing)

This document outlines how **Candian's Cart** manages the customer shopping experience. Because the platform includes complex business rules—like tying customers to specific stores and enforcing subsidy limits—the cart logic uses a synchronized approach between Client-Side global state (Atoms) and Server-Side persistence (MongoDB).

## 1. Cart Isolation & Database Model (`cart.model.ts`)

A customer's cart is strictly isolated and bound to their `associatedStoreId`. This prevents users from adding products from multiple different stores into a single checkout flow.

The Cart document stores lightweight references (Product IDs and quantities) rather than duplicating the entire product payload.

```ts
// db/models/customer/cart.model.ts (Conceptual Schema)
import mongoose, { Schema, Types } from "mongoose";

export interface ICartDB {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  storeId: Types.ObjectId; // Strictly enforced against customer's assigned store
  items: Array<{
    productId: Types.ObjectId;
    quantity: number;
    isSubsidized: boolean; // Flagged if this item counts towards their subsidy limit
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICartDB>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    isSubsidized: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model<ICartDB>("Cart", CartSchema);
```

## 2. Global State Management (`CartAtom.ts`)

To ensure the UI feels snappy and responsive without waiting for database round-trips on every click, we use Atoms (Jotai/Recoil) to manage the cart state on the client side. 

The atom acts as the single source of truth for the frontend, allowing components like the navigation bar cart icon and the main cart page to stay perfectly in sync.

```ts
// atoms/customer/CartAtom.ts
import { atom } from 'jotai';
import { IProduct } from '@/types/store/products.types';

export interface CartItem {
  product: IProduct;
  quantity: number;
  isSubsidized: boolean;
}

// Client-side cart state
export const cartItemsAtom = atom<CartItem[]>([]);

// Derived atom for total cart value
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
});
```

## 3. Server Actions & DB Syncing (`Cart.Action.ts`)

Whenever the client-side Atom is updated (e.g., adding an item), a background Server Action is fired to persist that change to MongoDB. This ensures that if the user refreshes the page or logs in on another device, their cart remains intact.

```ts
// actions/customer/ProductAndStore/Cart.Action.ts
"use server";

import { dbConnect } from "@/db/dbConnect";
import Cart from "@/db/models/customer/cart.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { revalidateTag } from "next/cache";

export const syncCartItem = async (productId: string, quantity: number, isSubsidized: boolean = false) => {
  try {
    const session = await getUserSession(); // Automatically protects the route
    const { id: userId } = session.user;
    
    await dbConnect();

    // Upsert logic: Find user's cart, update quantity if product exists, or push new item
    await Cart.findOneAndUpdate(
      { userId },
      { 
        $set: { "items.$[elem].quantity": quantity },
        // ... (additional mongo logic for pushing new items if they don't exist)
      },
      { upsert: true, arrayFilters: [{ "elem.productId": productId }] }
    );

    // Revalidate cart data for Server Components
    revalidateTag(`cart-${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to sync cart:", error);
    return { success: false, error: "Failed to update cart" };
  }
};
```

## 4. Subsidies & UI Integration

Certain users have a "Subsidy Limit" (a budget they can spend on specific items). We use visual components to track this in real-time so the user knows exactly how close they are to their limit before they reach checkout.

### `CartActionBtns.tsx`
Handles the interaction. When a user clicks "Add to Cart", it updates the Atom instantly (Optimistic UI) and fires the Server Action in the background.

### `ProgressBarCart.tsx`
A purely visual component that subscribes to the `cartTotalAtom`. It compares the total value of subsidized items in the cart against the user's maximum allowance, warning them if they exceed it.

```tsx
// components/customer/products/ProgressBarCart.tsx (Conceptual)
"use client";

import { useAtomValue } from "jotai";
import { cartItemsAtom } from "@/atoms/customer/CartAtom";
import { Progress } from "@/components/ui/progress";

export const ProgressBarCart = ({ maxSubsidyLimit }: { maxSubsidyLimit: number }) => {
  const cartItems = useAtomValue(cartItemsAtom);
  
  // Calculate only subsidized items
  const currentSubsidySpent = cartItems
    .filter(item => item.isSubsidized)
    .reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Convert to percentage for the Progress bar
  const progressPercentage = Math.min((currentSubsidySpent / maxSubsidyLimit) * 100, 100);
  const isOverLimit = currentSubsidySpent > maxSubsidyLimit;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subsidy Used: ${(currentSubsidySpent / 100).toFixed(2)}</span>
        <span>Limit: ${(maxSubsidyLimit / 100).toFixed(2)}</span>
      </div>
      
      {/* UI turns red if they go over their budget */}
      <Progress 
        value={progressPercentage} 
        className={isOverLimit ? "bg-red-500" : "bg-primary"} 
      />
      
      {isOverLimit && (
        <p className="text-red-500 text-xs mt-1">
          You have exceeded your subsidy limit. The remainder will be charged to your wallet.
        </p>
      )}
    </div>
  );
};
```