"use server"

import { dbConnect } from "@/db/dbConnect";
import CartModel from "@/db/models/customer/cart.model";
import { getFibBracketFrom21 } from "@/lib/FibBracket";

const fmt = (cents: number) => (cents / 100).toFixed(2);

export const getCartInsights = async (customerId?: string) => {
  if (!customerId) return { success: false, message: "CustomerId is required", data: null };

  try {
    await dbConnect();

    const cartData = await CartModel.findOne({ customerId })
      .populate({ path: "items.productId", select: "price markup tax disposableFee subsidised" })
      .populate({ path: "subsidyItems.productId", select: "tax disposableFee" })
      .lean() as any;

    if (!cartData) return { success: false, message: "No cart found", data: null };

    const items    = cartData.items        ?? [];
    const subItems = cartData.subsidyItems ?? [];
    const numItems = items.length + subItems.length;

    // ── Total (regular items) ────────────────────────────────────────────────
    const total = items.reduce((acc: number, item: any) => {
      const base       = item.productId.price * item.quantity;
      const afterMarkup = base + Math.round(base * (item.productId.markup / 100));
      const tax        = item.productId.tax ?? 0;
      const taxAmt     = tax === 0.12
        ? Math.round(afterMarkup * 0.05) + Math.round(afterMarkup * 0.07)
        : Math.round(afterMarkup * tax);
      const disposable = (item.productId.disposableFee ?? 0) * item.quantity;
      return acc + afterMarkup + taxAmt + disposable;
    }, 0);

    // ── Subsidy on order ─────────────────────────────────────────────────────
    const progressTotal = items.reduce((acc: number, item: any) => {
      if (item.productId.subsidised) return acc;
      const base = item.productId.price * item.quantity;
      return acc + base + Math.round(base * (item.productId.markup / 100));
    }, 0);

    const totalInDollars = progressTotal / 100;
    const { prev, current, mid } = getFibBracketFrom21(totalInDollars);

    const avgMarkup = items
      .filter((i: any) => !i.productId.subsidised)
      .reduce((acc: number, i: any) => acc + i.productId.markup, 0)
      / (items.filter((i: any) => !i.productId.subsidised).length || 1);

    const activeMarkup = (() => {
      if (prev >= 21 && totalInDollars >= prev && totalInDollars < (mid ?? current)) return avgMarkup;
      if (mid && totalInDollars >= mid && totalInDollars <= current) return 30;
      return 0;
    })();

    const markupBase = (() => {
      if (mid && totalInDollars >= mid && totalInDollars <= current) return mid * 100;
      if (totalInDollars >= prev && totalInDollars < (mid ?? current)) return prev * 100;
      return 0;
    })();

    const subsidyOnOrder = Math.floor(markupBase * (activeMarkup / 100) * 0.6);

    return {
      success: true,
      data: { numItems, subsidyOnOrder, total },
    };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Can't get cart insights", data: null };
  }
};