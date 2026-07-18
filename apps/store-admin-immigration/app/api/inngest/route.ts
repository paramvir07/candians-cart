import { generateGeminiImage, helloWorld } from "@canadian-cart/lib/inngest/functions/ImageGeneration";
import { inngestClient } from "@canadian-cart/lib/inngest/inngest";
import { serve } from "inngest/next";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [helloWorld,generateGeminiImage],
});