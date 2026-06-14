"use server"

import { dbConnect } from "@/db/dbConnect";
import { getCustomerDataAction } from "../customer/User.action";
import { MiscellaneousItemsModel } from "@/db/models/customer/MiscItem.model";
import { getCart } from "../customer/ProductAndStore/Cart.Action";
import CartModel from "@/db/models/customer/cart.model";
import { revalidatePath, revalidateTag } from "next/cache";
import mongoose from "mongoose";
import productsModel from "@/db/models/store/products.model";
import { getUserSession } from "../auth/getUserSession.actions";
import z from "zod";

interface MiscItemFormData {
  productName: string;
  primaryUPC?: string;
  price: number;
  quantity: number;
  tax:number;
}

interface ProductFormData {
  storeId: string;
  miscItemId: string;
  name: string;
  primaryUPC?: string;
  price: number;
  markup: number;
  tax: number;
  disposableFee: number;
  description: string;
  category: string;
  stock: boolean;
  subsidised: boolean;
  isFeatured: boolean;
  isMeasuredInWeight: boolean;
  UOM?: string;
  PriceDrop: boolean;
}

export const createMiscProduct = async (data: MiscItemFormData, customerId: string) => {
    if (!data) return { success: false, message: "No misc form data" };
    try {
        await dbConnect();
        const user = await getCustomerDataAction(customerId);
        if (!user.customerData) return { success: false, message: "User not found" };

        const StoreId = user.customerData.associatedStoreId;
        if (!StoreId) return { success: false, message: "No associated Store Found" };

        const UPC = data.primaryUPC?.trim() || undefined;

        let miscItem: mongoose.Document & { _id: mongoose.Types.ObjectId; price: number; tax: number };

        if (UPC) {
            const existingProduct = await MiscellaneousItemsModel.findOne({ primaryUPC: UPC });
            if (existingProduct) {
                miscItem = existingProduct;
            }
        }

        if (!miscItem!) {
            const newProduct = await MiscellaneousItemsModel.create({
                storeId: StoreId,
                price: data.price,
                productName: data.productName,
                primaryUPC: UPC,
                tax: data.tax,
            });
            if (!newProduct) return { success: false, message: "Error creating Misc product" };
            miscItem = newProduct;
        }

        await CartModel.findOneAndUpdate(
            { customerId: user.customerData._id },
            {
                $push: {
                    miscItems: {
                        itemId: miscItem._id,
                        quantity: data.quantity,
                        priceAtAdd: miscItem.price,
                        taxAtAdd: miscItem.tax,
                    },
                },
            },
            { upsert: true, returnDocument: "after" }
        );

        revalidatePath(`/cashier/customer/${user.customerData._id}/cart`);
        revalidatePath("/customer/cart");
        revalidatePath("/cashier/misc-items");
        return { success: true, message: "Misc Item added" };
    } catch (err) {
        console.log(err);
        return { success: false, message: "Error creating Misc product" };
    }
};

export const IncrementMiscItem = async (itemId: string, customerId?: string) => {
  const { customerData: user } = await getCustomerDataAction(customerId);
  if (!user) return;

  await dbConnect();

  await CartModel.findOneAndUpdate(
    { customerId: user._id, "miscItems.itemId": new mongoose.Types.ObjectId(itemId) } as any,
    { $inc: { "miscItems.$.quantity": 1 } }
  );

  revalidatePath("/cashier/customer/[customerId]/cart", "page");
};

export const DecrementMiscItem = async (itemId: string, customerId?: string) => {
  const { customerData: user } = await getCustomerDataAction(customerId);
  if (!user) return;

  await dbConnect();

  const cart = await CartModel.findOne({
    customerId: user._id,
    "miscItems.itemId": new mongoose.Types.ObjectId(itemId),
  } as any);
  if (!cart) return;

  const item = cart.miscItems.find((i) => i.itemId.toString() === itemId);
  if (!item) return;

  if (item.quantity > 1) {
    await CartModel.findOneAndUpdate(
      { customerId: user._id, "miscItems.itemId": new mongoose.Types.ObjectId(itemId) } as any,
      { $inc: { "miscItems.$.quantity": -1 } }
    );
  } else {
    await CartModel.findOneAndUpdate(
      { customerId: user._id } as any,
      { $pull: { miscItems: { itemId: new mongoose.Types.ObjectId(itemId) } } }
    );
  }

  revalidatePath("/cashier/customer/[customerId]/cart", "page");
};

export const RemoveMiscItem = async (itemId: string, customerId?: string) => {
  const { customerData: user } = await getCustomerDataAction(customerId);
  if (!user) return;

  await dbConnect();

  await CartModel.findOneAndUpdate(
    { customerId: user._id } as any,
    { $pull: { miscItems: { itemId: new mongoose.Types.ObjectId(itemId) } } }
  );

  revalidatePath("/cashier/customer/[customerId]/cart", "page");
};

export const getMiscItems = async () => {
  try {
    await dbConnect();
    const Items = await MiscellaneousItemsModel.find({ isAdded: false }).lean();
    if (!Items) return { success: true, data: null };
    return { success: true, data: JSON.parse(JSON.stringify(Items)) };
  } catch (error) {
    console.log(error);
    return { success: false, data: null };
  }
};

export const getSingleMiscItem = async (miscId:string) =>{
  if(!miscId) return {success:false,data:null}
  try{
    await dbConnect();
    const miscItem = await MiscellaneousItemsModel.findById(miscId)
    if(!miscItem) return {success:true,data:null}
    
    return {success:true,data:JSON.parse(JSON.stringify(miscItem))}

  }catch(err){
    console.log(err)
    return {success:false,data:null}
  }
}

const MiscProductSchema = z.object({
  storeId: z.string(),
  miscItemId: z.string(),
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().optional().default(""),
  category: z.string().min(1, "Category is required"),
  markup: z.number().min(0),
  tax: z.number().refine((v) => [0, 0.05, 0.07, 0.12].includes(v), {
    message: "Invalid tax rate",
  }),
  disposableFee: z.number().min(0).default(0),
  price: z.number().min(1, "Price must be greater than zero"),
  stock: z.boolean(),
  subsidised: z.boolean(),
  isFeatured: z.boolean(),
  isMeasuredInWeight: z.boolean().default(false),
  UOM: z.string().trim().optional(),
  PriceDrop: z.boolean().default(false),
  primaryUPC: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]*$/)
    .max(18)
    .transform((val) => (val === "" ? undefined : val.toUpperCase()))
    .optional(),
  images: z.array(z.object({
  url: z.string(),
  fileId: z.string().optional(),
})).optional().default([]),
});

type MiscProductPayload = z.input<typeof MiscProductSchema>;

export const createProductFromMisc = async (data: MiscProductPayload, miscId: string) => {
  if (!data || !miscId) return { success: false, message: "No data provided" };

  try {
    const session = await getUserSession();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const parsed = MiscProductSchema.safeParse(data);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e: z.ZodIssue) => e.message).join(", ");
      return { success: false, message };
    }

    const {
      storeId,
      name,
      description,
      category,
      markup,
      tax,
      disposableFee,
      price,
      stock,
      isFeatured,
      isMeasuredInWeight,
      UOM,
      PriceDrop,
      primaryUPC,
    } = parsed.data;

    await dbConnect();

    if (primaryUPC) {
      const existing = await productsModel.findOne({ primaryUPC, storeId }).lean();
      if (existing) {
        return {
          success: false,
          message: `Primary UPC already used by: ${existing.name || "Unknown Product"}`,
        };
      }
    }

    const subsidyCategories = ["Fruits", "Vegetables", "Dairy"];
    const isSubsidized = subsidyCategories.includes(category);

    const dbPayload: any = {
      name,
      description,
      category,
      markup,
      tax,
      disposableFee,
      price,
      stock,
      subsidised: isSubsidized,
      isFeatured,
      isMeasuredInWeight,
      UOM,
      PriceDrop,
      storeId,
      images: parsed.data.images ?? [],
    };

    if (primaryUPC) dbPayload.primaryUPC = primaryUPC;

    const mongoSession = await mongoose.startSession();
    let createdProductId;
    try {
      await mongoSession.withTransaction(async () => {
        const created = await productsModel.create([dbPayload], { session: mongoSession });
        if (!created[0]) throw new Error("Failed to create product");
        createdProductId = created[0]._id;
      });
    } catch (err) {
      console.error("Transaction failed:", err);
      return { success: false, message: "Failed to create product" };
    } finally {
      await mongoSession.endSession();
    }

    await MiscellaneousItemsModel.findByIdAndUpdate(miscId, {
      isAdded: true,
      productId: createdProductId,
      tax,
      price,  
    });

    revalidateTag(`products-${storeId}`, "max");
    revalidatePath("/cashier/misc-items");
    

    return { success: true, message: "Product created successfully" };
  } catch (err) {
    console.error("createProductFromMisc error:", err);
    return { success: false, message: "An unexpected error occurred" };
  }
};