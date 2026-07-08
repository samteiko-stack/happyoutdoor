import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign } from "@/lib/mappers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("designs")
      .select("*, templates(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (data.user_id !== session.user.id && !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(mapDesign(data, data.templates));
  } catch (error) {
    console.error("GET design error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("designs")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.balconyWidthCm !== undefined) updateData.balcony_width_cm = body.balconyWidthCm;
    if (body.balconyHeightCm !== undefined) updateData.balcony_height_cm = body.balconyHeightCm;
    if (body.layoutData !== undefined) {
      updateData.layout_data =
        typeof body.layoutData === "string"
          ? body.layoutData
          : JSON.stringify(body.layoutData);
    }
    if (body.thumbnailUrl) updateData.thumbnail_url = body.thumbnailUrl;

    const { data, error } = await admin
      .from("designs")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapDesign(data));
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("designs")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await admin.from("designs").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
