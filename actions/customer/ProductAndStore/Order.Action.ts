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

    for (const product of userOrder.products) {
      const updatedCart = await CartModel.findOneAndUpdate(
        {
          customerId: userOrder.userId,
          "items.productId": product.productId,
          "items.storeId": userOrder.storeId,
        },
        {
          $inc: {
            "items.$.quantity": product.quantity,
          },
        },
        {
          returnDocument: "after",
        },
      );

      if (!updatedCart) {
        await CartModel.findOneAndUpdate(
          { customerId: userOrder.userId },
          {
            $push: {
              items: {
                productId: product.productId,
                quantity: product.quantity,
                storeId: userOrder.storeId,
              },
            },
          },
          {
            upsert: true,
            returnDocument: "after",
          },
        );
      }
    }

    return { success: true, message: "Items added to cart successfully" };
  } catch (error) {
    console.log("Error Reordering Items:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const completePendingOrder = async (
  orderId: string,
  customerId: string | undefined,
  paymentMode: "card" | "cash" | "wallet",
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
        .session(mongoSession)
        .lean();

      if (!order) {
        throw new Error("Order not found or already completed");
      }

      const cartTotal = Number(order.cartTotal ?? 0);
      const subsidy = Number(order.subsidy ?? 0);
      const subsidyUsed = Number(order.subsidyUsed ?? 0);

      const customer = await Customer.findById(customerId)
        .select("giftWalletBalance")
        .session(mongoSession)
        .lean();

      if (!customer) {
        throw new Error("Customer not found");
      }

      const subsidyLeft =
        Number(
          ((customer.giftWalletBalance + subsidy - subsidyUsed) / 100).toFixed(
            2,
          ),
        ) * 100;

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
            subsidyLeft,
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
  try {
    await dbConnect();
    const user = await getUser();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const orderCount = await OrderModel.countDocuments({
      userId: user._id,
    });

    return { success: true, orderCount };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Something went wrong" };
  }
};