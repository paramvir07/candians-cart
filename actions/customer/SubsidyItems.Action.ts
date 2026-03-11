"use server"

import { dbConnect } from "@/db/dbConnect"
import CartModel, { ISubsidyItems } from "@/db/models/customer/cart.model"
import { IProduct } from "@/types/store/products.types"
import { getUser } from "./User.action"
import { revalidatePath } from "next/cache"
import { Types } from "mongoose"

type PlainSubsidyItem = {
  _id: Types.ObjectId
  productId: Types.ObjectId
  storeId: Types.ObjectId
  quantity: number
  TotalPrice: number
  subsidy: number
  afterSubsidy: number
}

const distributeSubsidy = (items: PlainSubsidyItem[], totalSubsidy: number): PlainSubsidyItem[] => {
  const sorted = [...items].sort(
    (a, b) => (a.TotalPrice * a.quantity) - (b.TotalPrice * b.quantity)
  );

  let remaining = totalSubsidy;

  const distributed = sorted.map((item) => {
    const itemTotal = item.TotalPrice * item.quantity;
    const give = Math.min(remaining, itemTotal);
    remaining -= give;
    return {
      ...item,
      subsidy: give,
      afterSubsidy: Math.max(itemTotal - give, 0),
    };
  });

  return items.map((original) =>
    distributed.find((d) => d._id.toString() === original._id.toString()) ?? original
  );
};


export const saveSubsidytoWallet = async () => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOneAndUpdate(
      { customerId: user._id, isSavedtoWallet: false },
      { $set: { isSavedtoWallet: true } },
      { new: true }
    );

    if (!cart) return { success: true, message: "Preference already been saved" };

    revalidatePath("/customer/cart");
    return { success: true, message: "Preference saved" };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Error while saving subsidy amount to wallet" };
  }
};


export const AddSubsidyItem = async (selectedProducts: IProduct[], totalSubsidy: number) => {
  try {
    await dbConnect();

    const CurrentUser = await getUser();
    if (!CurrentUser) {
      return { success: false, message: "Adding Subsidy Item Action : Error fetching User" };
    }

    const storeId = CurrentUser.associatedStoreId;
    const cart = await CartModel.findOne({ customerId: CurrentUser._id });
    const existingSubsidyItems = (cart?.subsidyItems ?? []) as (ISubsidyItems & { toObject: () => PlainSubsidyItem })[];

    const newProducts = selectedProducts.filter(
      (p) => !existingSubsidyItems.some((s) => s.productId.toString() === p._id.toString())
    );

    const updatedExistingItems: PlainSubsidyItem[] = existingSubsidyItems.map((item) => {
      const plain = item.toObject();
      const isBeingAdded = selectedProducts.some(
        (p) => p._id.toString() === plain.productId.toString()
      );
      const newQty = isBeingAdded ? plain.quantity + 1 : plain.quantity;
      return { ...plain, quantity: newQty };
    });

    const newItems: PlainSubsidyItem[] = newProducts.map((item) => {
      const totalPrice = item.price + Math.round(item.price * (item.markup / 100));
      return {
        _id: new Types.ObjectId(),
        productId: item._id as unknown as Types.ObjectId,
        storeId: storeId as unknown as Types.ObjectId,
        quantity: 1,
        TotalPrice: totalPrice,
        subsidy: 0,
        afterSubsidy: totalPrice,
      };
    });

    const allItems = [...updatedExistingItems, ...newItems];
    const distributed = distributeSubsidy(allItems, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId: CurrentUser._id },
      { $set: { subsidyItems: distributed } },
      { upsert: true }
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Subsidy Item Added Successfully" };

  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to add subsidy item" };
  }
};


export const IncrementSubsidyItem = async (productId: string) => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOne({ customerId: user._id });
    if (!cart) return { success: false, message: "Cart not found" };

    const totalSubsidy = cart.subsidyItems.reduce((sum, i) => sum + i.subsidy, 0);

    const plainItems: PlainSubsidyItem[] = cart.subsidyItems.map(
      (s) => (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject()
    );

    const updated = plainItems.map((s) =>
      s.productId.toString() === productId ? { ...s, quantity: s.quantity + 1 } : s
    );

    const distributed = distributeSubsidy(updated, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: distributed } }
    );

    revalidatePath("/customer/cart");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Increment failed" };
  }
};


export const DecrementSubsidyItem = async (productId: string) => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOne({ customerId: user._id });
    if (!cart) return { success: false, message: "Cart not found" };

    const totalSubsidy = cart.subsidyItems.reduce((sum, i) => sum + i.subsidy, 0);
    const item = cart.subsidyItems.find((i) => i.productId.toString() === productId);

    if (!item || item.quantity <= 1) {
      const remaining = cart.subsidyItems
        .filter((i) => i.productId.toString() !== productId)
        .map((s) => (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject());

      if (remaining.length === 0 && cart.items.length === 0) {
        await CartModel.findOneAndDelete({ customerId: user._id });
        revalidatePath("/customer/cart");
        return { success: true };
      }

      const distributed = distributeSubsidy(remaining, totalSubsidy);

      await CartModel.findOneAndUpdate(
        { customerId: user._id },
        { $set: { subsidyItems: distributed } }
      );

    } else {
      const plainItems: PlainSubsidyItem[] = cart.subsidyItems.map(
        (s) => (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject()
      );

      const updated = plainItems.map((s) =>
        s.productId.toString() === productId ? { ...s, quantity: s.quantity - 1 } : s
      );

      const distributed = distributeSubsidy(updated, totalSubsidy);

      await CartModel.findOneAndUpdate(
        { customerId: user._id },
        { $set: { subsidyItems: distributed } }
      );
    }

    revalidatePath("/customer/cart");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Decrement failed" };
  }
};


export const RemoveSubsidyItem = async (productId: string) => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOne({ customerId: user._id });
    if (!cart) return { success: false, message: "Cart not found" };

    const totalSubsidy = cart.subsidyItems.reduce((sum, i) => sum + i.subsidy, 0);

    const remaining = cart.subsidyItems
      .filter((i) => i.productId.toString() !== productId)
      .map((s) => (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject());

    if (remaining.length === 0 && cart.items.length === 0) {
      await CartModel.findOneAndDelete({ customerId: user._id });
      revalidatePath("/customer/cart");
      return { success: true };
    }

    const distributed = distributeSubsidy(remaining, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: distributed } }
    );

    revalidatePath("/customer/cart");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Remove failed" };
  }
};


export const ClearAllSubsidyItems = async () => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: [] } }
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Subsidy Items cleared successfully" };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Error while clearing SubsidyItems" };
  }
};


export const updateCartSubsidy = async (subsidy: number) => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { cartSubsidy: subsidy } }
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Subsidy Updated" };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Error while updating subsidy" };
  }
};


export const movetoSubsidy = async (ProductId: string, totalSubsidy: number) => {
  try {
    await dbConnect();

    const User = await getUser();
    if (!User) return { message: "User not found", success: false };
    const customerId = User._id;

    const cart = await CartModel.findOne({ customerId })
      .populate("items.productId")
      .populate("subsidyItems.productId");

    if (!cart) return { success: false, message: "Cart not found" };

    const index = cart.items.findIndex(
      (item) => item.productId._id.toString() === ProductId
    );

    if (index === -1) return { success: false, message: "Item not found" };

    const [item] = cart.items.splice(index, 1);
    const product = item.productId as unknown as IProduct;

    const TotalPrice = product.price + Math.round(product.price * (product.markup / 100));

    const existingPlain: PlainSubsidyItem[] = cart.subsidyItems.map(
      (s) => (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject()
    );

    const allItems: PlainSubsidyItem[] = [
      ...existingPlain,
      {
        _id: new Types.ObjectId(),
        productId: product._id as unknown as Types.ObjectId,
        storeId: item.storeId as unknown as Types.ObjectId,
        quantity: item.quantity,
        TotalPrice,
        subsidy: 0,
        afterSubsidy: TotalPrice * item.quantity,
      },
    ];

    const distributed = distributeSubsidy(allItems, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId },
      { $set: { items: cart.items, subsidyItems: distributed } }
    );

    revalidatePath("/customer/cart");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Failed to move item" };
  }
};