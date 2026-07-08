import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapCategory } from "@/lib/mappers";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .select("*")
      .order("sort_order");

    if (error) throw error;

    return NextResponse.json(data.map(mapCategory));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
