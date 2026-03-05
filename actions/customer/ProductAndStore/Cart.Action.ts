"use server";

import CartModel, { ISubsidyItems } from "@/db/models/customer/cart.model";
import "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import mongoose, { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import OrderModel, {
  PlaceOrderI,
  PlaceOrderProduct,
} from "@/db/models/customer/Orders.Model";
import Customer from "@/db/models/customer/customer.model";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCustomerDataAction } from "../User.action";
import productsModel from "@/db/models/store/products.model";
import { PlaceOrderParams } from "@/types/customer/OrdersClient";
import { ICartItem } from "@/types/customer/CustomerCart";


export const AddtoCart = async (ItemId: string, customerId?: string) => {
  const customerDataresponse = await getCustomerDataAction(customerId);
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

export const IncrementItem = async (
  customerId: string | undefined,
  formData: FormData,
) => {
  const customerDataresponse = await getCustomerDataAction(customerId);
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

export const DecrementItem = async (
  customerId: string | undefined,
  formData: FormData,
) => {
  const customerDataresponse = await getCustomerDataAction(customerId);
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

export const RemoveItem = async (
  customerId: string | undefined,
  formData: FormData,
) => {
  const customerDataresponse = await getCustomerDataAction(customerId);
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

export const getCart = async (customerId?: string): Promise<{
  success: boolean
  items: ICartItem[]
  subItems: ISubsidyItems[]
} | null> => {
  const customerDataresponse = await getCustomerDataAction(customerId);
  const user = customerDataresponse.customerData;
  if (!user) return {success:false, items:[], subItems:[]};

  await dbConnect();
  try {
    const foundCart = await CartModel.findOne({
      customerId: user._id,
    }).populate("items.productId").populate("subsidyItems.productId");

    if (!foundCart) return null;
    return {
    success: true,
    items: foundCart.items as unknown as ICartItem[],
    subItems: foundCart.subsidyItems
  }
    // return foundCart.items;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const PlaceOrder = async ({
  customerId,
  status = "completed",
  paymentMode = "wallet",
  subsidyVal
}: PlaceOrderParams) => {
  await dbConnect();
  
  const customerDataresponse = await getCustomerDataAction(customerId);
  const user = customerDataresponse.customerData;
  const cartItems = (await getCart(customerId)) as ICartItem[] | null;
  if (!user || !cartItems || cartItems.length === 0) return { success: false, message: "Something went wrong!" };

  try {
    const walletBalance = user.walletBalance ?? 0;
    const giftWalletBalance = user.giftWalletBalance ?? 0;

    let totalGST = 0;
    let totalPST = 0;
    let totalDisposableFee = 0;
    let totalBase = 0;

    const products: PlaceOrderProduct[] = cartItems.map((item) => {
      const base = item.productId.price * item.quantity;
      const markupAmount = Math.round(base * (item.productId.markup / 100));
      const subtotalWithMarkup = base + markupAmount;
      const tax = item.productId.tax;
      const dispFee = (item.productId.disposableFee ?? 0)* item.quantity;

      // 0.05 = GST only | 0.07 = PST only | 0.12 = GST + PST
      const gst = tax === 0.05 || tax === 0.12 ? Math.round(subtotalWithMarkup * 0.05) : 0;
      const pst = tax === 0.07 || tax === 0.12 ? Math.round(subtotalWithMarkup * 0.07) : 0;
      totalDisposableFee += dispFee;
      totalBase +=base; 
      totalGST += gst;
      totalPST += pst;

      const disposableFee = item.productId.disposableFee ?? 0;
      const total = subtotalWithMarkup + gst + pst + disposableFee;

      return {
        productId: new Types.ObjectId(item.productId._id),
        quantity: item.quantity,
        markup: item.productId.markup,
        tax: item.productId.tax,
        disposableFee,
        total,
      };
    });

    const cartTotal = products.reduce((sum, item) => sum + item.total, 0);

    if (paymentMode === "wallet" && walletBalance < cartTotal) {
      return { success: false, error: "Insufficient Funds" };
    }

    const orderData: PlaceOrderI = {
      products,
      cartTotal,
      userWalletBalance: walletBalance,
      giftWalletBalance,
      TotalGST: totalGST,
      TotalDisposableFee: totalDisposableFee,
      BaseTotal: totalBase,
      TotalPST: totalPST,
      userId: user._id,
      subsidy: subsidyVal,
      storeId: user.associatedStoreId,
      paymentMode,
      status,
    };

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (paymentMode === "wallet") {
        const updatedCustomer = await Customer.findOneAndUpdate(
          {
            _id: user._id,
            walletBalance: { $gte: cartTotal },
          },
          { $inc: { walletBalance: -cartTotal } },
          { returnDocument: "after", session },
        );

        if (!updatedCustomer) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            error: "Insufficient Funds (Transaction Aborted)",
          };
        }
        orderData.userWalletBalance = updatedCustomer.walletBalance;
      }

      const OrderDetails = await OrderModel.create([orderData], { session });
      // console.log(OrderDetails);
      await CartModel.deleteOne({ customerId: user._id }, { session });

      await session.commitTransaction();
      session.endSession();
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

    if (customerId) {
      redirect(`/cashier/customer/${customerId}`);
    }
    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error while placing order:", error);
    return { success: false, error: "Something went wrong" };
  }
};

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

export const getCartItemsCount = async (customerId?: string) => {
  try {
    await dbConnect();
    const customerDataresponse = await getCustomerDataAction(customerId);
    const user = customerDataresponse.customerData;
    if (!user) return 0;

    const Cart = await CartModel.findOne({ customerId: user._id });
    if (!Cart) return 0;

    const count = Cart.items.length;
    return count;
  } catch (err) {
    console.log(err);
  }
};

export const getSubsidizedProducts = async (customerId?: string) => {
  try {
    await dbConnect();
    const customerDataresponse = await getCustomerDataAction(customerId);
    const user = customerDataresponse.customerData;
    if (!user) return null;

    const getProducts = await productsModel
      .find({ storeId: user.associatedStoreId, subsidised: true })
      .lean();

    const products = JSON.parse(JSON.stringify(getProducts));
    return products;
  } catch (err) {
    console.log(err);
  }
};

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

export const getCartQuantities = async (customerId?: string) => {
  const customerDataResponse = await getCustomerDataAction(customerId);
  const user = customerDataResponse.customerData;
  if (!user) return {};

  await dbConnect();
  try {
    const foundCart = await CartModel.findOne({
      customerId: user._id,
    }).lean();

    if (!foundCart || !foundCart.items) return {};

    const map: Record<string, number> = {};
    foundCart.items.forEach(
      (item: { productId: mongoose.Types.ObjectId; quantity: number }) => {
        map[item.productId.toString()] = item.quantity;
      },
    );
    return map;
  } catch (e) {
    console.error("Error fetching the cart quantity: ", e);
    return {};
  }
};
