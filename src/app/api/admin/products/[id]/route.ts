import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProduct, toDbProduct } from "@/lib/mappers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("products")
      .select("*, categories(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(mapProduct(data, data.categories));
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const admin = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.categoryId !== undefined) updateData.category_id = body.categoryId || null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.affiliateLink !== undefined) updateData.affiliate_link = body.affiliateLink;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.topViewImageUrl !== undefined) updateData.top_view_image_url = body.topViewImageUrl;
    if (body.modelUrl !== undefined) updateData.model_url = body.modelUrl;
    if (body.widthCm !== undefined) updateData.width_cm = body.widthCm;
    if (body.heightCm !== undefined) updateData.height_cm = body.heightCm;

    const { data, error } = await admin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("*, categories(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(mapProduct(data, data.categories));
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    await admin.from("products").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
