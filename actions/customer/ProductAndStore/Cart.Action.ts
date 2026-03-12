"use server";

import CartModel, { ISubsidyItems } from "@/db/models/customer/cart.model";
import "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import mongoose, { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import OrderModel, {
  PlaceOrderProduct,
} from "@/db/models/customer/Orders.Model";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCustomerDataAction, getUser } from "../User.action";
import productsModel from "@/db/models/store/products.model";
import {
  PlaceOrderParams,
  PlaceOrderResponse,
} from "@/types/customer/OrdersClient";
import { ICartItem } from "@/types/customer/CustomerCart";
import { Cashier } from "@/db/models/cashier/cashier.model";
import { CartTotals } from "@/components/shared/users/CheckOutActions";
import { IProduct } from "@/types/store/products.types";
import Customer from "@/db/models/customer/customer.model";

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

export const UpdateItemQuantity = async (
  customerId: string | undefined,
  formData: FormData,
) => {
  const customerDataresponse = await getCustomerDataAction(customerId);
  const user = customerDataresponse.customerData;
  if (!user) return { success: false, message: "User not found" };

  const itemId = formData.get("productId");
  const quantityValue = formData.get("quantity");

  if (!itemId || typeof itemId !== "string") {
    throw new Error("Invalid productId");
  }

  if (
    quantityValue === null ||
    typeof quantityValue !== "string" ||
    Number.isNaN(Number(quantityValue))
  ) {
    throw new Error("Invalid quantity");
  }

  const quantity = Math.max(0, Math.min(99, Number(quantityValue)));

  await dbConnect();

  const cart = await CartModel.findOne({
    customerId: user._id,
  });

  if (!cart) return { success: false, message: "Cart not found" };

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === itemId,
  );

  if (index === -1) return { success: false, message: "Item not found" };

  if (quantity === 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = quantity;
  }

  await cart.save();

  revalidatePath("/customer/cart");

  return { success: true, message: "Cart quantity updated" };
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
    if(cart.items.length === 0 && cart.subsidyItems.length === 0){
      await CartModel.findOneAndDelete({customerId:user._id})
    }
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
  if(cart.items.length === 0 && cart.subsidyItems.length === 0){
      await CartModel.findOneAndDelete({customerId:user._id})
  }
  revalidatePath("/customer/cart");
};

export const getCart = async (
  customerId?: string,
): Promise<{
  success: boolean;
  isSavedtoWallet: boolean,
  items: ICartItem[];
  subItems: ISubsidyItems[];
} | null> => {
  const customerDataresponse = await getCustomerDataAction(customerId);
  const user = customerDataresponse.customerData;
  if (!user) return { success: false,isSavedtoWallet:false, items: [], subItems: [] };

  await dbConnect();
  try {
    const foundCart = await CartModel.findOne({
      customerId: user._id,
    })
      .populate("items.productId")
      .populate("subsidyItems.productId");

    if (!foundCart) return null;
    return {
      success: true,
      isSavedtoWallet: foundCart.isSavedtoWallet,
      items: foundCart.items as unknown as ICartItem[],
      subItems: foundCart.subsidyItems,
    };
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
  getCashierId,
  subsidyVal,
}: PlaceOrderParams): PlaceOrderResponse => {
  await dbConnect();
  const customerDataresponse = await getCustomerDataAction(
    customerId,
    getCashierId,
  );
  const user = customerDataresponse.customerData;
  const cartItemsResponse = await getCart(customerId);
  if (!cartItemsResponse)
    return { success: false, error: "Cart items not found" };

  const cartItems: ICartItem[] = cartItemsResponse?.items;

  if (!user || !cartItems || cartItems.length === 0)
    return { success: false, message: "Something went wrong!" };

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
      const dispFee = (item.productId.disposableFee ?? 0) * item.quantity;

      // 0.05 = GST only | 0.07 = PST only | 0.12 = GST + PST
      const gst =
        tax === 0.05 || tax === 0.12
          ? Math.round(subtotalWithMarkup * 0.05)
          : 0;
      const pst =
        tax === 0.07 || tax === 0.12
          ? Math.round(subtotalWithMarkup * 0.07)
          : 0;
      totalDisposableFee += dispFee;
      totalBase += base;
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

    let orderData;
    if (customerId) {
      const cashier = await Cashier.findOne({
        userId: customerDataresponse.cashierUserId,
      })
        .select("_id")
        .lean();

      if (!Cashier) return { success: false, error: "Cashier not found" };

      orderData = {
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
        cashierId: cashier?._id,
      };
    } else {
      orderData = {
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
    }

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
    return { success: true, message: "Order Placed Successfully" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error while placing order:", error);
    return { success: false, error: "Something went wrong" };
  }
};

export const PlaceCustomerOrder = async ({ TotalCart }: { TotalCart: CartTotals }) => {
  try {
    await dbConnect();
    const User = await getUser();
    if (!User) return { success: false, message: "User not found" };

    const customerCart = await CartModel.findOne({ customerId: User._id })
      .populate("items.productId")
      .populate("subsidyItems.productId");
    if (!customerCart) return { success: false, message: "Cart not found" };

    const CartItems = customerCart.items as unknown as ICartItem[];
    const SubItems = customerCart.subsidyItems;

    let baseTotal = 0;
    let TotalUsedSubsidy = 0;

    const products = CartItems.map((item) => {
      const base = item.productId.price * item.quantity;
      const markup = Math.round(base * (item.productId.markup / 100));
      const subtotalWithMarkup = base + markup;
      const tax = item.productId.tax;
      const disposableFee = item.productId.disposableFee ?? 0;

      const gst = tax === 0.05 || tax === 0.12 ? Math.round(subtotalWithMarkup * 0.05) : 0;
      const pst = tax === 0.07 || tax === 0.12 ? Math.round(subtotalWithMarkup * 0.07) : 0;

      baseTotal += base;

      return {
        productId: new Types.ObjectId(item.productId._id),
        quantity: item.quantity,
        markup: item.productId.markup,
        tax,
        disposableFee,
        subsidy: 0,
        total: subtotalWithMarkup + gst + pst + disposableFee,
      };
    });

    const subsidyItems = SubItems.map((item) => {
      const product = item.productId as unknown as IProduct;
      const afterSubsidy = Math.max((item.TotalPrice * item.quantity) - item.subsidy, 0);
      const tax = product.tax;
      const disposableFee = product.disposableFee ?? 0;

      const gst = tax === 0.05 || tax === 0.12 ? Math.round(afterSubsidy * 0.05) : 0;
      const pst = tax === 0.07 || tax === 0.12 ? Math.round(afterSubsidy * 0.07) : 0;

      baseTotal += product.price * item.quantity;
      TotalUsedSubsidy += item.subsidy;

      return {
        productId: new Types.ObjectId(product._id),
        quantity: item.quantity,
        markup: product.markup,
        tax,
        disposableFee,
        subsidy: item.subsidy,
        total: afterSubsidy + gst + pst + disposableFee,
      };
    });


    const cartTotal = TotalCart.total;
    const walletBalance = User.walletBalance ?? 0;

    if (walletBalance < cartTotal) {
      return { success: false, message: "Insufficient Funds" };
    }

    const OrderData = {
      products,
      subsidyItems,
      TotalGST: TotalCart.gst,
      TotalPST: TotalCart.pst,
      TotalDisposableFee: TotalCart.disposable,
      BaseTotal: baseTotal,
      cartTotal,
      subsidy: customerCart.cartSubsidy,
      subsidyLeft:Number((((User.giftWalletBalance ?? 0) + (customerCart.cartSubsidy ?? 0)-TotalUsedSubsidy)/100).toFixed(2))*100,
      susbsidyUsed:Number((TotalUsedSubsidy / 100).toFixed(2))*100,
      userId: User._id,
      storeId: User.associatedStoreId,
      paymentMode: "wallet",
      status: "pending",
      userWalletBalance: walletBalance,
      giftWalletBalance: (User.giftWalletBalance ?? 0) + (customerCart.cartSubsidy ?? 0)
    };

      await OrderModel.create([OrderData]);
      await CartModel.deleteOne({ customerId: User._id });
      revalidatePath("/customer/cart");
      return { success: true, message: "Order Placed Successfully" };

  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong" };
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

