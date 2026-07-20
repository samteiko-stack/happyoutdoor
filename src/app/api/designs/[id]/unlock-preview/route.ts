import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign } from "@/lib/mappers";
import {
  forbiddenResponse,
  getDesignOwnedByUser,
  isFreeUnlockAllowed,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/authorization";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isFreeUnlockAllowed()) {
      return forbiddenResponse();
    }

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;
    const design = await getDesignOwnedByUser(id, session.user.id);
    if (!design) return notFoundResponse();

    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from("designs")
      .update({ is_paid: true })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapDesign(updated));
  } catch (error) {
    console.error("Preview unlock error:", error);
    return NextResponse.json({ error: "Failed to unlock preview" }, { status: 500 });
  }
}
