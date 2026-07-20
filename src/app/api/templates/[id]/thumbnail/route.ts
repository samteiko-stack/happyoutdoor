import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderTemplateThumbnailJpeg } from "@/lib/template-layout-thumbnail";
import { canAccessTemplate, notFoundResponse } from "@/lib/authorization";
import { auth } from "@/lib/auth.server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("templates")
      .select("balcony_width_cm, balcony_height_cm, layout_data, is_published, thumbnail_url")
      .eq("id", id)
      .single();

    if (error || !data) return notFoundResponse();

    if (!canAccessTemplate({ is_published: data.is_published as boolean }, session?.user)) {
      return notFoundResponse();
    }

    if (data.thumbnail_url) {
      return NextResponse.redirect(data.thumbnail_url as string, 302);
    }

    const buffer = await renderTemplateThumbnailJpeg({
      balconyWidthCm: data.balcony_width_cm as number,
      balconyHeightCm: data.balcony_height_cm as number,
      layoutData: data.layout_data as string,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Template thumbnail error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
