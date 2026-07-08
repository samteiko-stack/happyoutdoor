import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    if (email !== session.user.email) {
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
    }

    await admin.auth.admin.updateUserById(session.user.id, {
      email,
      user_metadata: { name },
    });

    const { data: updated } = await admin
      .from("profiles")
      .update({ name, email })
      .eq("id", session.user.id)
      .select("id, name, email")
      .single();

    // Refresh session cookie with new email
    const supabase = await createClient();
    await supabase.auth.refreshSession();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
