import type { SupabaseClient } from "@supabase/supabase-js";

/** Keep template previews in sync when a design snapshot is saved from that template. */
export async function syncTemplateThumbnail(
  admin: SupabaseClient,
  templateId: string,
  thumbnailUrl: string | null | undefined,
  options: { isAdmin?: boolean; force?: boolean } = {}
) {
  if (!templateId || !thumbnailUrl) return;

  if (!options.force && !options.isAdmin) {
    const { data: template } = await admin
      .from("templates")
      .select("thumbnail_url")
      .eq("id", templateId)
      .maybeSingle();

    if (template?.thumbnail_url) return;
  }

  await admin
    .from("templates")
    .update({ thumbnail_url: thumbnailUrl })
    .eq("id", templateId);
}
