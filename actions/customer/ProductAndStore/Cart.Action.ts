"use server";

import CartModel from "@/db/models/customer/cart.model";
import "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import mongoose, { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import OrderModel, { PlaceOrderI, PlaceOrderProduct } from "@/db/models/customer/Orders.Model";
import Customer from "@/db/models/customer/customer.model";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCustomerDataAction, getUser } from "../User.action";
import productsModel from "@/db/models/store/products.model";
import { ICartItem } from "@/types/customer/CustomerCart";

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
        productId: new Types.ObjectId(item.productId._id),
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
      userId: user._id,
      storeId:user.associatedStoreId,
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

/**
 * Retrieves the total count of unique products currently in the user's cart.
 * * @description
 * This function fetches the current authenticated user and queries the database for their cart. 
 * It returns the total number of distinct products (the length of the cart's `items` array). 
 * Note: It counts unique item entries, not the sum of individual item quantities.
 * * **Use Case:**
 * Perfect for updating the cart icon badge in the navigation header. For example, if a user 
 * has 3 Apples and 2 Bananas, the badge should display "2" to indicate two types of items.
 * * @returns {Promise<number>} The number of unique products in the cart. Returns `0` if the user is unauthenticated or the cart is empty/non-existent.
 * * @example
 * // Cart contains: [{ productId: '123', quantity: 3 }, { productId: '456', quantity: 2 }]
 * const itemCount = await getCartItemsCount();
 * console.log(itemCount); 
 * // Output: 2
 */


export const getCartItemsCount = async () =>{
  try{
    await dbConnect();
    const user = await getUser()
    if(!user) return 0

    const Cart = await CartModel.findOne({ customerId: user._id })
    if(!Cart) return 0

    const count = Cart.items.length;
    return count


  }catch(err){
    console.log(err)
  }
}

export const getSubsidizedProducts = async () =>{
    try{
    await dbConnect();
    const user = await getUser()
    if(!user) return null

    const getProducts = await productsModel.find({storeId: user.associatedStoreId,subsidised: true}).lean();

    const products = JSON.parse(JSON.stringify(getProducts));
    return products

  }catch(err){
    console.log(err)
  }
}

/**
 * Retrieves a dictionary mapping product IDs to their exact quantities in the user's cart.
 * * @description
* This function looks at the user's cart and creates a simple lookup dictionary. 
 * Instead of returning a complex list of items, it gives you a straightforward object 
 * where each Product ID is paired with how many of that product are in the cart.
 * * For example, if a user has 3 Apples (Product ID: "123") and 1 Banana (Product ID: "456") 
 * in their cart, this function transforms that into a simple format: 
 * { "123": 3, "456": 1 }
 * * **Use Case:**
 * Best used on Product Listing Pages (PLPs) or Product Detail Pages (PDPs). It allows the UI 
 * to do a fast `O(1)` lookup to see if a specific product is already in the cart and display 
 * its current quantity in an "Add to Cart" counter (e.g., [ - ] 1 [ + ]).
 * * @returns {Promise<Record<string, number>>} A map of Product IDs (strings) to quantities (numbers). Returns an empty object `{}` if the cart or user is not found.
 * * @example
 * // Cart contains: [{ productId: '60d5ec49', quantity: 3 }, { productId: '60d5ec50', quantity: 1 }]
 * const quantities = await getCartQuantities();
 * console.log(quantities);
 * // Output: { "60d5ec49": 3, "60d5ec50": 1 }
 * * // Usage in UI component:
 * // const currentQty = quantities[product._id] || 0;
 */

export const getCartQuantities = async()=>{
  const customerDataResponse = await getCustomerDataAction();
  const user = customerDataResponse.customerData;
  if(!user) return{};

  await dbConnect();
  try{
    const foundCart = await CartModel.findOne({
      customerId: user._id,
    }).lean();

    if(!foundCart || !foundCart.items) return {};

    const map: Record<string, number> = {};
    foundCart.items.forEach((item: { productId: mongoose.Types.ObjectId; quantity: number }) => {
      map[item.productId.toString()] = item.quantity;
    });
    return map;

  } catch(e){
    console.error("Error fetching the cart quantity: ", e);
    return{};
  }
}