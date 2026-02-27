"use server";

import Product from "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";

export default async function getStoreAndProduct() {
  try {
    const session = await getUserSession();
    await dbConnect();

    const userId = session.user.id;

    const customer = await Customer.findOne({ userId: userId });


    if (!customer) {
      throw new Error("Customer not found");
    }

    const products = await Product.find({
      storeId: customer.associatedStoreId,
    }).lean();
    const serializedProducts = JSON.parse(JSON.stringify(products));

    return {
      success: true,
      products: serializedProducts,
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
