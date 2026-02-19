"use server";

import getUserSession from "@/actions/auth/getUserSession";
import CustomerInfo from "@/db/models/customer/customerInfo.model";
import Product from "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";

export default async function getStoreAndProduct() {
  try {
    await dbConnect();

    const session = await getUserSession();
    const userId = session.user.id;

    const customer = await CustomerInfo.findOne({ userId: userId });

    if (!customer) {
      throw new Error("Customer not found");
    }

    console.log("Customer store Id: " + customer.associatedStoreId);

    const products = await Product.find({
      storeId: customer.associatedStoreId,
    }).lean();

    console.log(products);

    return {
      success: true,
      products,
      customer,
    };
  } catch (error) {
    console.log("Error fetching store and products: " + error);
    return {
      success: false,
      message: "Error fetching the products: " + error,
    };
  }
}
