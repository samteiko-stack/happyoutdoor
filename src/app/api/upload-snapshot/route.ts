import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const path = `${session.user.id}/${Date.now()}.jpg`;
    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength < 256) {
      return NextResponse.json({ error: "Snapshot file is empty" }, { status: 400 });
    }

    const { error } = await admin.storage.from("snapshots").upload(path, buffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

    if (error) {
      console.error("Supabase snapshot upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from("snapshots").getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Snapshot upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
