"use server";

import CartModel, {
  IMiscCartItem,
  ISubsidyItems,
} from "@/db/models/customer/cart.model";
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
import "@/db/models/customer/MiscItem.model";
import ReferralCode from "@/db/models/admin/referralCode.model";
import { Cashier } from "@/db/models/cashier/cashier.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import { revalidateCustomerCache } from "@/actions/cache/user.cache";

export const AddtoCart = async (
  ItemId: string,
  customerId?: string,
  qty: number = 1,
) => {
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
            quantity: qty,
          },
        ],
      });
      return { success: true };
    }

    const itemIndex = existingCart.items.findIndex(
      (item) => item.productId.toString() === ItemId,
    );

    if (itemIndex > -1) {
      const nextQty = existingCart.items[itemIndex].quantity + qty;
      existingCart.items[itemIndex].quantity = Math.min(nextQty, 99);
    } else {
      existingCart.items.push({
        productId: productObjectId,
        storeId: storeObjectId,
        quantity: qty,
      });
    }
    await existingCart.save();
    revalidatePath("/customer/cart")
    revalidatePath(`/cashier/customer/${user._id}/cart`)

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

  const product = await productsModel
    .findById(itemId)
    .select("_id isMeasuredInWeight");

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

  cart.items.splice(index, 1);

  await cart.save();
  if (
    cart.items.length === 0 &&
    cart.subsidyItems.length === 0 &&
    cart.miscItems.length === 0
  ) {
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
  miscItems: IMiscCartItem[];
} | null> => {
  const customerDataresponse = await getCustomerDataAction(customerId);
  const user = customerDataresponse.customerData;
  if (!user)
    return {
      success: false,
      isSavedtoWallet: false,
      items: [],
      subItems: [],
      miscItems: [],
    };

  await dbConnect();
  try {
    const foundCart = await CartModel.findOne({
      customerId: user._id,
    })
      .populate("items.productId")
      .populate("miscItems.itemId")
      .populate("subsidyItems.productId")
      .lean();

    if (!foundCart) return null;
    const serialized = JSON.parse(JSON.stringify(foundCart));
    return {
      success: true,
      isSavedtoWallet: serialized.isSavedtoWallet,
      items: serialized.items as ICartItem[],
      subItems: serialized.subsidyItems as ISubsidyItems[],
      miscItems: serialized.miscItems as IMiscCartItem[],
    };
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
  console.log(TotalCart);
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

    const User = await Customer.findById(customerId).session(session);
    if (!User) {
      await session.abortTransaction();
      return { success: false, message: "User not found" };
    }
    const customerCart = await CartModel.findOne({ customerId: User._id })
      .populate("items.productId")
      .populate("subsidyItems.productId")
      .populate("miscItems.itemId")
      .session(session);

    if (!customerCart) {
      await session.abortTransaction();
      return { success: false, message: "Cart not found" };
    }

    const CartItems = customerCart.items as unknown as ICartItem[];
    const SubItems = customerCart.subsidyItems;
    const MiscItems = customerCart.miscItems;

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
        total: Math.round(subtotalWithMarkup + gst + pst + disposableFee),
      };
    });

    const subsidyItems = SubItems.map((item) => {
      const product = item.productId as unknown as IProduct;
      const disposableFee = (product.disposableFee ?? 0) * item.quantity;
      const fullPriceWithDisposable = item.TotalPrice * item.quantity;
      const priceForTax = fullPriceWithDisposable - disposableFee;

      const afterSubsidy = Math.max(fullPriceWithDisposable - item.subsidy, 0);
      const tax = product.tax;

      const gst =
        tax === 0.05 || tax === 0.12 ? Math.round(priceForTax * 0.05) : 0;
      const pst =
        tax === 0.07 || tax === 0.12 ? Math.round(priceForTax * 0.07) : 0;

      baseTotal += product.price * item.quantity;
      TotalUsedSubsidy += item.subsidy;

      return {
        productId: new Types.ObjectId(product._id),
        quantity: item.quantity,
        markup: product.markup,
        tax,
        disposableFee,
        subsidy: item.subsidy,
        total: Math.round(afterSubsidy + gst + pst),
      };
    });

    const miscItems = MiscItems.map((item) => {
      const populated = item.itemId as unknown as {
        _id: Types.ObjectId;
        productName: string;
        price: number;
      };

      const total = Math.round(populated.price * item.quantity);

      return {
        miscItemId: new Types.ObjectId(populated._id),
        productName: populated.productName,
        price: populated.price,
        quantity: item.quantity,
        total,
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
    const TotalMarkupAfterSubsidy = TotalCart.totalMarkup - customerCart.cartSubsidy;
    const StoreProfit = Math.floor(TotalMarkupAfterSubsidy * 0.50);
    const PlatformProfit = TotalMarkupAfterSubsidy - StoreProfit;

    const ProfitFields = {
      TotalMarkupAfterSubsidy,
      StoreProfit: StoreProfit,
      PlatformProfit: PlatformProfit
    }

    const PlatformFee = 50;

    const OrderData = {
      products,
      subsidyItems,
      miscItems,
      TotalGST: TotalCart.gst,
      TotalPST: TotalCart.pst,
      TotalDisposableFee: TotalCart.disposable,
      BaseTotal: Math.round(baseTotal),
      cartTotal: Math.round(cartTotal),
      subsidy: customerCart.cartSubsidy,
      subsidyLeft: Math.round(User.giftWalletBalance + customerCart.cartSubsidy - TotalUsedSubsidy),
      subsidyUsed: Math.round(TotalUsedSubsidy),
      userId: User._id,
      storeId: User.associatedStoreId,
      storeProfit: ProfitFields.StoreProfit,
      platformProfit: ProfitFields.PlatformProfit + PlatformFee,
      paymentMode,
      status: receivedCustomerId ? "completed" : "pending",
      ...(receivedCustomerId && { cashierId }),
    };

    if (walletPayment) {
      const updated = await Customer.findOneAndUpdate(
        { _id: customerId, walletBalance: { $gte: OrderData.cartTotal } },
        {
          $inc: { walletBalance: -OrderData.cartTotal },
          $set: { giftWalletBalance: OrderData.subsidyLeft },
        },
        { session, returnDocument: 'after', runValidators: true },
      );

      if (!updated) {
        await session.abortTransaction();
        return { success: false, message: "Insufficient wallet balance." };
      }
    } else if (receivedCustomerId) {
      const updated = await Customer.findOneAndUpdate(
        { _id: customerId },
        {
          $set: { giftWalletBalance: OrderData.subsidyLeft },
        },
        { session, returnDocument: 'after', runValidators: true },
      );

      if (!updated) {
        await session.abortTransaction();
        return { success: false, message: "Error while setting Gift Wallet Amount " };
      }
    }

    await OrderModel.create([OrderData], { session });
    await CartModel.deleteOne({ customerId: User._id }, { session });

    await session.commitTransaction();
    await EnableUserReferralFlag(OrderData.subsidy, User._id.toString(), User.name, User.referralCodeId.toString())
    return { success: true, message: "Order Placed Successfully" };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error while placing order:", error);
    return { success: false, error: "Something went wrong" };
  } finally {
    await session.endSession();
  }
};

const EnableUserReferralFlag = async (
  orderSubsidy: number,
  customerId: string,
  customerName: string,
  userReferralCodeId: string
) => {
  if (!customerId || !orderSubsidy)
    return { success: false, message: "Invalid customerId or subsidy amount" };
  try {
    await dbConnect();

    if (orderSubsidy <= 0)
      return { success: true, message: "No subsidy made, referral flags not enabled" };

    const CustomerData = await Customer.findOneAndUpdate(
      { _id: customerId, placedFirstOrder: false, referralCodeEnabled: false },
      { $set: { referralCodeEnabled: true, placedFirstOrder: true, perReferAmount: 5 } },
      { returnDocument: 'after' },
    ).select("_id perReferAmount").lean();

    if (!CustomerData)
      return { success: true, message: "Referral flags already enabled or customer not found" };

    await Promise.all([
      GenerateReferralCode(customerId, customerName).catch((err) =>
        console.error("GenerateReferralCode failed:", err)
      ),
      CheckUserReferral(userReferralCodeId, CustomerData.perReferAmount).catch((err) =>
        console.error("CheckUserReferral failed:", err)
      ),
    ]);
    await revalidateCustomerCache();
    return { success: true, message: "Referral flags enabled successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error while enabling referral flags" };
  }
};

export const GenerateReferralCode = async (customerId: string, customerName: string) => {
  await dbConnect();

  const namePart = customerName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const candidates = [
    namePart + customerId.slice(-6),
    namePart + customerId.slice(0, 6),
  ];

  const tryCreate = async (code: string) => {
    const exists = await ReferralCode.exists({ code });
    if (!exists) {
      const created = await ReferralCode.create({
        code,
        customerId: new Types.ObjectId(customerId),
        type: "customer",
        isActive: true,
        uses: 0,
        maxUses: 10,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await Customer.findOneAndUpdate(
        { _id: customerId },
        { $set: { myreferralCodeId: created._id } },
      );
      return code;
    }
    return null;
  };

  for (const code of candidates) {
    const result = await tryCreate(code);
    await revalidateCustomerCache();
    if (result) return { success: true, code: result };
  }

  for (let i = 0; i < 10; i++) {
    const code = namePart + Math.random().toString(36).slice(2, 8).toUpperCase();
    const result = await tryCreate(code);
    await revalidateCustomerCache();
    if (result) return { success: true, code: result };
  }

  return { success: false, message: "Could not generate a unique referral code after all attempts" };
};

const CheckUserReferral = async (referralCodeId: string, perReferAmount: number) => {
  if (!referralCodeId) return { success: false, message: "No referral Code Id passed" };

  await dbConnect();
  const session = await mongoose.startSession();

  try {
    const UserSession = await getUserSession();

    const [referral, cashier] = await Promise.all([
      ReferralCode.findById(referralCodeId).lean(),
      Cashier.findOne({ userId: UserSession.user.id }).select("_id").lean(),
    ]);

    if (!referral) return { success: false, message: "Referral not found" };
    if (referral.type === "admin") return { success: false, message: "Referral belongs to admin account" };
    if (!referral.customerId) return { success: false, message: "Referral code has no associated customer" };
    if (!cashier) return { success: false, message: "Failed to get cashierId" };

    const maxUsesReached = referral.maxUses != null && referral.uses >= referral.maxUses;
    const isExpired = referral.expiresAt != null && Date.now() >= referral.expiresAt.getTime();
    if (maxUsesReached || isExpired) {
      return { success: false, message: "Referral code is expired or has reached its maximum uses" };
    }

    const ReferralValue = Math.round(perReferAmount*100);
    if (typeof ReferralValue !== "number" || !Number.isFinite(ReferralValue) || ReferralValue <= 0) {
      return { success: false, message: "Invalid referral value" };
    }

    const customerId = referral.customerId.toString();

    session.startTransaction();
    await WalletTopUp.create(
      [{ customerId, userId: cashier._id.toString(), userRole: "cashier", value: ReferralValue, paymentMode: "referral" }],
      { session },
    );
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { walletBalance: ReferralValue } },
      { session, runValidators: true },
    );
    await ReferralCode.findByIdAndUpdate(
      referralCodeId,
      { $inc: { uses: 1 } },
      { session },
    );

    await session.commitTransaction();
    await revalidateCustomerCache();
    return { success: true, message: "Referral topup created" };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error(error);
    return { success: false, message: "Error on CheckUserReferral" };
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

export const ClearCart = async (customerId?: string) => {
  try {
    await dbConnect();
 
    const user = await getUser(customerId);
    if (!user) return { success: false, message: "User not found" };
 
    await CartModel.findOneAndDelete({ customerId: user._id });
 
    revalidatePath("/customer/cart");
    if (customerId) revalidatePath(`/cashier/customer/${customerId}/cart`);
 
    return { success: true, message: "Cart cleared successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error while clearing cart" };
  }
};
 