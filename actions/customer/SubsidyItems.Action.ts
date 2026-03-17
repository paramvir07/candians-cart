"use server";

import { dbConnect } from "@/db/dbConnect";
import CartModel, { ISubsidyItems } from "@/db/models/customer/cart.model";
import CustomerModel from "@/db/models/customer/customer.model";
import { IProduct } from "@/types/store/products.types";
import { getUser } from "./User.action";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import productsModel from "@/db/models/store/products.model";

type PlainSubsidyItem = {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  storeId: Types.ObjectId;
  quantity: number;
  TotalPrice: number;
  subsidy: number;
  afterSubsidy: number;
};

const distributeSubsidy = (
  items: PlainSubsidyItem[],
  totalSubsidy: number,
): PlainSubsidyItem[] => {
  const sorted = [...items].sort(
    (a, b) => a.TotalPrice * a.quantity - b.TotalPrice * b.quantity,
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

  return items.map(
    (original) =>
      distributed.find((d) => d._id.toString() === original._id.toString()) ??
      original,
  );
};

const getTotalSubsidy = async (customerId: Types.ObjectId): Promise<number> => {
  const [cart, customer] = await Promise.all([
    CartModel.findOne({ customerId }).select("cartSubsidy"),
    CustomerModel.findById(customerId).select("giftWalletBalance"),
  ]);

  const cartSubsidy = cart?.cartSubsidy ?? 0;
  const giftWallet = Math.round(customer?.giftWalletBalance ?? 0);

  return cartSubsidy + giftWallet;
};

export const saveSubsidytoWallet = async (customerId?: string) => {
  try {
    await dbConnect();

    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOneAndUpdate(
      { customerId: user._id, isSavedtoWallet: false },
      { $set: { isSavedtoWallet: true } },
      { returnDocument: "after" },
    );

    if (!cart)
      return { success: true, message: "Preference already been saved" };

    revalidatePath("/customer/cart");
    return { success: true, message: "Preference saved" };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Error while saving subsidy amount to wallet",
    };
  }
};

export const AddSubsidyItem = async (
  selectedProducts: IProduct[],
  totalSubsidy: number,
  customerId?: string,
) => {
  try {
    await dbConnect();

    const CurrentUser = await getUser(customerId);
    if (!CurrentUser) {
      return {
        success: false,
        message: "Adding Subsidy Item Action : Error fetching User",
      };
    }

    const storeId = CurrentUser.associatedStoreId;
    const cart = await CartModel.findOne({ customerId: CurrentUser._id });
    const existingSubsidyItems = (cart?.subsidyItems ??
      []) as (ISubsidyItems & { toObject: () => PlainSubsidyItem })[];

    const newProducts = selectedProducts.filter(
      (p) =>
        !existingSubsidyItems.some(
          (s) => s.productId.toString() === p._id.toString(),
        ),
    );

    const updatedExistingItems: PlainSubsidyItem[] = existingSubsidyItems.map(
      (item) => {
        const plain = item.toObject();
        const isBeingAdded = selectedProducts.some(
          (p) => p._id.toString() === plain.productId.toString(),
        );
        const newQty = isBeingAdded ? plain.quantity + 1 : plain.quantity;
        return { ...plain, quantity: newQty };
      },
    );

    const newItems: PlainSubsidyItem[] = newProducts.map((item) => {
      const totalPrice =
        item.price + Math.round(item.price * (item.markup / 100));
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
      { upsert: true },
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Subsidy Item Added Successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to add subsidy item" };
  }
};

export const IncrementSubsidyItem = async (
  productId: string,
  customerId?: string,
) => {
  try {
    await dbConnect();

    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };

    const [cart, totalSubsidy] = await Promise.all([
      CartModel.findOne({ customerId: user._id }),
      getTotalSubsidy(user._id),
    ]);
    if (!cart) return { success: false, message: "Cart not found" };

    const plainItems: PlainSubsidyItem[] = cart.subsidyItems.map((s) =>
      (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject(),
    );

    const updated = plainItems.map((s) =>
      s.productId.toString() === productId
        ? { ...s, quantity: s.quantity + 1 }
        : s,
    );

    const distributed = distributeSubsidy(updated, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: distributed } },
    );

    revalidatePath("/customer/cart");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Increment failed" };
  }
};

export const DecrementSubsidyItem = async (
  productId: string,
  customerId?: string,
) => {
  try {
    await dbConnect();

    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };

    const [cart, totalSubsidy] = await Promise.all([
      CartModel.findOne({ customerId: user._id }),
      getTotalSubsidy(user._id),
    ]);
    if (!cart) return { success: false, message: "Cart not found" };

    const item = cart.subsidyItems.find(
      (i) => i.productId.toString() === productId,
    );

    if (!item || item.quantity <= 1) {
      const remaining = cart.subsidyItems
        .filter((i) => i.productId.toString() !== productId)
        .map((s) =>
          (
            s as ISubsidyItems & { toObject: () => PlainSubsidyItem }
          ).toObject(),
        );

      if (remaining.length === 0 && cart.items.length === 0) {
        await CartModel.findOneAndDelete({ customerId: user._id });
        revalidatePath("/customer/cart");
        return { success: true };
      }

      const distributed = distributeSubsidy(remaining, totalSubsidy);

      await CartModel.findOneAndUpdate(
        { customerId: user._id },
        { $set: { subsidyItems: distributed } },
      );
    } else {
      const plainItems: PlainSubsidyItem[] = cart.subsidyItems.map((s) =>
        (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject(),
      );

      const updated = plainItems.map((s) =>
        s.productId.toString() === productId
          ? { ...s, quantity: s.quantity - 1 }
          : s,
      );

      const distributed = distributeSubsidy(updated, totalSubsidy);

      await CartModel.findOneAndUpdate(
        { customerId: user._id },
        { $set: { subsidyItems: distributed } },
      );
    }

    revalidatePath("/customer/cart");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Decrement failed" };
  }
};

export const RemoveSubsidyItem = async (
  productId: string,
  customerId?: string,
) => {
  try {
    await dbConnect();

    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };

    const [cart, totalSubsidy] = await Promise.all([
      CartModel.findOne({ customerId: user._id }),
      getTotalSubsidy(user._id),
    ]);
    if (!cart) return { success: false, message: "Cart not found" };

    const remaining = cart.subsidyItems
      .filter((i) => i.productId.toString() !== productId)
      .map((s) =>
        (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject(),
      );

    if (remaining.length === 0 && cart.items.length === 0) {
      await CartModel.findOneAndDelete({ customerId: user._id });
      revalidatePath("/customer/cart");
      return { success: true };
    }

    const distributed = distributeSubsidy(remaining, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: distributed } },
    );

    revalidatePath("/customer/cart");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Remove failed" };
  }
};

export const ClearAllSubsidyItems = async (customerId?: string) => {
  try {
    await dbConnect();
 
    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };
 
    const cart = await CartModel.findOne({ customerId: user._id }).lean();
    if (!cart) return { success: false, message: "Cart not found" };
 
    if (cart.items.length === 0) {
      await CartModel.findOneAndDelete({ customerId: user._id });
    } else {
      await CartModel.findOneAndUpdate(
        { customerId: user._id },
        { $set: { subsidyItems: [], cartSubsidy: 0 } },
      );
    }
 
    revalidatePath("/customer/cart");
    return { success: true, message: "Subsidy Items cleared successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error while clearing SubsidyItems" };
  }
};


export const updateCartSubsidy = async (
  subsidy: number,
  customerId?: string,
) => {
  try {
    await dbConnect();

    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { cartSubsidy: subsidy } },
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Subsidy Updated" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error while updating subsidy" };
  }
};

export const movetoSubsidy = async (
  ProductId: string,
  receivedcustomerId?: string,
) => {
  try {
    await dbConnect();

    const User = await getUser(receivedcustomerId);
    if (!User) return { message: "User not found", success: false };
    const customerId = User._id;

    const [cart, totalSubsidy] = await Promise.all([
      CartModel.findOne({ customerId })
        .populate("items.productId")
        .populate("subsidyItems.productId"),
      getTotalSubsidy(customerId),
    ]);

    if (!cart) return { success: false, message: "Cart not found" };

    const index = cart.items.findIndex(
      (item) => item.productId._id.toString() === ProductId,
    );

    if (index === -1) return { success: false, message: "Item not found" };
    


    const [item] = cart.items.splice(index, 1);
    const product = item.productId as unknown as IProduct;
    const TotalPrice =
      product.price + Math.round(product.price * (product.markup / 100));

      if(User.giftWalletBalance === 0 && cart.cartSubsidy === 0){
        return {success:false, message: "insufficient gift Wallet Balance"}
      }

    const alreadyInSubsidy = cart.subsidyItems.find(
      (s) =>
        (s.productId as unknown as IProduct)._id.toString() ===
        product._id.toString(),
    );

    const existingPlain: PlainSubsidyItem[] = cart.subsidyItems.map((s) =>
      (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject(),
    );

    const allItems: PlainSubsidyItem[] = alreadyInSubsidy
      ? existingPlain.map((s) => {
          const itemProductId =
            (
              s.productId as unknown as { _id: Types.ObjectId }
            )?._id?.toString() ?? s.productId.toString();
          return itemProductId === product._id.toString()
            ? { ...s, quantity: s.quantity + item.quantity }
            : s;
        })
      : [
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
      { $set: { items: cart.items, subsidyItems: distributed } },
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Item moved successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Failed to move item" };
  }
};


export const AddToSubsidyCart = async (
  ItemId: string,
  customerId?: string,
) => {
  try {
    await dbConnect();

    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };

    const [cart, totalSubsidy] = await Promise.all([
      CartModel.findOne({ customerId: user._id }),
      getTotalSubsidy(user._id),
    ]);

    // Fetch product for price calculation
    const product = await productsModel.findById(ItemId).lean();
    if (!product) return { success: false, message: "Product not found" };

    // Check user has subsidy available
    if (user.giftWalletBalance === 0 && (cart?.cartSubsidy ?? 0) === 0) {
      return { success: false, message: "Insufficient gift wallet balance" };
    }

    const TotalPrice =
      product.price + Math.round(product.price * (product.markup / 100));

    const existingPlain: PlainSubsidyItem[] = (cart?.subsidyItems ?? []).map(
      (s) =>
        (s as ISubsidyItems & { toObject: () => PlainSubsidyItem }).toObject(),
    );

    const existingIdx = existingPlain.findIndex(
      (s) => s.productId.toString() === ItemId,
    );

    let allItems: PlainSubsidyItem[];

    if (existingIdx > -1) {
      // Already in subsidy cart — increment quantity
      allItems = existingPlain.map((s, i) =>
        i === existingIdx ? { ...s, quantity: s.quantity + 1 } : s,
      );
    } else {
      // New item — add it
      allItems = [
        ...existingPlain,
        {
          _id: new Types.ObjectId(),
          productId: new Types.ObjectId(ItemId),
          storeId: user.associatedStoreId as unknown as Types.ObjectId,
          quantity: 1,
          TotalPrice,
          subsidy: 0,
          afterSubsidy: TotalPrice,
        },
      ];
    }

    const distributed = distributeSubsidy(allItems, totalSubsidy);

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: distributed } },
      { upsert: true },
    );

    revalidatePath("/customer/cart");
    return { success: true, message: "Added to subsidy cart" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to add to subsidy cart" };
  }
};