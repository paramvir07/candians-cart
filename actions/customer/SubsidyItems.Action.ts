"use server"

import { dbConnect } from "@/db/dbConnect"
import CartModel from "@/db/models/customer/cart.model"
import { IProduct } from "@/types/store/products.types"
import { getUser } from "./User.action"
import { revalidatePath } from "next/cache"
import { Types } from "mongoose"


export const saveSubsidytoWallet = async () => {

  try {
    await dbConnect()

    const user = await getUser()
    if (!user) {
      return { success: false, message: "User not found" }
    }

    const cart = await CartModel.findOneAndUpdate(
      {
        customerId: user._id,
        isSavedtoWallet: false
      },
      {
        $set: { isSavedtoWallet: true }
      },
      { new: true }
    )

    if (!cart) {
      return {
        success: true,
        message: "Preference already been saved"
      }
    }

    revalidatePath("/customer/cart")

    return {
      success: true,
      message: `Preference saved`
    }

  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: "Error while saving subsidy amount to wallet"
    }
  }
}


export const AddSubsidyItem = async (
  selectedProducts: IProduct[],
  subsidy: number,
) => {
  try {
    await dbConnect();

    const CurrentUser = await getUser();
    if (!CurrentUser) {
      return { success: false, message: "Adding Subsidy Item Action : Error fetching User" };
    }

    const storeId = CurrentUser.associatedStoreId;

    const cart = await CartModel.findOne({ customerId: CurrentUser._id });
    const existingSubsidyItems = cart?.subsidyItems ?? [];

    const newProducts = selectedProducts.filter(
      (p) => !existingSubsidyItems.some((s: any) => s.productId.toString() === p._id.toString())
    );

    const totalCount = existingSubsidyItems.length + newProducts.length;
    const calcSubsidy = subsidy / (totalCount || 1);

    const updatedExistingItems = existingSubsidyItems.map((item: any) => {
      const plain = item.toObject();
      const isBeingAdded = selectedProducts.some(
        (p) => p._id.toString() === plain.productId.toString()
      );
      const newQty = isBeingAdded ? plain.quantity + 1 : plain.quantity;
      return {
        ...plain,
        quantity: newQty,
        subsidy: calcSubsidy,
        afterSubsidy: Math.max((plain.TotalPrice * newQty) - calcSubsidy, 0),
      };
    });

    const newItems = newProducts.map((item) => {
      const totalPrice = item.price + Math.round(item.price * (item.markup / 100));
      return {
        productId: item._id,
        storeId,
        quantity: 1,
        TotalPrice: totalPrice,
        subsidy: calcSubsidy,
        afterSubsidy: Math.max(totalPrice - calcSubsidy, 0),
      };
    });

    await CartModel.findOneAndUpdate(
      { customerId: CurrentUser._id },
      { $set: { subsidyItems: [...updatedExistingItems, ...newItems] } },
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
    await dbConnect()

    const user = await getUser()
    if (!user) {
      return { success: false, message: "User not found" }
    }

    await CartModel.updateOne(
      {
        customerId: user._id,
        "subsidyItems.productId": new Types.ObjectId(productId),
      } as any,
      {
        $inc: { "subsidyItems.$.quantity": 1 },
      }
    )

    revalidatePath("/customer/cart")
    return { success: true }

  } catch (err) {
    console.log(err)
    return { success: false, message: "Increment failed" }
  }
}

export const DecrementSubsidyItem = async (productId: string, subsidy: number) => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOne({ customerId: user._id });
    if (!cart) return { success: false, message: "Cart not found" };

    const item = cart.subsidyItems.find(
      (i: any) => i.productId.toString() === productId
    );

    if (!item || item.quantity <= 1) {
      const remaining = cart.subsidyItems.filter(
        (i: any) => i.productId.toString() !== productId
      );

      if (remaining.length === 0 && cart.items.length === 0) {
        await CartModel.findOneAndDelete({ customerId: user._id });
        revalidatePath("/", "layout");
        return { success: true };
      }

      const totalSubsidy = subsidy * cart.subsidyItems.length;
      const subsidyPerItem = remaining.length > 0 ? totalSubsidy / remaining.length : 0;

      const rebuilt = remaining.map((s: any) => {
        const plain = s.toObject();
        return {
          ...plain,
          subsidy: subsidyPerItem,
          afterSubsidy: Math.max((plain.TotalPrice * plain.quantity) - subsidyPerItem, 0),
        };
      });

      await CartModel.findOneAndUpdate(
        { customerId: user._id },
        { $set: { subsidyItems: rebuilt } }
      );

    } else {
      await CartModel.updateOne(
        { customerId: user._id, "subsidyItems.productId": new Types.ObjectId(productId) } as any,
        { $inc: { "subsidyItems.$.quantity": -1 } }
      );
    }

    revalidatePath("/", "layout");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Decrement failed" };
  }
};

export const RemoveSubsidyItem = async (productId: string, subsidy: number) => {
  try {
    await dbConnect();

    const user = await getUser();
    if (!user) return { success: false, message: "User not found" };

    const cart = await CartModel.findOne({ customerId: user._id });
    if (!cart) return { success: false, message: "Cart not found" };

    const remaining = cart.subsidyItems.filter(
      (i: any) => i.productId.toString() !== productId
    );

    if (remaining.length === 0 && cart.items.length === 0) {
      await CartModel.findOneAndDelete({ customerId: user._id });
      revalidatePath("/", "layout");
      return { success: true };
    }

    const totalSubsidy = subsidy * cart.subsidyItems.length;
    const subsidyPerItem = remaining.length > 0 ? totalSubsidy / remaining.length : 0;

    const rebuilt = remaining.map((s: any) => {
      const plain = s.toObject();
      return {
        ...plain,
        subsidy: subsidyPerItem,
        afterSubsidy: Math.max((plain.TotalPrice * plain.quantity) - subsidyPerItem, 0),
      };
    });

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      { $set: { subsidyItems: rebuilt } }
    );

    revalidatePath("/", "layout");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Remove failed" };
  }
};

export const ClearSubsidy = async () =>{
  try{
    await dbConnect();

    const user = await getUser();
    if(!user) return {success:false,message:"User not found"}

    await CartModel.findOneAndUpdate(
      { customerId: user._id },
      {
        $set: {
          cartSubsidy: 0
        }
      }
    )

    revalidatePath("/customer/cart");
    return {success:true,message:"Subsidy Items cleared successfully"}   

  }catch(err){
    console.log(err)
    return {success:false,message:"Error while clearing SubsidyItems"}
  }
}

export const updateCartSubsidy = async (subsidy:number) =>{
  try{
    await dbConnect();

    const user = await getUser();
    if(!user) return {success:false,message:"User not found"}

    await CartModel.findOneAndUpdate(
      {customerId:user._id},
      {$set:{cartSubsidy:subsidy}}
    )
    revalidatePath("/customer/cart"); 
    return {success:true, message:"Subsidy Updated"}

  }catch(err){
    console.log(err)
    return {success:false,message:"Error while updating subsidy"}
  }
}

export const movetoSubsidy = async (ProductId: string, subsidyAmount: number) => {
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
    const newTotalCount = cart.subsidyItems.length + 1;
    const calcSubsidy = subsidyAmount / newTotalCount;

    const updatedSubsidyItems = cart.subsidyItems.map((s: any) => {
      const plain = s.toObject();
      return {
        ...plain,
        subsidy: calcSubsidy,
        afterSubsidy: Math.max((plain.TotalPrice * plain.quantity) - calcSubsidy, 0),
      };
    });

    updatedSubsidyItems.push({
      productId: product._id,
      storeId: item.storeId,
      quantity: item.quantity,
      TotalPrice,
      subsidy: calcSubsidy,
      afterSubsidy: Math.max((TotalPrice * item.quantity) - calcSubsidy, 0),
    });

    await CartModel.findOneAndUpdate(
      { customerId },
      {
        $set: {
          items: cart.items,
          subsidyItems: updatedSubsidyItems,
        },
      }
    );

    revalidatePath("/customer/cart");
    return { success: true };

  } catch (err) {
    console.log(err);
    return { success: false, message: "Failed to move item" };
  }
};