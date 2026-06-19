"use server";
import { dbConnect } from "@/db/dbConnect";
import Customer, { ICustomer } from "@/db/models/customer/customer.model";
import { NextResponse } from "next/server";
import { getUserSession } from "../auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { Cashier } from "@/db/models/cashier/cashier.model";
import {
  getCachedCustomerAndStore,
  getCachedCustomerProfile,
} from "../cache/user.cache";
import { Types } from "mongoose";
import OrderModel from "@/db/models/customer/Orders.Model";

export interface CustomerWithRecentOrder extends ICustomer {
  _id: Types.ObjectId;
  lastOrderDate: Date; // Injected by aggregation
}

export interface CustomerStats {
  totalUsers: number;
  totalUsersChange: string;
  totalUsersUp: boolean;
  newUsersThisMonth: number;
  newUsersChange: string;
  newUsersUp: boolean;
  activeUsers: number;
  activeUsersChange: string;
  activeUsersUp: boolean;
  avgMonthlyBudget: number;
  avgBudgetChange: string;
  avgBudgetUp: boolean;
}

export const getMyStoreCustomerStats = async (): Promise<CustomerStats> => {
  const session = await getUserSession();
  const cashierRole = session.user.role === "cashier";
  const storeRole = session.user.role === "store";

  await dbConnect();

  let myStoreId;

  if (cashierRole) {
    const cashier = await Cashier.findOne({ userId: session.user.id }).lean();
    myStoreId = cashier?.storeId;
  } else if (storeRole) {
    const myStore = await Store.findOne({ userId: session.user.id })
      .select("_id")
      .lean();

    myStoreId = myStore?._id;
  }

  if (!myStoreId) {
    return {
      totalUsers: 0,
      totalUsersChange: "0",
      totalUsersUp: false,
      newUsersThisMonth: 0,
      newUsersChange: "0",
      newUsersUp: false,
      activeUsers: 0,
      activeUsersChange: "0",
      activeUsersUp: false,
      avgMonthlyBudget: 0,
      avgBudgetChange: "0",
      avgBudgetUp: false,
    };
  }

  const storeObjectId = new Types.ObjectId(myStoreId);

  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const pct = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "100" : "0";
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const customers = await Customer.find({
    associatedStoreId: storeObjectId,
  }).lean();

  // Total users
  const totalUsers = customers.length;

  const totalUsersLastMonth = customers.filter(
    (c) => new Date(c.createdAt as any) < startOfMonth,
  ).length;

  // New users this month
  const newUsersThisMonth = customers.filter(
    (c) => new Date(c.createdAt as any) >= startOfMonth,
  ).length;

  const newUsersLastMonth = customers.filter((c) => {
    const d = new Date(c.createdAt as any);
    return d >= startOfLastMonth && d < startOfMonth;
  }).length;

  // Active users = unique customers/users who placed completed orders
  const activeUserIdsThisMonth = await OrderModel.distinct("userId", {
    storeId: storeObjectId,
    status: "completed",
    createdAt: {
      $gte: startOfMonth,
      $lt: startOfNextMonth,
    },
  });

  const activeUserIdsLastMonth = await OrderModel.distinct("userId", {
    storeId: storeObjectId,
    status: "completed",
    createdAt: {
      $gte: startOfLastMonth,
      $lt: startOfMonth,
    },
  });

  const activeUsersThisMonth = activeUserIdsThisMonth.length;
  const activeUsersLastMonth = activeUserIdsLastMonth.length;

  // Avg monthly budget
  const avgBudgetCents =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.monthlyBudget ?? 0), 0) /
        customers.length
      : 0;

  const lastMonthCustomers = customers.filter(
    (c) => new Date(c.createdAt as any) < startOfMonth,
  );

  const avgBudgetLastMonthCents =
    lastMonthCustomers.length > 0
      ? lastMonthCustomers.reduce((sum, c) => sum + (c.monthlyBudget ?? 0), 0) /
        lastMonthCustomers.length
      : 0;

  return {
    totalUsers,
    totalUsersChange: pct(totalUsers, totalUsersLastMonth),
    totalUsersUp: totalUsers >= totalUsersLastMonth,

    newUsersThisMonth,
    newUsersChange: pct(newUsersThisMonth, newUsersLastMonth),
    newUsersUp: newUsersThisMonth >= newUsersLastMonth,

    activeUsers: activeUsersThisMonth,
    activeUsersChange: pct(activeUsersThisMonth, activeUsersLastMonth),
    activeUsersUp: activeUsersThisMonth >= activeUsersLastMonth,

    avgMonthlyBudget: avgBudgetCents / 100,
    avgBudgetChange: pct(avgBudgetCents, avgBudgetLastMonthCents),
    avgBudgetUp: avgBudgetCents >= avgBudgetLastMonthCents,
  };
};

export const getUser = async (customerId?: string) => {
  try {
    const session = await getUserSession();
    const cashierRole = session.user.role === "cashier";
    const UserId = session.user.id;

    await dbConnect();
    let UserData;
    if (cashierRole) {
      UserData = await Customer.findById(customerId).lean();
    } else {
      UserData = await Customer.findOne({ userId: UserId }).lean();
    }

    return UserData;
  } catch (error) {
    console.log(error);
  }
};

export const GetUserfromSession = async (sessionId: string | null) => {
  if (!sessionId) return null;
  try {
    await dbConnect();
    const user = await Customer.findOne({ userId: sessionId }).lean();
    return user || null;
  } catch (error) {
    console.log(error);
    NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
};

export const getCustomerAndStoreDataAction = async () => {
  try {
    const session = await getUserSession();
    return getCachedCustomerAndStore(session.user.id);
  } catch (error) {
    console.log(`Unable to find customer and store data: ${error}`);
    return {
      success: false,
      message: "Unable to find customer and store data",
    };
  }
};

export const getCustomerDataAction = async (
  customerId?: string,
  getCashierId?: boolean,
) => {
  const session = await getUserSession();
  const cashierRole =
    session.user.role === "cashier" || session.user.role === "admin";
  try {
    await dbConnect();
    let customerData;
    if (cashierRole) {
      customerData = await Customer.findById(customerId).lean();
    } else {
      customerData = await Customer.findOne({
        userId: session.user.id,
      }).lean();
    }

    if (!customerData)
      return {
        success: false,
        message: "Unable to find customer data",
      };

    const serializedCustomerData = JSON.parse(JSON.stringify(customerData));

    if (cashierRole && getCashierId === true) {
      return {
        success: true,
        customerData: serializedCustomerData,
        cashierUserId: session.user.id,
      };
    }
    return {
      success: true,
      customerData: serializedCustomerData,
    };
  } catch (error) {
    console.log(`Unable to find customer data: ${error}`);
    return {
      success: false,
      message: "Unable to find customer data",
    };
  }
};

export const getMyStoreCustomers = async (page = 1, limit = 12) => {
  const session = await getUserSession();
  const cashierRole = session.user.role === "cashier";
  const storeRole = session.user.role === "store";
  try {
    await dbConnect();

    let myStoreId;
    if (cashierRole) {
      const cashier = await Cashier.findOne({ userId: session.user.id }).lean();
      myStoreId = cashier?.storeId;
    } else if (storeRole) {
      const myStore = await Store.findOne({ userId: session.user.id })
        .select("_id")
        .lean();
      myStoreId = myStore?._id;
    }

    if (!myStoreId)
      return {
        success: false,
        message: "Unable to find my store",
      };

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    const myStoreCustomersData =
      await Customer.aggregate<CustomerWithRecentOrder>([
        {
          $match: { associatedStoreId: new Types.ObjectId(myStoreId) },
        },
        {
          $lookup: {
            from: "orders",
            let: { customerUserId: "$userId", storeId: "$associatedStoreId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$customerUserId"] },
                      { $eq: ["$storeId", "$$storeId"] },
                    ],
                  },
                },
              },
              {
                $sort: { createdAt: -1 },
              },
              { $limit: 1 },
              { $project: { createdAt: 1 } },
            ],
            as: "recentOrder",
          },
        },
        {
          $addFields: {
            lastOrderDate: {
              $cond: {
                if: { $gt: [{ $size: "$recentOrder" }, 0] },
                then: { $arrayElemAt: ["$recentOrder.createdAt", 0] },
                else: "$createdAt",
              },
            },
          },
        },
        { $project: { recentOrder: 0 } }, // Remove the array payload
        { $sort: { lastOrderDate: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

    if (!myStoreCustomersData)
      return {
        success: false,
        message: "Unable to find my store customers",
      };

    const totalCount = await Customer.countDocuments({
      associatedStoreId: myStoreId,
    });

    const serializedMyStoreCustomersData = myStoreCustomersData.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      associatedStoreId: doc.associatedStoreId.toString(),
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
      lastOrderDate: doc.lastOrderDate?.toISOString() ?? "",
    }));

    return {
      success: true,
      myStoreCustomersData: serializedMyStoreCustomersData,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.log(`Unable to find my store customers: ${error}`);
    return {
      success: false,
      message: "Unable to find my store customers",
    };
  }
};

export const getCustomerProfileAction = async () => {
  const session = await getUserSession();
  return getCachedCustomerProfile(session.user.id);
};
