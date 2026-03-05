"use server"

import { dbConnect } from "@/db/dbConnect"
import CartModel from "@/db/models/customer/cart.model"
import { IProduct } from "@/types/store/products.types"
import { getUser } from "../User.action"
import { revalidatePath } from "next/cache"

export const AddSubsidyItem = async (
  selectedProducts: IProduct[],    
  subsidy: number,
) => {
  try {
    await dbConnect();

    const CurrentUser = await getUser();
    if (!CurrentUser) {
        return {success:false, message:"Adding Subsidy Item Action : Error fetching User"}
    }

    const storeId = CurrentUser.associatedStoreId;
    
    const calcSubsidy = subsidy/selectedProducts.length;

    const Items = selectedProducts.map((item) => {
    const totalPrice = item.price + (item.price * (item.markup / 100))
    let MinusSubsidyTotal = totalPrice - calcSubsidy;
     
    if(MinusSubsidyTotal < 0){
        // if its less than zero we have some left off subsidy
        const LeftOff = Math.abs(MinusSubsidyTotal);
        // add back to gift wallet or show in the ui
        MinusSubsidyTotal = 0;
    }

    return {
        productId: item._id,
        storeId: storeId,
        quantity: 1,
        TotalPrice: totalPrice,
        subsidy: calcSubsidy,
        afterSubsidy: MinusSubsidyTotal
    }
    })

        await CartModel.findOneAndUpdate(
        { customerId: CurrentUser._id },
        {
            $push: {
            subsidyItems: {
                $each: Items
            }
            }
        },
        { returnDocument: 'after', upsert: true }
        );
        
        revalidatePath('/customer/cart')
        return {success:true, message:"Subsidy Item Added Successfully"}

  } catch (error) {
    console.log(error)
  }
}