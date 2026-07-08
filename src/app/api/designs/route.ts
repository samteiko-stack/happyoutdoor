import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDesign, toDbDesign } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("designs")
      .select("*, templates(*)")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data.map((row) => mapDesign(row, row.templates)));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("designs")
      .insert(toDbDesign(body, session.user.id))
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapDesign(data), { status: 201 });
  } catch (error) {
    console.error("Error creating design:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
