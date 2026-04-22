"use server";

import CartModel, { ISubsidyItems } from "@/db/models/customer/cart.model";
import "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import mongoose, { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { getCustomerDataAction, getUser } from "../User.action";
import productsModel from "@/db/models/store/products.model";
import { ICartItem } from "@/types/customer/CustomerCart";
import { CartTotals } from "@/components/shared/users/CheckOutActions";
import { IProduct } from "@/types/store/products.types";
import Customer from "@/db/models/customer/customer.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import OrderModel from "@/db/models/customer/Orders.Model";

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

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const itemId = formData.get("productId");
  const quantityValue = formData.get("quantity");

  if (!itemId || typeof itemId !== "string") {
    return { success: false, message: "Invalid productId" };
  }

  if (quantityValue === null || typeof quantityValue !== "string") {
    return { success: false, message: "Invalid quantity" };
  }

  const trimmedQuantity = quantityValue.trim();

  if (!trimmedQuantity) {
    return { success: false, message: "Quantity is required" };
  }

  await dbConnect();

  const product = await productsModel.findById(itemId).select(
    "_id isMeasuredInWeight",
  );

  if (!product) {
    return { success: false, message: "Product not found" };
  }

  const parsedQuantity = Number(trimmedQuantity);

  if (!Number.isFinite(parsedQuantity)) {
    return { success: false, message: "Invalid quantity" };
  }

  let validatedQuantity: number;

  if (product.isMeasuredInWeight) {
    // Allows: 0, 1, 1.2, 1.25
    // Rejects: .5, 1.234, -1, abc
    const weightRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

    if (!weightRegex.test(trimmedQuantity)) {
      return {
        success: false,
        message:
          "Weighted products must be a valid number with up to 2 decimal places",
      };
    }

    if (parsedQuantity < 0 || parsedQuantity > 99) {
      return { success: false, message: "Quantity must be between 0 and 99" };
    }

    validatedQuantity = Math.round(parsedQuantity * 100) / 100;
  } else {
    // Allows: 0, 1, 2, 99
    // Rejects: 1.2, 1.00, -1, abc
    const pieceRegex = /^(0|[1-9]\d*)$/;

    if (!pieceRegex.test(trimmedQuantity)) {
      return {
        success: false,
        message: "Piece-based products must use whole numbers only",
      };
    }

    if (!Number.isInteger(parsedQuantity)) {
      return {
        success: false,
        message: "Piece-based products must use whole numbers only",
      };
    }

    if (parsedQuantity < 0 || parsedQuantity > 99) {
      return { success: false, message: "Quantity must be between 0 and 99" };
    }

    validatedQuantity = parsedQuantity;
  }

  const cart = await CartModel.findOne({
    customerId: user._id,
  });

  if (!cart) {
    return { success: false, message: "Cart not found" };
  }

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === itemId,
  );

  if (index === -1) {
    return { success: false, message: "Item not found" };
  }

  if (validatedQuantity === 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = validatedQuantity;
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
    if (cart.items.length === 0 && cart.subsidyItems.length === 0) {
      await CartModel.findOneAndDelete({ customerId: user._id });
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
  if (cart.items.length === 0 && cart.subsidyItems.length === 0) {
    await CartModel.findOneAndDelete({ customerId: user._id });
  }
  revalidatePath("/customer/cart");
};

export const getCart = async (
  customerId?: string,
): Promise<{
  success: boolean;
  isSavedtoWallet: boolean;
  items: ICartItem[];
  subItems: ISubsidyItems[];
} | null> => {
  const customerDataresponse = await getCustomerDataAction(customerId);
  const user = customerDataresponse.customerData;
  if (!user)
    return { success: false, isSavedtoWallet: false, items: [], subItems: [] };

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
  receivedCustomerId,
  paymentMode = "pending",
  TotalCart,
}: {
  receivedCustomerId?: string;
  paymentMode?: "wallet" | "pending";
  TotalCart: CartTotals;
}) => {
  await dbConnect();
  const session = await mongoose.startSession();

  try {
    const authSession = await getUserSession();
    if (receivedCustomerId) {
      if (authSession.user.role !== "cashier") {
        return { success: false, message: "Unauthorized" };
      }
    } else {
      if (authSession.user.role !== "customer") {
        return { success: false, message: "Unauthorized" };
      }
    }

    session.startTransaction();

    let customer;
    if (!receivedCustomerId) {
      customer = await Customer.findOne({ userId: authSession.user.id })
        .select("_id")
        .lean()
        .session(session);
      if (!customer) {
        await session.abortTransaction();
        return { success: false, message: "User not found" };
      }
    }

    const customerId = receivedCustomerId ? receivedCustomerId : customer?._id;

    const cashierId = receivedCustomerId ? authSession.user.id : undefined;
    const walletPayment = paymentMode === "wallet";

    const pendingOrder = await OrderModel.findOne({
      userId: customerId,
      status: "pending",
    }).session(session);

    if (pendingOrder) {
      await session.abortTransaction();
      return {
        success: false,
        message: receivedCustomerId
          ? "This customer already has a pending order. Complete or cancel it first to continue."
          : "You already have a pending order. Complete or cancel it first to continue.",
      };
    }

    const User = await Customer.findById(customerId).session(session);
    if (!User) {
      await session.abortTransaction();
      return { success: false, message: "User not found" };
    }
    const customerCart = await CartModel.findOne({ customerId: User._id })
      .populate("items.productId")
      .populate("subsidyItems.productId")
      .session(session);

    if (!customerCart) {
      await session.abortTransaction();
      return { success: false, message: "Cart not found" };
    }

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

      const gst =
        tax === 0.05 || tax === 0.12
          ? Math.round(subtotalWithMarkup * 0.05)
          : 0;

      const pst =
        tax === 0.07 || tax === 0.12
          ? Math.round(subtotalWithMarkup * 0.07)
          : 0;

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
      const afterSubsidy = Math.max(
        item.TotalPrice * item.quantity - item.subsidy,
        0,
      );
      const tax = product.tax;
      const disposableFee = product.disposableFee ?? 0;

      const gst =
        tax === 0.05 || tax === 0.12 ? Math.round(afterSubsidy * 0.05) : 0;

      const pst =
        tax === 0.07 || tax === 0.12 ? Math.round(afterSubsidy * 0.07) : 0;

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

    if (walletPayment && walletBalance < cartTotal) {
      await session.abortTransaction();
      return {
        success: false,
        message:
          "Insufficient wallet balance. Please add funds or choose another payment method.",
      };
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
      subsidyLeft:
        Number(
          (
            (User.giftWalletBalance +
              customerCart.cartSubsidy -
              TotalUsedSubsidy) /
            100
          ).toFixed(2),
        ) * 100,
      subsidyUsed: Number((TotalUsedSubsidy / 100).toFixed(2)) * 100,
      userId: User._id,
      storeId: User.associatedStoreId,
      paymentMode,
      status: receivedCustomerId ? "completed" : "pending",
      ...(receivedCustomerId && { cashierId }),
    };

    await OrderModel.create([OrderData], { session });

    if (walletPayment) {
      await Customer.findByIdAndUpdate(
        customerId,
        {
          $inc: {
            walletBalance: -OrderData.cartTotal,
          },
          $set: {
            giftWalletBalance: OrderData.subsidyLeft,
          },
        },
        { session },
      );
    } else if (receivedCustomerId) {
      await Customer.findByIdAndUpdate(
        customerId,
        {
          $set: {
            giftWalletBalance: OrderData.subsidyLeft,
          },
        },
        { session },
      );
    }

    await CartModel.deleteOne({ customerId: User._id }, { session });

    await session.commitTransaction();
    return { success: true, message: "Order Placed Successfully" };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error while placing order:", error);
    return { success: false, error: "Something went wrong" };
  } finally {
    await session.endSession();
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

    const subsidyItemsCount = Cart.subsidyItems.length;
    const count = Cart.items.length;
    const totalCount = count + subsidyItemsCount;
    return totalCount;
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
