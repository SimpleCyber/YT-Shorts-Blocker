import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists || !userDoc.data()?.config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: userDoc.data()?.config });
  } catch (err: any) {
    console.error("API Sync GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { uid, config } = await request.json();

    if (!uid || !config) {
      return NextResponse.json({ error: "Missing uid or config" }, { status: 400 });
    }

    // Update Firestore
    await adminDb.collection("users").doc(uid).set({
      config: { ...config, lastSynced: Date.now() }
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
