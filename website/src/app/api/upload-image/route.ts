import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body; // Base64 data URI

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "focus-shield/block-pages",
      transformation: [
        { width: 1200, height: 900, crop: "fill", quality: "auto" },
      ],
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
