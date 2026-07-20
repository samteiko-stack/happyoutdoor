import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapTemplate } from "@/lib/mappers";
import { canAccessTemplate, notFoundResponse } from "@/lib/authorization";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return notFoundResponse();

    if (!canAccessTemplate({ is_published: data.is_published as boolean }, session?.user)) {
      return notFoundResponse();
    }

    return NextResponse.json(mapTemplate(data));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
