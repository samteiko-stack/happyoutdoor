import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapTemplate, toDbTemplate } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("templates")
      .select("*, designs(count)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      data.map((row) => ({
        ...mapTemplate(row),
        _count: { designs: (row.designs as { count: number }[])?.[0]?.count ?? 0 },
      }))
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("templates")
      .insert(toDbTemplate(body))
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapTemplate(data), { status: 201 });
  } catch (error: unknown) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
