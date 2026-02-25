"use server";

import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { revalidatePath } from "next/cache";

export async function subsidisedProduct(productId: string) {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorised: Admin accress required",
      };
    }
    await dbConnect();

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { subsidised: true },
      { new: true },
    );

    if (!updatedProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    revalidatePath(""); // have to set the path

    return {
      success: true,
      message: "Product successfully marked as subsidised.",
    };
  } catch (error) {
    console.error("Error subsidising product:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
