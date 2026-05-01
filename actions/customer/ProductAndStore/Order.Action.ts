"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUser } from "../User.action";
import OrderModel from "@/db/models/customer/Orders.Model";
import "@/db/models/store/products.model";
import CartModel from "@/db/models/customer/cart.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { Cashier } from "@/db/models/cashier/cashier.model";
import mongoose from "mongoose";
import Customer from "@/db/models/customer/customer.model";
import { revalidateTag } from "next/cache";
import { getOrderCountCached } from "@/actions/cache/user.cache";

export const getOrders = async (customerId?: string) => {
  await dbConnect();
  const user = await getUser(customerId);
  if (!user) return null;

  try {
    const prevOrders = await OrderModel.find({ userId: user._id })
      .populate([
        {
          path: "products.productId",
          model: "Product",
        },
        {
          path: "subsidyItems.productId",
          model: "Product",
        },
      ])
      .sort({ createdAt: -1 })
      .lean();

    const serializedOrders = JSON.parse(JSON.stringify(prevOrders));

    return serializedOrders;
  } catch (err) {
    console.log("Error while getting customer orders: ", err);
    return null;
  }
};

export const getAllOrders = async () => {
  try {
    const session = await getUserSession();
    if (!session?.user?.id) return null;

    await dbConnect();

    const cashier = await Cashier.findOne({ userId: session.user.id })
      .select("storeId")
      .lean();

    if (!cashier?.storeId) {
      console.log("No cashier or storeId found");
      return [];
    }

    const prevOrders = await OrderModel.find({ storeId: cashier.storeId })
      .populate([
        {
          path: "products.productId",
          model: "Product",
        },
        {
          path: "subsidyItems.productId",
          model: "Product",
        },
      ])
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(prevOrders));
  } catch (err) {
    console.log("Error while getting all store orders: ", err);
    return null;
  }
};

export const ReOrder = async (orderId: string) => {
  try {
    await dbConnect();

    const userOrder = await OrderModel.findById(orderId).lean();

    if (!userOrder) {
      return { success: false, message: "Order not found" };
    }

    const cart = await CartModel.findOne({ customerId: userOrder.userId });

    // If no cart exists, create a fresh one
    const cartItems = cart?.items ? [...cart.items] : [];
    const cartSubsidyItems = cart?.subsidyItems ? [...cart.subsidyItems] : [];

    // Helper to add/increment product in array
    const upsertCartItem = (
      arr: any[],
      item: { productId: any; quantity: number; storeId: any },
    ) => {
      const existingIndex = arr.findIndex(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString() &&
          cartItem.storeId.toString() === item.storeId.toString(),
      );

      if (existingIndex !== -1) {
        arr[existingIndex].quantity += item.quantity;
      } else {
        arr.push({
          productId: item.productId,
          quantity: item.quantity,
          storeId: item.storeId,
        });
      }
    };

    // Add normal products to cart.items
    if (Array.isArray(userOrder.products)) {
      for (const product of userOrder.products) {
        upsertCartItem(cartItems, {
          productId: product.productId,
          quantity: product.quantity,
          storeId: userOrder.storeId,
        });
      }
    }

    // Add subsidized products to cart.subsidyItems
    if (
      Array.isArray(userOrder.subsidyItems) &&
      userOrder.subsidyItems.length > 0
    ) {
      for (const subsidyItem of userOrder.subsidyItems) {
        upsertCartItem(cartSubsidyItems, {
          productId: subsidyItem.productId,
          quantity: subsidyItem.quantity,
          storeId: userOrder.storeId,
        });
      }
    }

    await CartModel.findOneAndUpdate(
      { customerId: userOrder.userId },
      {
        $set: {
          customerId: userOrder.userId,
          items: cartItems,
          subsidyItems: cartSubsidyItems,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return { success: true, message: "Items added to cart successfully" };
  } catch (error) {
    console.log("Error Reordering Items:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const completePendingOrder = async (
  orderId: string,
  customerId: string | undefined,
  paymentMode: "wallet",
) => {
  const sessionData = await getUserSession();
  const userId = sessionData?.user?.id;
  const isCashier = sessionData?.user?.role === "cashier";

  if (!userId || !isCashier) {
    return { success: false, message: "Unauthorized" };
  }

  if (!orderId) {
    return { success: false, message: "Order ID is required" };
  }

  if (!customerId) {
    return { success: false, message: "Customer ID is required" };
  }

  let mongoSession: mongoose.ClientSession | null = null;

  try {
    await dbConnect();
    mongoSession = await mongoose.startSession();

    const result = await mongoSession.withTransaction(async () => {
      const cashier = await Cashier.findOne({ userId })
        .select("_id")
        .session(mongoSession)
        .lean();

      if (!cashier) {
        throw new Error("Cashier not found");
      }

      const order = await OrderModel.findOne({
        _id: orderId,
        userId: customerId,
        status: "pending",
      })
        .select("cartTotal subsidyLeft")
        .session(mongoSession)
        .lean();

      if (!order) {
        throw new Error("Order not found or already completed");
      }

      const cartTotal = Number(order.cartTotal ?? 0);
      const subsidyLeft = Number(order.subsidyLeft ?? 0);

      const customer = await Customer.findById(customerId)
        .select("giftWalletBalance")
        .session(mongoSession)
        .lean();

      if (!customer) {
        throw new Error("Customer not found");
      }

      if (paymentMode === "wallet") {
        const walletDeduction = await Customer.findOneAndUpdate(
          {
            _id: customerId,
            walletBalance: { $gte: cartTotal },
          },
          {
            $inc: { walletBalance: -cartTotal },
            $set: { giftWalletBalance: subsidyLeft },
          },
          {
            session: mongoSession,
            returnDocument: "after",
          },
        );

        if (!walletDeduction) {
          throw new Error(
            "Insufficient wallet balance. Please add funds or choose another payment method.",
          );
        }
      } else {
        const newGiftWalletBalance = await Customer.findByIdAndUpdate(
          customerId,
          { $set: { giftWalletBalance: subsidyLeft } },
          { session: mongoSession, returnDocument: "after" },
        );

        if (!newGiftWalletBalance) {
          throw new Error("Failed to credit gift wallet balance");
        }
      }

      const updatedOrder = await OrderModel.findOneAndUpdate(
        {
          _id: orderId,
          userId: customerId,
          status: "pending",
        },
        {
          $set: {
            status: "completed",
            paymentMode,
            cashierId: cashier._id,
          },
        },
        {
          session: mongoSession,
          returnDocument: "after",
        },
      );

      if (!updatedOrder) {
        throw new Error("Failed to complete order");
      }

      return {
        success: true,
        message: "Pending order completed successfully!",
      };
    });

    if (result?.success) {
      revalidateTag("orders", "max");
    }
    return result;
  } catch (error) {
    console.error("Error while completing pending order:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
};

export const cancelPendingOrder = async (
  orderId: string,
  customerId?: string,
) => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const cashierRole = session.user.role === "cashier";
    const customerRole = session.user.role === "customer";

    if (!cashierRole && !customerRole) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    if (cashierRole) {
      if (!customerId) {
        return { success: false, message: "Customer ID is required" };
      }

      const deletedOrder = await OrderModel.findOneAndDelete({
        _id: orderId,
        userId: customerId,
        status: "pending",
      });

      if (!deletedOrder) {
        return { success: false, message: "Pending order not found" };
      }

      return { success: true, message: "Order cancelled successfully" };
    }

    const customer = await Customer.findOne({ userId: session.user.id })
      .select("_id")
      .lean();

    if (!customer) {
      return { success: false, message: "Customer not found" };
    }

    const deletedOrder = await OrderModel.findOneAndDelete({
      _id: orderId,
      userId: customer._id,
      status: "pending",
    });

    if (!deletedOrder) {
      return { success: false, message: "Pending order not found" };
    }

    return { success: true, message: "Order cancelled successfully" };
  } catch (error) {
    console.log("Error while cancelling order:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getOrderCount = async () => {
  const session = await getUserSession(); // ← session outside
  return getOrderCountCached(session.user.id); // ← id into cache key
};
