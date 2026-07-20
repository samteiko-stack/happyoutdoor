import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server.server";
import { mapProfile } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { count: designCount } = await admin
      .from("designs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    const { count: paymentCount } = await admin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    return NextResponse.json({
      ...mapProfile(profile),
      _count: { designs: designCount ?? 0, payments: paymentCount ?? 0 },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;
    const admin = createAdminClient();
    const supabase = await createClient();

    if (email && email !== session.user.email) {
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (signInError) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;
    }

    const profileUpdate: Record<string, unknown> = {};
    if (name !== undefined) profileUpdate.name = name;
    if (email !== undefined) profileUpdate.email = email;
    // role is never user-writable — enforced in DB trigger + admin-only APIs

    if (email || name) {
      await admin.auth.admin.updateUserById(session.user.id, {
        ...(email && { email }),
        user_metadata: { name: name ?? session.user.name },
      });
    }

    const { data: updated, error } = await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", session.user.id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapProfile(updated));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
