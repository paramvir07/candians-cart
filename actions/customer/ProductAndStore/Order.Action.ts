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
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import Product from "@/db/models/store/products.model";
import { getVancouverDayBoundsUTC } from "@/lib/timezone";

type OrderSearchClause = {
  text?: {
    query: string;
    path: string | string[];
    fuzzy?: { maxEdits: number };
  };
  autocomplete?: {
    query: string;
    path: string;
    fuzzy?: { maxEdits: number };
  };
};
export interface OrderDateRange {
  from?: Date;
  to?: Date;
}
const buildDateMatch = (
  dateRange?: OrderDateRange,
): Record<string, unknown> => {
  if (!dateRange?.from || !dateRange?.to) return {};

  const { start } = getVancouverDayBoundsUTC(new Date(dateRange.from));
  const { end } = getVancouverDayBoundsUTC(new Date(dateRange.to));

  return { createdAt: { $gte: start, $lte: end } };
};

export interface PaginatedStoreOrdersResult {
  success: boolean;
  data?: OrderWithProductsClient[];
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  error?: string;
}

export const getOrders = async (
  customerId?: string,
  page: number = 1,
  limit: number = 5,
  dateRange?: OrderDateRange,
): Promise<PaginatedStoreOrdersResult> => {
  try {
    await dbConnect();
    const user = await getUser(customerId);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const skip = (page - 1) * limit;
    const match = { userId: user._id, ...buildDateMatch(dateRange) };

    const [prevOrders, totalCount] = await Promise.all([
      OrderModel.find(match)
        .populate([
          { path: "products.productId", model: "Product" },
          { path: "subsidyItems.productId", model: "Product" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(match),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const serializedOrders = JSON.parse(
      JSON.stringify(prevOrders),
    ) as OrderWithProductsClient[];

    return {
      success: true,
      data: serializedOrders,
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (err) {
    console.error("Error while getting customer orders: ", err);
    return { success: false, error: "Failed to fetch customer orders" };
  }
};

export const getAllOrders = async (
  page: number = 1,
  limit: number = 5,
  dateRange?: OrderDateRange,
): Promise<PaginatedStoreOrdersResult> => {
  try {
    const session = await getUserSession();
    const role = session?.user?.role;

    if (!session?.user?.id || (role !== "cashier" && role !== "immigration")) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const skip = (page - 1) * limit;
    const isImmigrationUser = session.user.role === "immigration";

    let orderQuery: Record<string, unknown> = {};

    if (!isImmigrationUser) {
      const cashier = await Cashier.findOne({ userId: session.user.id })
        .select("storeId")
        .lean();

      if (!cashier?.storeId) {
        console.log("No cashier or storeId found");
        return { success: false, error: "No cashier or storeId found" };
      }

      orderQuery = { storeId: cashier.storeId };
    }

    orderQuery = { ...orderQuery, ...buildDateMatch(dateRange) };

    const [prevOrders, totalCount] = await Promise.all([
      OrderModel.find(orderQuery)
        .populate([
          { path: "products.productId", model: "Product" },
          { path: "subsidyItems.productId", model: "Product" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(orderQuery),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const serializedOrders = JSON.parse(
      JSON.stringify(prevOrders),
    ) as OrderWithProductsClient[];

    return {
      success: true,
      data: serializedOrders,
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (err) {
    console.error("Error while getting all store orders: ", err);
    return { success: false, error: "Failed to fetch store orders" };
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

    // Add subsidised products to cart.subsidyItems
    if (
      Array.isArray(userOrder.subsidyItems) &&
      userOrder.subsidyItems.length > 0
    ) {
      for (const subsidyItem of userOrder.subsidyItems) {
        upsertCartItem(cartItems, {
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

const findMatchingProductIds = async (
  term: string,
  storeId?: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[]> => {
  const pipeline: mongoose.PipelineStage[] = [
    {
      $search: {
        index: "ProductSearch",
        compound: {
          should: [
            {
              text: {
                query: term,
                path: ["name", "description", "category"],
                fuzzy: { maxEdits: 2, prefixLength: 1, maxExpansions: 50 },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    },
  ];

  if (storeId) {
    pipeline.push({ $match: { storeId } });
  }

  pipeline.push({ $limit: 100 }, { $project: { _id: 1 } });

  const results = await Product.aggregate(pipeline);
  return results.map((r) => r._id);
};

const findMatchingCustomerIds = async (
  term: string,
  storeId?: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[]> => {
  const compound: {
    should: OrderSearchClause[];
    minimumShouldMatch: number;
    filter?: Record<string, unknown>[];
  } = {
    should: [
      { autocomplete: { query: term, path: "name", fuzzy: { maxEdits: 1 } } },
      { autocomplete: { query: term, path: "email", fuzzy: { maxEdits: 1 } } },
      { text: { query: term, path: "mobile" } },
    ],
    minimumShouldMatch: 1,
  };

  if (storeId) {
    compound.filter = [
      { equals: { path: "associatedStoreId", value: storeId } },
    ];
  }

  const results = await Customer.aggregate([
    { $search: { index: "CustomerSearch", compound } },
    { $limit: 100 },
    { $project: { _id: 1 } },
  ]);
  return results.map((r) => r._id);
};

/**
 * Resolves a search term into matching Order _ids within a given base scope
 * (already-applied auth boundary — a single customer's userId, or a store's
 * storeId). Never widens the base scope, only narrows within it.
 */
const findMatchingOrderIds = async (
  cleanSearchTerm: string,
  baseMatch: Record<string, unknown>,
  options: {
    includeCustomerSearch: boolean;
    storeId?: mongoose.Types.ObjectId;
  },
): Promise<mongoose.Types.ObjectId[]> => {
  if (mongoose.isValidObjectId(cleanSearchTerm)) {
    const docs = await OrderModel.find({
      ...baseMatch,
      _id: new mongoose.Types.ObjectId(cleanSearchTerm),
    })
      .select("_id")
      .lean();
    return docs.map((d) => d._id);
  }

  const [matchedProductIds, matchedCustomerIds] = await Promise.all([
    findMatchingProductIds(cleanSearchTerm, options.storeId),
    options.includeCustomerSearch
      ? findMatchingCustomerIds(cleanSearchTerm, options.storeId)
      : Promise.resolve([] as mongoose.Types.ObjectId[]),
  ]);

  const orConditions: Record<string, unknown>[] = [
    { status: { $regex: cleanSearchTerm, $options: "i" } },
    { paymentMode: { $regex: cleanSearchTerm, $options: "i" } },
  ];

  if (matchedProductIds.length) {
    orConditions.push(
      { "products.productId": { $in: matchedProductIds } },
      { "subsidyItems.productId": { $in: matchedProductIds } },
    );
  }
  if (matchedCustomerIds.length) {
    orConditions.push({ userId: { $in: matchedCustomerIds } });
  }

  const docs = await OrderModel.aggregate([
    { $match: baseMatch },
    { $addFields: { idString: { $toString: "$_id" } } },
    {
      $match: {
        $or: [
          ...orConditions,
          { idString: { $regex: cleanSearchTerm, $options: "i" } },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);
  return docs.map((d) => d._id);
};

const populateAndPaginate = async (
  orderIds: mongoose.Types.ObjectId[],
  page: number,
  limit: number,
): Promise<PaginatedStoreOrdersResult> => {
  const skip = (page - 1) * limit;
  const totalCount = orderIds.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const prevOrders = await OrderModel.find({ _id: { $in: orderIds } })
    .populate([
      { path: "products.productId", model: "Product" },
      { path: "subsidyItems.productId", model: "Product" },
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const serializedOrders = JSON.parse(
    JSON.stringify(prevOrders),
  ) as OrderWithProductsClient[];

  return {
    success: true,
    data: serializedOrders,
    totalPages,
    currentPage: page,
    totalCount,
  };
};

/**
 * Customer-scoped order search — mirrors getOrders(), but narrows by a
 * fuzzy match against products in the order, order status/paymentMode,
 * or an exact order-id match. Always confined to this customer's own
 * orders (userId), same as getOrders().
 */
export const searchOrders = async (
  searchTerm: string,
  customerId?: string,
  page: number = 1,
  limit: number = 5,
  dateRange?: OrderDateRange,
): Promise<PaginatedStoreOrdersResult> => {
  try {
    await dbConnect();
    const cleanSearchTerm = searchTerm.trim();

    if (!cleanSearchTerm) {
      return getOrders(customerId, page, limit, dateRange);
    }

    const user = await getUser(customerId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const orderIds = await findMatchingOrderIds(
      cleanSearchTerm,
      { userId: user._id, ...buildDateMatch(dateRange) },
      { includeCustomerSearch: false },
    );

    return await populateAndPaginate(orderIds, page, limit);
  } catch (err) {
    console.error("Error while searching customer orders: ", err);
    return { success: false, error: "Failed to search customer orders" };
  }
};

export const searchAllOrders = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 5,
  dateRange?: OrderDateRange,
): Promise<PaginatedStoreOrdersResult> => {
  try {
    const session = await getUserSession();
    const role = session?.user?.role;

    if (!session?.user?.id || (role !== "cashier" && role !== "immigration")) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const cleanSearchTerm = searchTerm.trim();
    if (!cleanSearchTerm) {
      return getAllOrders(page, limit, dateRange);
    }

    const isImmigrationUser = role === "immigration";
    const baseMatch: Record<string, unknown> = { ...buildDateMatch(dateRange) };
    let storeId: mongoose.Types.ObjectId | undefined;

    if (!isImmigrationUser) {
      const cashier = await Cashier.findOne({ userId: session.user.id })
        .select("storeId")
        .lean();

      if (!cashier?.storeId) {
        return { success: false, error: "No cashier or storeId found" };
      }
      storeId = cashier.storeId;
      baseMatch.storeId = storeId;
    }

    const orderIds = await findMatchingOrderIds(cleanSearchTerm, baseMatch, {
      includeCustomerSearch: true,
      storeId,
    });

    return await populateAndPaginate(orderIds, page, limit);
  } catch (err) {
    console.error("Error while searching store orders: ", err);
    return { success: false, error: "Failed to search store orders" };
  }
};
