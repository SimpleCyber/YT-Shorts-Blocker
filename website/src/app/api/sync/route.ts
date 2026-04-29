import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function POST(request: Request) {
  try {
    const { uid, config } = await request.json();

    if (!uid || !config) {
      return NextResponse.json({ error: "Missing uid or config" }, { status: 400 });
    }

    // Update Firestore
    await setDoc(doc(db, "users", uid), {
      config: { ...config, lastSynced: Date.now() }
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
