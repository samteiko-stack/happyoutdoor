import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapTemplate } from "@/lib/mappers";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("templates")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data.map(mapTemplate));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
