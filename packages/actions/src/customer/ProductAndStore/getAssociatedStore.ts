"use server";

import { cache } from "react";
import { dbConnect } from "@canadian-cart/db/dbConnect";
import { getUserSession } from "@canadian-cart/actions/auth/getUserSession";
import Customer from "@canadian-cart/db/models/customer/customer.model";
import { Customer as CustomerType } from "@canadian-cart/types/customer/customer";
import { IProduct } from "@canadian-cart/types/customer/CustomerCart";

export interface AssociatedStoreResponse {
  success: boolean;
  customer?: CustomerType;
  storeId?: string;
  products?: IProduct[];
  error?: string;
}

const getStoreAndProduct = cache(async (customerId?: string): Promise<AssociatedStoreResponse> => {
  try {
    const session = await getUserSession();
    const userId = session.user.id;
    const isCashier = session.user.role === "cashier";

    await dbConnect();

    const customer = isCashier
      ? await Customer.findById(customerId).select("associatedStoreId").lean()
      : await Customer.findOne({ userId }).select("associatedStoreId").lean();

    if (!customer) throw new Error("Customer not found");

    const serializedCustomer: CustomerType = JSON.parse(JSON.stringify(customer));
    const storeId = serializedCustomer.associatedStoreId?.toString();

    return {
      success: true,
      customer: serializedCustomer,
      storeId,         
      products: [],
    };
  } catch (error) {
    console.error("Error fetching store:", error);
    return { success: false, error: String(error) };
  }
});

export default getStoreAndProduct;