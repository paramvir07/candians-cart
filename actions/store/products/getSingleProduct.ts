"use server";

import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import getUserSession from "@/actions/auth/getUserSession";
import {
  IProduct,
  IProductDB,
} from "@/types/store/products.types";

export async function getSingleProduct(
  productId: string,
): Promise<{ success: boolean; data?: IProduct; error?: string }> {
  const session = await getUserSession();
  try {
    await dbConnect();

    // Find if the product exists in the first place or not
    const product = await Product.findOne({
      _id: productId,
      storeId: session.user.id,
    }).lean() as unknown as IProductDB;

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Manual Serialization (ObjectId/Date -> String)
    const serializedProduct: IProduct = {
      ...product,
      _id: product._id.toString(),
      storeId: product.storeId.toString(),
      images: product.images.map((img) => ({
        url: img.url,
        fileId: img.fileId,
        _id: img._id?.toString() 
      })),
      createdAt: new Date(product.createdAt).toISOString(),
      updatedAt: new Date(product.updatedAt).toISOString(),
    }
    
    return { success: true, data: serializedProduct };

  } catch (error) {
    console.log("Error while fetching product: ", error);
    return {
      success: false,
      error: "Server error",
    };
  }
}
