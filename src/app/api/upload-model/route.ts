import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: `Admin access required. Your role: ${session.user.role}` },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validExtensions = [".glb", ".gltf", ".fbx", ".obj"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: GLB, GLTF, FBX, OBJ" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${timestamp}-${sanitizedName}`;

    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage.from("models").upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) throw error;

    const { data: urlData } = admin.storage.from("models").getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload model error:", error);
    return NextResponse.json({ error: "Failed to upload model" }, { status: 500 });
  }
}
