"use server"

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import OrderModel from "@/db/models/customer/Orders.Model";
import { unstable_cache } from "next/cache";


export const getOrderCountCached = unstable_cache(
  async (userId: string) => {    
    try {
      await dbConnect();
      const user = await Customer.findOne({ userId }).lean();

      if (!user) return { success: false, message: "User not found" };

      const orderCount = await OrderModel.countDocuments({ userId: user._id });
      return { success: true, orderCount };
    } catch (err) {
      console.log(err);
      return { success: false, message: "Something went wrong" };
    }
  },
  ["order-count"],
  { tags: ["orders"] }
);

export const getCachedCustomerProfile = unstable_cache(
  async (userId: string) => {
    await dbConnect();
    const customerProfile = await Customer.findOne({ userId }).lean();
    return JSON.parse(JSON.stringify(customerProfile));
  },
  ["customer-profile"],
  { tags: ["customer"] }
);

export const getCachedCustomerAndStore = unstable_cache(
  async (userId: string) => {
    await dbConnect();
    const customerData = await Customer.findOne({ userId })
      .populate("associatedStoreId")
      .lean();

    if (!customerData)
      return { success: false, message: "Unable to find customer data" };

    return {
      success: true,
      customerData: JSON.parse(JSON.stringify(customerData)),
    };
  },
  ["customer-and-store"],
  { tags: ["customer-and-store"] } 
);