import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Get the single file from the frontend request
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was provided." },
        { status: 400 },
      );
    }

    // 1. File Type Restriction
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type ${file.type} is not allowed. Please upload JPG, PNG, or WEBP.`,
        },
        { status: 400 },
      );
    }

    // 2. File Size Restriction (4MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File ${file.name} exceeds the 4MB limit.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload the image to ImageKit in buffer
    const upload = await imagekit.upload({
      file: buffer,
      fileName: file.name,
    });

    console.log("Image Uploaded | ImageKit API");

    // Return the image data in the array format expected by your Zod schema
    return NextResponse.json({
      success: true,
      images: [
        {
          url: upload.url,
          fileId: upload.fileId,
        },
      ],
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during upload." },
      { status: 500 },
    );
  }
}
