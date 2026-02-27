"use server";

import CartModel from "@/db/models/customer/cart.model";
import "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { ICartItem } from "@/types/Customer/CustomerCart";
import OrderModel from "@/db/models/customer/Orders.Model";
import { ca } from "zod/locales";
import Customer from "@/db/models/customer/customer.model";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCustomerDataAction, getUser } from "../User.action";

export const AddtoCart = async (ItemId: string) => {
  const customerDataresponse = await getCustomerDataAction();
  const user = customerDataresponse.customerData;
  if (!user) return null;

  if (!user.associatedStoreId) throw new Error("No store assigned");

  try {
    await dbConnect();
    const productObjectId = new mongoose.Types.ObjectId(ItemId);
    const storeObjectId = new mongoose.Types.ObjectId(user.associatedStoreId);

    const existingCart = await CartModel.findOne({
      customerId: user._id,
    });

    if (!existingCart) {
      await CartModel.create({
        customerId: user._id,
        items: [
          {
            productId: productObjectId,
            storeId: storeObjectId,
            quantity: 1,
          },
        ],
      });
      return { success: true };
    }

    const itemIndex = existingCart.items.findIndex(
      (item) => item.productId.toString() === ItemId,
    );

    if (itemIndex > -1) {
      if (existingCart.items[itemIndex].quantity < 99) {
        existingCart.items[itemIndex].quantity += 1;
      }
    } else {
      existingCart.items.push({
        productId: productObjectId,
        storeId: storeObjectId,
        quantity: 1,
      });
    }

    await existingCart.save();
    return { success: true };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const IncrementItem = async (formData: FormData) => {
  const customerDataresponse = await getCustomerDataAction();
  const user = customerDataresponse.customerData;
  if (!user) return;

  const ItemId = formData.get("productId");

  if (!ItemId || typeof ItemId !== "string") {
    throw new Error("Invalid productId");
  }
  await dbConnect();
  const cart = await CartModel.findOne({
    customerId: user._id,
  });

  if (!cart) return;
  getCart;

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === ItemId,
  );

  if (index === -1) return;

  if (cart.items[index].quantity < 99) {
    cart.items[index].quantity += 1;
  }

  await cart.save();

  revalidatePath("/customer/cart");
};

export const DecrementItem = async (formData: FormData) => {
  const customerDataresponse = await getCustomerDataAction();
  const user = customerDataresponse.customerData;
  if (!user) return;

  const ItemId = formData.get("productId");

  if (!ItemId || typeof ItemId !== "string") {
    throw new Error("Invalid productId");
  }
  await dbConnect();
  const cart = await CartModel.findOne({ customerId: user._id });
  if (!cart) return;

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === ItemId,
  );

  if (index === -1) return;

  if (cart.items[index].quantity > 1) {
    cart.items[index].quantity -= 1;
  } else {
    cart.items.splice(index, 1);
  }

  await cart.save();
  revalidatePath("/customer/cart");
};

export const RemoveItem = async (formData: FormData) => {
  const customerDataresponse = await getCustomerDataAction();
  const user = customerDataresponse.customerData;
  if (!user) return;

  const ItemId = formData.get("productId");

  if (!ItemId || typeof ItemId !== "string") {
    throw new Error("Invalid productId");
  }
  await dbConnect();
  const cart = await CartModel.findOne({ customerId: user._id });
  if (!cart) return;

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === ItemId,
  );

  if (index === -1) return;

  if (cart.items[index].quantity >= 1) {
    cart.items.splice(index, 1);
  }
  await cart.save();
  revalidatePath("/customer/cart");
};

export const getCart = async () => {
  const customerDataresponse = await getCustomerDataAction();
  const user = customerDataresponse.customerData;
  if (!user) return;
  
  await dbConnect();
  try {
    const foundCart = await CartModel.findOne({
      customerId: user._id,
    }).populate("items.productId");

    if (!foundCart) return null;
    return foundCart.items;
  } catch (error) {
    console.log(error);
    return null;
  }
};

interface PlaceOrderProduct {
  productId: string
  quantity: number
  total: number
  markup: number
  tax: number
  disposableFee:number
}

interface PlaceOrderI {
  products: PlaceOrderProduct[]
  cartTotal: number
  userWalletBalance: number
  giftWalletBalance: number
  userId: string
  storeId: string
}


export const PlaceOrder = async () => {
  await dbConnect()

  const user = await getUser()
  const cartItems = (await getCart()) as ICartItem[] | null

  if (!user || !cartItems || cartItems.length === 0) return null

  try {
    const userId = user._id.toString()
    const storeId = user.associatedStoreId.toString()
    const walletBalance = user.walletBalance ?? 0
    const giftWalletBalance = user.giftWalletBalance ?? 0

    const products: PlaceOrderProduct[] = cartItems.map((item) => {
      const base = item.productId.price * item.quantity
      const markupAmount = base * (item.productId.markup / 100)
      const subtotalWithMarkup = base + markupAmount
      const taxAmount = subtotalWithMarkup * item.productId.tax
      const disposableFee = item.productId.disposableFee ?? 0
      const total = Math.round((subtotalWithMarkup + taxAmount + disposableFee) * 100) / 100

      return {
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        markup: item.productId.markup,
        tax: item.productId.tax,
        disposableFee,
        total,
      }
    })

    const cartTotal = Math.round(products.reduce((sum, item) => sum + item.total, 0) * 100) / 100

    if (user.walletBalance < cartTotal / 100) {
      return { success: false, error: "Insufficient Funds" }
    }

    const orderData: PlaceOrderI = {
      products,
      cartTotal,
      userWalletBalance: walletBalance,
      giftWalletBalance,
      userId,
      storeId,
    }

    await OrderModel.create(orderData)
    await Customer.findOneAndUpdate(
      { _id: user._id },
      { $inc: { walletBalance: -(cartTotal / 100) } },
      { new: true }
    )
    await CartModel.deleteOne({ customerId: user._id })

    redirect("/")
  } catch (error) {CartModel
    if (isRedirectError(error)) throw error

    console.error("PlaceOrder error:", error)
    return { success: false, error: "Something went wrong" }
  }
}