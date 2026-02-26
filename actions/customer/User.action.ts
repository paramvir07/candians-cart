"use server";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { NextResponse } from "next/server";
import { getUserSession } from "../auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";

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
  const session = await getUserSession();
  try {
    await dbConnect();
    const customerData = await Customer.findOne({
      userId: session.user.id,
    }).lean();

    if (!customerData)
      return {
        success: false,
        message: "Unable to find customer data",
      };

    const storeData = await Store.findById(
      customerData.associatedStoreId,
    ).lean();

    if (!storeData)
      return {
        success: false,
        message: "Unable to find customer's store data",
      };

    const serializedCustomerData = JSON.parse(JSON.stringify(customerData));
    const serializedStoreData = JSON.parse(JSON.stringify(storeData));

    return {
      success: true,
      customerData: serializedCustomerData,
      storeData: serializedStoreData,
    };
  } catch (error) {
    console.log(`Unable to find customer and store data: ${error}`);
    return {
      success: false,
      message: "Unable to find customer and store data",
    };
  }
};

export const getCustomerDataAction = async () => {
  const session = await getUserSession();
  try {
    await dbConnect();
    const customerData = await Customer.findOne({
      userId: session.user.id,
    }).lean();

    if (!customerData)
      return {
        success: false,
        message: "Unable to find customer data",
      };

    const serializedCustomerData = JSON.parse(JSON.stringify(customerData));

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
