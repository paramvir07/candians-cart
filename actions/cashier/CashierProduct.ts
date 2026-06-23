"use server";

import mongoose from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import productsModel from "@/db/models/store/products.model";
import { getUserSession } from "../auth/getUserSession.actions";
import { getCustomerDataAction } from "../customer/User.action";
import { CashierCreateProductSchema, CashierCreateProductPayload } from "@/zod/schemas/cashier/cashierProductSchema";

export const createCashierProduct = async (
  data: CashierCreateProductPayload,
  customerId: string,
) => {
  if (!data || !customerId) return { success: false, message: "No data provided" };

  try {
    const session = await getUserSession();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const parsed = CashierCreateProductSchema.safeParse(data);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(", ");
      return { success: false, message };
    }

    await dbConnect();

    const { customerData } = await getCustomerDataAction(customerId);
    if (!customerData) return { success: false, message: "Customer not found" };

    const storeId = customerData.associatedStoreId;
    if (!storeId) return { success: false, message: "No associated store found for this customer" };

    const {
      name,
      description,
      category,
      markup,
      tax,
      disposableFee,
      price,
      stock,
      subsidised,
      isFeatured,
      isMeasuredInWeight,
      UOM,
      PriceDrop,
      primaryUPC,
      images,
    } = parsed.data;

    if (primaryUPC) {
      const existing = await productsModel.findOne({ primaryUPC, storeId }).lean();
      if (existing) {
        return {
          success: false,
          message: `Primary UPC already in use by: ${existing.name || "Unknown Product"}`,
        };
      }
    }

    const dbPayload: any = {
      storeId,
      name,
      description,
      category,
      markup,
      tax,
      disposableFee,
      price,
      stock,
      subsidised,
      isFeatured,
      isMeasuredInWeight,
      UOM: isMeasuredInWeight ? UOM : undefined,
      PriceDrop,
      images: images ?? [],
    };

    if (primaryUPC) dbPayload.primaryUPC = primaryUPC;
    let created = null;
    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        created = await productsModel.create([dbPayload], { session: mongoSession });
        if (!created[0]) throw new Error("Failed to create product");
      });
    } catch (err) {
      console.error("Transaction failed:", err);
      return { success: false, message: "Failed to create product" };
    } finally {
      await mongoSession.endSession();
    }

    revalidateTag(`products-${storeId}`, "max");
    revalidatePath(`/cashier/customer/${customerId}/cart`);

  if (!created?.[0]) return { success: false, message: "Failed to create product", data: null };
  return {
    success: true,
    message: "Product created successfully",
    data: JSON.parse(JSON.stringify(created[0])),
  };
  } catch (err) {
    console.error("createCashierProduct error:", err);
    return { success: false, message: "An unexpected error occurred",data:null };
  }
};