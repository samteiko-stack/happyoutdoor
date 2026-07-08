import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/mappers";

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

    if (body.role === undefined) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .update({ role: body.role.toUpperCase() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapProfile(data));
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

    // Delete auth user (cascades to profile via FK)
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
