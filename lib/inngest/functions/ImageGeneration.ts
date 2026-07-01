import { enhanceImage } from "@/actions/inngestActions/enhanceImage";
import { inngestClient } from "../inngest";
import Product from "@/db/models/store/products.model";
import { dbConnect } from "@/db/dbConnect";
import { imagekit } from "@/lib/imagekitClient";
import { revalidateTag } from "next/cache";

export const helloWorld = inngestClient.createFunction(
  {
    id: "hello-world",
    triggers: { event: "test/hello" },
    retries: 2,
  },
  async ({ event }) => {
    return { message: "it works", data: event.data };
  }
);

export const generateGeminiImage = inngestClient.createFunction(
  {
    id: "generate-image-gemini",
    triggers: { event: "product/image-generate" },
    retries: 2,
  },
  async ({ event, step }) => {
    const { productId, srcImageUrl,storeId } = event.data;

    const result = await step.run("enhance-image", async () => {
      const { buffer, mimeType } = await enhanceImage(srcImageUrl.url);
      return {
        base64: buffer.toString("base64"),
        mimeType: mimeType ?? "image/png",
      };
    });

    const uploaded = await step.run("upload-to-imagekit", async () => {
      const ext = result.mimeType.split("/")[1] ?? "png";
      const upload = await imagekit.files.upload({
        file: result.base64,
        fileName: `${productId}-enhanced.${ext}`,
      });
      return { url: upload.url, fileId: upload.fileId };
    });

    if (srcImageUrl.fileId) {
      await step.run("delete-original-from-imagekit", async () => {
        await imagekit.files.delete(srcImageUrl.fileId);
      });
      console.log('Old Image Deleted with fileId : ',srcImageUrl.fileId);
    }

    await step.run("update-product-db", async () => {
      await dbConnect();
      await Product.findByIdAndUpdate(productId, {
        $set: { images: [{ url: uploaded.url, fileId: uploaded.fileId }] },
      });
      const tagToBust = `products-${storeId}`;
      revalidateTag(tagToBust, "max");
      console.log('Image updated in DB and cache revalidated for tag:', tagToBust);
    });

    console.log("NEW IMAGE URL : ",uploaded.url)
    return { message: "Image enhanced and uploaded", productId, url: uploaded.url };
  }
);