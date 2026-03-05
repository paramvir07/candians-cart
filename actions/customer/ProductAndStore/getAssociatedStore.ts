"use server";

import Product from "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";
import { IProduct } from "@/types/customer/CustomerCart";
import { Customer as CustomerType } from "@/types/customer/customer";

export interface AssociatedStoreResponse{
  success: boolean;
  storeId?: string;
  products?: IProduct[];
  customer?: CustomerType;
  error?: string;
}

export default async function getStoreAndProduct(customerId?: string) : Promise<AssociatedStoreResponse> {
  try {
    const session = await getUserSession();
    const userId = session.user.id;
    const cashierRole = session.user.role === "cashier";
    await dbConnect();

    let customer;
    if (cashierRole) {
      customer = await Customer.findById(customerId).lean();
    }
    else {
      customer = await Customer.findOne({ userId: userId }).lean();
    }

    if (!customer) {
      throw new Error("Customer not found");
    }

    const products = await Product.find({
      storeId: customer.associatedStoreId,
    }).lean();
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedCustomer = JSON.parse(JSON.stringify(customer));

    return {
      success: true,
      products: serializedProducts,
      customer: serializedCustomer,
    };
  } catch (error) {
    console.log("Error fetching store and products: " + error);
    return {
      success: false,
      error: "Error fetching the products: " + error,
    };
  }
}
