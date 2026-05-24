"use server"

import { dbConnect } from "@/db/dbConnect";
import { getCustomerDataAction } from "../customer/User.action";
import { MiscellaneousItemsModel } from "@/db/models/customer/MiscItem.model";
import { getCart } from "../customer/ProductAndStore/Cart.Action";
import CartModel from "@/db/models/customer/cart.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

interface MiscItemFormData {
  productName: string;
  primaryUPC?: string;
  price: number;
  quantity: number;
}

export const createMiscProduct = async (data: MiscItemFormData, customerId: string) => {
    if (!data) return { success: false, message: "No misc form data" };
    try {
        await dbConnect();
        const user = await getCustomerDataAction(customerId);
        if (!user.customerData) return { success: false, message: "User not found" };

        const StoreId = user.customerData.associatedStoreId;
        if (!StoreId) return { success: false, message: "No associated Store Found" };

        const UPC = data.primaryUPC || "";

        const MiscProduct = await MiscellaneousItemsModel.create({
            storeId: StoreId,
            price: data.price,
            productName: data.productName,
            primaryUPC: UPC,
        });
        if (!MiscProduct) return { success: false, message: "Error creating Misc product" };

        const UserCart = await getCart(customerId);
        if (!UserCart) return { success: false, message: "Cart not found" };

        await CartModel.findOneAndUpdate(
            { customerId:user.customerData._id },
            {
                $push: {
                    miscItems: {
                        itemId: MiscProduct._id,
                        quantity: data.quantity,
                        priceAtAdd: MiscProduct.price,
                    },
                },
            }
        );

        return { success: true, message: "Misc Item added" };
    } catch (err) {
        console.log(err);
        return { success: false, message: "Error creating Misc product" };
    }
};

export const IncrementMiscItem = async (itemId: string, customerId?: string) => {
  const { customerData: user } = await getCustomerDataAction(customerId);
  if (!user) return;

  await dbConnect();

  await CartModel.findOneAndUpdate(
    { customerId: user._id, "miscItems.itemId": new mongoose.Types.ObjectId(itemId) } as any,
    { $inc: { "miscItems.$.quantity": 1 } }
  );

  revalidatePath("/cashier/customer/[customerId]/cart", "page");
};

export const DecrementMiscItem = async (itemId: string, customerId?: string) => {
  const { customerData: user } = await getCustomerDataAction(customerId);
  if (!user) return;

  await dbConnect();

  const cart = await CartModel.findOne({
    customerId: user._id,
    "miscItems.itemId": new mongoose.Types.ObjectId(itemId),
  } as any);
  if (!cart) return;

  const item = cart.miscItems.find((i) => i.itemId.toString() === itemId);
  if (!item) return;

  if (item.quantity > 1) {
    await CartModel.findOneAndUpdate(
      { customerId: user._id, "miscItems.itemId": new mongoose.Types.ObjectId(itemId) } as any,
      { $inc: { "miscItems.$.quantity": -1 } }
    );
  } else {
    await CartModel.findOneAndUpdate(
      { customerId: user._id } as any,
      { $pull: { miscItems: { itemId: new mongoose.Types.ObjectId(itemId) } } }
    );
  }

  revalidatePath("/cashier/customer/[customerId]/cart", "page");
};

export const RemoveMiscItem = async (itemId: string, customerId?: string) => {
  const { customerData: user } = await getCustomerDataAction(customerId);
  if (!user) return;

  await dbConnect();

  await CartModel.findOneAndUpdate(
    { customerId: user._id } as any,
    { $pull: { miscItems: { itemId: new mongoose.Types.ObjectId(itemId) } } }
  );

  revalidatePath("/cashier/customer/[customerId]/cart", "page");
};