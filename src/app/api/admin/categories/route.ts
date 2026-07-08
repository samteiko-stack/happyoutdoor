import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapCategory, toDbCategory } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .select("*, products(count)")
      .order("sort_order");

    if (error) throw error;

    return NextResponse.json(
      data.map((row) => ({
        ...mapCategory(row),
        _count: { products: (row.products as { count: number }[])?.[0]?.count ?? 0 },
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
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .insert(toDbCategory(body))
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(mapCategory(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
