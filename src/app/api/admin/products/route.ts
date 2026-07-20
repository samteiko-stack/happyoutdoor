import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProduct, toDbProduct } from "@/lib/mappers";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("*, categories(*)")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data.map((row) => mapProduct(row, row.categories)));
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .insert(toDbProduct(body))
      .select("*, categories(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(mapProduct(data, data.categories), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
