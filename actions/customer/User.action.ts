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

export interface CustomerWithRecentOrder extends ICustomer {
  _id: Types.ObjectId;
  lastOrderDate: Date; // Injected by aggregation
}

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
