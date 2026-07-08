import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign } from "@/lib/mappers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();

    const { data: design } = await admin
      .from("designs")
      .select("*")
      .eq("id", id)
      .single();

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updated, error } = await admin
      .from("designs")
      .update({ is_paid: true })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapDesign(updated));
  } catch (error) {
    console.error("Preview unlock error:", error);
    return NextResponse.json({ error: "Failed to unlock preview" }, { status: 500 });
  }
}
