"use server";

import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import Store from "@/db/models/store/store.model";
import { IProduct, IProductDB } from "@/types/store/products.types";

export async function getSingleProduct(
  productId: string,
): Promise<{ success: boolean; data?: IProduct; error?: string }> {
  try {
    // ... (authentication and dbConnect logic)

    // 1. Fetch the product
    const product = (await Product.findById(
      productId,
    ).lean()) as IProductDB | null;

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // 2. Safe Date Helper to prevent RangeError
    const safeIsoDate = (dateVal: any) => {
      const d = new Date(dateVal);
      // Check if the date is valid before calling toISOString
      return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
    };

    // 3. Minimized Serialization (Vercel Best Practice)
    const serializedProduct: IProduct = {
      _id: product._id.toString(),
      storeId: product.storeId.toString(),
      name: product.name,
      description: product.description,
      category: product.category,
      markup: product.markup,
      tax: product.tax,
      disposableFee: product.disposableFee,
      price: product.price,
      stock: product.stock,
      subsidised: product.subsidised,
      isFeatured: product.isFeatured,
      InvoiceId: product.InvoiceId ? product.InvoiceId.toString() : "",
      // Use helper to avoid "Invalid time value" crash
      createdAt: safeIsoDate(product.createdAt),
      updatedAt: safeIsoDate(product.updatedAt),
      // Fix for the previous images.map error
      images: (product.images || []).map((img) => ({
        url: img.url,
        fileId: img.fileId,
        _id: img._id?.toString(),
      })),
      primaryUPC: product.primaryUPC,
      isMeasuredInWeight: product.isMeasuredInWeight,
      UOM: product.UOM,
    };

    return { success: true, data: serializedProduct };
  } catch (error) {
    console.error("Error while fetching product: ", error);
    return { success: false, error: "Server error" };
  }
}
