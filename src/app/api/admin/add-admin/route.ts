import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/mappers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: name || null },
    });

    if (authError || !authData.user) {
      throw authError ?? new Error("Failed to create user");
    }

    await admin
      .from("profiles")
      .update({ role: "ADMIN", name: name || null })
      .eq("id", authData.user.id);

    console.log(`New admin created: ${email} with temp password: ${tempPassword}`);

    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return NextResponse.json(mapProfile(profile!));
  } catch (error) {
    console.error("Add admin error:", error);
    return NextResponse.json({ error: "Failed to add admin" }, { status: 500 });
  }
}
