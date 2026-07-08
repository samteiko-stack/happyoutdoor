import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapTemplate } from "@/lib/mappers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(mapTemplate(data));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
