"use server"

import { dbConnect } from "@/db/dbConnect"
import productsModel from "@/db/models/store/products.model";

interface ProductResult {
  success: boolean;
  data: {
    _id: string;
    storeId: string;
    name: string;
    description?: string;
    category: string;
    markup: number;
    tax: number;
    disposableFee?: number;
    price: number;
    stock: boolean;
    subsidised: boolean;
    images: { url: string; fileId: string }[];
    isFeatured: boolean;
    InvoiceId?: string;
    primaryUPC?: string;
    isMeasuredInWeight?: boolean;
    UOM?: string;
    vendorId?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export const getProductById = async (productId: string): Promise<ProductResult> => {
  try {
    await dbConnect();
    const data = await productsModel.findById(productId).lean();
    if (!data) {
      return { success: true, data: null };
    }
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (err) {
    console.log(err);
    return { success: false, data: null };
  }
};