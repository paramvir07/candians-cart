import { generateGeminiImage, helloWorld } from "@/lib/inngest/functions/ImageGeneration";
import { inngestClient } from "@/lib/inngest/inngest";
import { serve } from "inngest/next";


export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [helloWorld,generateGeminiImage],
});