import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign, toDbDesign } from "@/lib/mappers";
import { syncTemplateThumbnail } from "@/lib/sync-template-thumbnail";
import { forbiddenResponse } from "@/lib/authorization";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isAdmin(session.user)) {
      return forbiddenResponse();
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("designs")
      .select("*, templates(*)")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data.map((row) => mapDesign(row, row.templates)));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isAdmin(session.user)) {
      return forbiddenResponse();
    }

    const body = await req.json();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("designs")
      .insert(toDbDesign(body, session.user.id))
      .select("*")
      .single();

    if (error) throw error;

    const templateId = body.templateId as string | undefined;
    if (templateId) {
      await syncTemplateThumbnail(admin, templateId, body.thumbnailUrl as string | undefined, {
        isAdmin: isAdmin(session.user),
      });
    }

    return NextResponse.json(mapDesign(data), { status: 201 });
  } catch (error) {
    console.error("Error creating design:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
