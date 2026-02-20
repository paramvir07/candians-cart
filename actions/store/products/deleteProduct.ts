"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

interface ActionResponse {
  success: boolean;
  message: string;
}

export async function deleteProduct(
  productId: string,
): Promise<ActionResponse> {
  const session = await getUserSession();

  try {
    await dbConnect();

    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      storeId: session.user.id,
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
