import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: user } = await admin.from("profiles").select("role").eq("id", id).single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "User is not an admin" }, { status: 400 });
    }

    await admin.from("profiles").update({ role: "USER" }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove admin error:", error);
    return NextResponse.json({ error: "Failed to remove admin" }, { status: 500 });
  }
}
