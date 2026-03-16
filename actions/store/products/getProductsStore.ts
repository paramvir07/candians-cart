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
import Store from "@/db/models/store/store.model";

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
      InvoiceId: product.InvoiceId.toString(),
  };
}

/**
 * Retrieves all products belonging to the authenticated user's store.
 *
 * Validates the current session, finds the store associated with the
 * logged-in user, and fetches its products sorted by newest first.
 * Products are serialized into JSON-safe objects (ObjectIds and Dates
 * converted to strings) before being returned.
 *
 * @returns {Promise<ProductActionResponse>}
 * Success with an array of serialized products, or an error message.
 *
 * @example
 * const result = await getProducts();
 * if (result.success) {
 *   console.log(result.data); // IProduct[]
 * } else {
 *   console.error(result.error);
 * }
 */

export default async function getProducts(): Promise<ProductActionResponse> {
  try {
    const session = await getUserSession();
    await dbConnect();

    const store = await Store.findOne({ userId: session.user.id }).lean();
    if (!store)
      return {
        success: false,
        error: "Store not found",
      };

    const products = await Product.find({ storeId: store._id })
      .sort({ createdAt: -1 })
      .lean();

    const serializedProducts: IProduct[] = JSON.parse(JSON.stringify(products));

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
