import { geminiClient } from "@/lib/gemini/geminiClient";

export async function enhanceImage(imageUrl: string) {

const prompt = `
Edit the provided image into a high-end ecommerce product photo.

OBJECTIVE:
Create a clean, studio-quality product image suitable for Amazon/Shopify listings.

BACKGROUND:
- Pure white background (#FFFFFF)
- Completely seamless, no gradients or textures

COMPOSITION:
- Keep the product centered.
- Fill approximately 85-92% of the frame.
- Use tight product framing with minimal white margins.
- Crop closely around the product while ensuring no part of it is cut off.
- Do NOT zoom out or leave excessive empty space around the product.

LIGHTING:
- Soft studio lighting from front-left
- Even illumination across the product
- No harsh shadows or overexposure

SHADOW:
- Add a subtle natural contact shadow directly beneath the product
- Keep it soft, realistic, and minimal

STRICT PRESERVATION RULES:
- Do NOT change the product shape or proportions
- Do NOT alter colors, branding, logos, or printed text
- Do NOT modify packaging design or material
- Do NOT add, remove, or replace any elements
- Keep all product labels, quantity information, and text exactly unchanged

OUTPUT QUALITY:
- Sharp focus, high resolution, professional studio look
- Centered composition
- Ecommerce-ready (catalog standard)
`;

  const res = await fetch(imageUrl);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());

  const response = await geminiClient.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: buffer.toString("base64"), mimeType } },
        ],
      },
    ],
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

    if (!imagePart?.inlineData?.data) {
    const textPart = parts.find((p) => p.text)?.text;
    const finishReason = response.candidates?.[0]?.finishReason;
    throw new Error(
        `No image returned from Gemini. finishReason=${finishReason ?? "unknown"}${
        textPart ? ` | text: ${textPart}` : ""
        }`
    );
    }

  return {
    buffer: Buffer.from(imagePart.inlineData.data, "base64"),
    mimeType: imagePart.inlineData.mimeType,
  };
}