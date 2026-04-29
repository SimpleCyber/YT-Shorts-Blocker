import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const base64 = `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;

    return NextResponse.json({ base64 });
  } catch {
    return NextResponse.json({ error: "Failed to convert image" }, { status: 500 });
  }
}
