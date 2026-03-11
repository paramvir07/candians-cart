import { NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

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
          error: `File type ${file.type} is not allowed. Please upload JPG, PNG, WEBP or PDF.`,
        },
        { status: 400 },
      );
    }

    const isPDF = file.type === "application/pdf";
    const maxSize = isPDF ? 10 * 1024 * 1024 : 4 * 1024 * 1024;
    // 10 mb for PDF and 4 mb for Photos

    // 2. File Size Restriction (4MB)
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File exceeds the ${isPDF ? "10MB" : "4MB"} limit.`,
        },
        { status: 400 },
      );
    }

    // Upload the image to ImageKit directly no need to create buffer
    const upload = await imagekit.files.upload({
      file: file,
      fileName: file.name,
    });

    console.log("Image Uploaded | ImageKit API");

    // Return the image data in the array format expected by your Zod schema
    return NextResponse.json({
      success: true,
      // for invoiceForm
      url: upload.url,
      fileId: upload.fileId,
      // For ProductForm
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
