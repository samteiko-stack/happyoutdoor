import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProduct } from "@/lib/mappers";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("*, categories(*)")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data.map((row) => mapProduct(row, row.categories)));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
