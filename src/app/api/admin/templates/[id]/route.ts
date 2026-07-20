import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapTemplate } from "@/lib/mappers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const admin = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.balconyWidthCm !== undefined) updateData.balcony_width_cm = body.balconyWidthCm;
    if (body.balconyHeightCm !== undefined) updateData.balcony_height_cm = body.balconyHeightCm;
    if (body.layoutData !== undefined) updateData.layout_data = body.layoutData;
    if (body.isPublished !== undefined) updateData.is_published = body.isPublished;
    if (body.thumbnailUrl !== undefined && body.thumbnailUrl) {
      updateData.thumbnail_url = body.thumbnailUrl;
    }

    const { data, error } = await admin
      .from("templates")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapTemplate(data));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    await admin.from("templates").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
