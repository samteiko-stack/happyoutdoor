import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
