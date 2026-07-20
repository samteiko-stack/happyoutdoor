import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("*, designs(count)");

    if (error) throw error;

    return NextResponse.json(
      data.map((row) => ({
        ...mapProfile(row),
        _count: { designs: (row.designs as { count: number }[])?.[0]?.count ?? 0 },
      }))
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
