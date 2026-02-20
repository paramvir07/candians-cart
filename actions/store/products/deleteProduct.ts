"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import StoreInfo from "@/db/models/store/storeInfo.model";

interface ActionResponse {
  success: boolean;
  message: string;
}

export async function deleteProduct(
  productId: string,
): Promise<ActionResponse> {
  try {
    const session = await getUserSession();

    await dbConnect();
    
    const store = await StoreInfo.findOne({ userId: session.user.id }).lean();
    if (!store)
      return {
        success: false,
        message: "Store not found",
      };
    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      storeId: store._id,
    });

    if (!deletedProduct) {
      return {
        success: false,
        message:
          "Product not found or you do not have permission to delete this product",
      };
    }

    revalidatePath("/store/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: "An error occurred while deleting the product",
    };
  }
}
