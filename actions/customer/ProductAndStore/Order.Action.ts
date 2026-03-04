"use server"

import { dbConnect } from "@/db/dbConnect"
import { getUser } from "../User.action";
import OrderModel from "@/db/models/customer/Orders.Model";
import "@/db/models/store/products.model"
import CartModel from "@/db/models/customer/cart.model";
import { revalidatePath } from "next/cache";

export const getOrders = async (customerId?: string) => {
  await dbConnect();
  const user = await getUser(customerId);
  if (!user) return null;

  try {
    const prevOrders = await OrderModel
      .find({ userId: user._id })
      .populate({
        path: "products.productId",
        model: "Product",
      })
      .sort({ createdAt: -1 })
      .lean();


    const serializedOrders = JSON.parse(JSON.stringify(prevOrders));

    return serializedOrders;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const ReOrder = async (orderId: string) => {
  try {
    await dbConnect();

    const userOrder = await OrderModel.findById(orderId).lean();
    if (!userOrder) return;

    const itemsToInsert = userOrder.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      storeId: userOrder.storeId,
    }));

    await CartModel.findOneAndUpdate(
      { customerId: userOrder.userId },
      { $push: { items: { $each: itemsToInsert } } },
      { upsert: true, returnDocument: "after" },
    );
    revalidatePath('/');
    return { success: true, message: "Items added to cart successfully"};
  } catch (error) {
    console.log("Error Reordering Items:", error);
  }
};