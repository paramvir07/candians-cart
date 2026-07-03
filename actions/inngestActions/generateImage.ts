"use server";

import { inngestClient } from "@/lib/inngest/inngest";

interface ImageRef {
  url: string;
  fileId: string;
}

export const triggerImageGeneration = async (
  productId: string,
  srcImageUrl: ImageRef,
  storeId: string,
) => {
  await inngestClient.send({
    name: "product/image-generate",
    data: {
      productId,
      srcImageUrl,
      storeId,
    },
  });
  return { success: true, message: "Image Generation Triggered" };
};