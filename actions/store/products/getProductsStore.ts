"use server";

import Product from "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import {
  ProductActionResponse,
  IProduct,
  ProductImage,
  IProductDB,
} from "@/types/store/products.types";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

function serializeProduct(product: IProductDB): IProduct {
  return {
    ...product,
    _id: product._id.toString(),
    storeId: product.storeId.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images:
      product.images?.map((img: ProductImage) => ({
        ...img,
        _id: img._id?.toString(),
      })) ?? [],
  };
}

export default async function getProducts(): Promise<ProductActionResponse> {
  try {
    const session = await getUserSession();
    await dbConnect();

    const products = await Product.find({ storeId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const serializedProducts: IProduct[] = products.map(serializeProduct);

    return {
      success: true,
      data: serializedProducts,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch products. Please try again later. | getProductsStore.ts ${error}`,
    };
  }
}
