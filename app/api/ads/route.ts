import { NextResponse } from "next/server";

export async function GET() {
  const privateKey = process.env.IMAGEKIT2_PRIVATE_KEY;

  if (!privateKey) {
    return NextResponse.json({ urls: [], error: "Missing private key" }, { status: 500 });
  }

  const credentials = Buffer.from(privateKey + ":").toString("base64");

  const res = await fetch(
    "https://api.imagekit.io/v1/files?path=/ads&type=file&fileType=image&limit=100",
    {
      headers: { Authorization: `Basic ${credentials}` },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ urls: [] }, { status: 500 });
  }

  const files: { url: string }[] = await res.json();
  return NextResponse.json({ urls: files.map((f) => f.url) });
}