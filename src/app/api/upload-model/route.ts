import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    console.log("Upload session:", session?.user?.email, session?.user?.role);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Check role case-insensitively
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== "ADMIN") {
      return NextResponse.json({ 
        error: `Admin access required. Your role: ${session.user.role}` 
      }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type - accept GLB, GLTF, FBX, OBJ
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

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `models/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload model error:", error);
    return NextResponse.json(
      { error: "Failed to upload model" },
      { status: 500 }
    );
  }
}
