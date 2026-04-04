"use server";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { NextResponse } from "next/server";
import { getUserSession } from "../auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { Cashier } from "@/db/models/cashier/cashier.model";
import { getCachedCustomerAndStore, getCachedCustomerProfile } from "../cache/user.cache";

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
    return { success: false, message: "Unable to find customer and store data" };
  }
};

export const getCustomerDataAction = async (customerId?: string, getCashierId? :boolean) => {
  const session = await getUserSession();
    const cashierRole = session.user.role === "cashier" || session.user.role === "admin";
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
        cashierUserId: session.user.id
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

export const getMyStoreCustomers = async () => {
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

    const myStoreCustomersData = await Customer.find({
      associatedStoreId: myStoreId,
    }).lean();

    if (!myStoreCustomersData)
      return {
        success: false,
        message: "Unable to find my store customers",
      };

    const serializedMyStoreCustomersData = JSON.parse(
      JSON.stringify(myStoreCustomersData),
    );

    return {
      success: true,
      myStoreCustomersData: serializedMyStoreCustomersData,
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