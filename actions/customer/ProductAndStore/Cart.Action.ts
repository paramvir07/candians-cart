"use server"

import CartModel from "@/db/models/customer/cart.model";
import "@/db/models/store/products.model"
import { getUser } from "../User.action";
import { dbConnect } from "@/db/dbConnect";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export const AddtoCart = async (ItemId: string) => {

  const user = await getUser();
  if (!user) return null;
  
  if (!user.associatedStoreId) throw new Error("No store assigned");
  
  try {
      await dbConnect();
      const productObjectId = new mongoose.Types.ObjectId(ItemId);
      const storeObjectId = new mongoose.Types.ObjectId(
        user.associatedStoreId
      );
    
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
        (item) => item.productId.toString() === ItemId
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
    console.log(error)
    throw error
  }
};

export const IncrementItem = async (formData: FormData) => {
  await dbConnect();

  const user = await getUser();
  if (!user) return;

  const ItemId = formData.get("productId");

  if (!ItemId || typeof ItemId !== "string") {
    throw new Error("Invalid productId");
  }

  const cart = await CartModel.findOne({
    customerId: user._id,
  });

  if (!cart) return;getCart

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === ItemId
  );

  if (index === -1) return;

  if (cart.items[index].quantity < 99) {
    cart.items[index].quantity += 1;
  }

  await cart.save();

  revalidatePath("/customer/cart");
};


export const DecrementItem = async (formData: FormData) => {
  await dbConnect();

  const user = await getUser();
  if (!user) return;

  const ItemId = formData.get("productId");

  if (!ItemId || typeof ItemId !== "string") {
    throw new Error("Invalid productId");
  }

  const cart = await CartModel.findOne({ customerId: user._id });
  if (!cart) return;

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === ItemId
  );

  if (index === -1) return;

  if (cart.items[index].quantity > 1) {
    cart.items[index].quantity -= 1;
  } else {
    cart.items.splice(index, 1);
  }

  await cart.save();
  revalidatePath("/customer/cart")
};

export const RemoveItem = async (formData: FormData)=>{
  await dbConnect();

  const user = await getUser();
  if (!user) return;

  const ItemId = formData.get("productId");

  if (!ItemId || typeof ItemId !== "string") {
    throw new Error("Invalid productId");
  }

  const cart = await CartModel.findOne({ customerId: user._id });
  if (!cart) return;

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === ItemId
  );

  if (index === -1) return;

  if (cart.items[index].quantity >= 1) {
    cart.items.splice(index, 1);
  }
  await cart.save();
  revalidatePath("/customer/cart")
}

export const getCart = async () => {
  await dbConnect();

  const user = await getUser();
  if (!user) return null;

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