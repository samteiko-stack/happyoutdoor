import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign } from "@/lib/mappers";
import {
  getDesignForUser,
  getDesignOwnedByUser,
  notFoundResponse,
  pickUserDesignUpdate,
  unauthorizedResponse,
} from "@/lib/authorization";
import { syncTemplateThumbnail } from "@/lib/sync-template-thumbnail";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const design = await getDesignForUser(id, session.user);
    if (!design) return notFoundResponse();

    return NextResponse.json(mapDesign(design, design.templates));
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
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const existing = await getDesignOwnedByUser(id, session.user.id);
    if (!existing) return notFoundResponse();

    const body = await req.json();
    const updateData = pickUserDesignUpdate(body);
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(mapDesign(existing));
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("designs")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select("*")
      .single();

    if (error) throw error;

    const templateId = existing.template_id as string | null;
    if (templateId && body.thumbnailUrl) {
      await syncTemplateThumbnail(admin, templateId, body.thumbnailUrl as string, {
        isAdmin: isAdmin(session.user),
      });
    }

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
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const existing = await getDesignOwnedByUser(id, session.user.id);
    if (!existing) return notFoundResponse();

    const admin = createAdminClient();
    await admin.from("designs").delete().eq("id", id).eq("user_id", session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
