"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/db/dbConnect";
import Product from "@/db/models/store/products.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

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
    let deletedProduct;
    if (session.user.role === "admin") {
      deletedProduct = await Product.findByIdAndDelete(productId);
    } else {
      const store = await Store.findOne({ userId: session.user.id }).lean();
      if (!store)
        return {
          success: false,
          message: "Store not found",
        };

      deletedProduct = await Product.findOneAndDelete({
        _id: productId,
        storeId: store._id,
      });
    }

    if (!deletedProduct) {
      return {
        success: false,
        message:
          "Product not found or you do not have permission to delete this product",
      };
    }

    // Handle delete for image kit

    if (deletedProduct.images && Array.isArray(deletedProduct.images)) {
      for (const image of deletedProduct.images) {
        if (image.fileId) {
          try {
            await imagekit.files.delete(image.fileId);
            console.log(
              `Successfully deleted image ${image.fileId} from ImageKit`,
            );
          } catch (imageKitError) {
            // We catch this error so that if ImageKit fails (e.g. file already deleted),
            // it doesn't crash the rest of the application or throw an unhandled promise.
            console.error(
              `Failed to delete image ${image.fileId} from ImageKit:`,
              imageKitError,
            );
          }
        }
      }
    }

    // 🚨 BUST THE CACHE GLOBALLY!
    revalidateTag(`products-${deletedProduct.storeId.toString()}`, "default" as any);

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
