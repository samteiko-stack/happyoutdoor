import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthUser } from "@/lib/auth-types";
import { isAdmin } from "@/lib/auth-types";

type DesignRow = {
  id: string;
  user_id: string;
  name: string;
  template_id: string | null;
  balcony_width_cm: number;
  balcony_height_cm: number;
  layout_data: string;
  thumbnail_url: string | null;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  templates?: Record<string, unknown> | null;
};

export function notFoundResponse() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function ownsResource(ownerId: string, user: AuthUser) {
  return ownerId === user.id || isAdmin(user);
}

/** Load a design only if the user owns it or is admin. Returns null when denied. */
export async function getDesignForUser(
  designId: string,
  user: AuthUser
): Promise<DesignRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("designs")
    .select("*, templates(*)")
    .eq("id", designId)
    .single();

  if (error || !data) return null;
  if (!ownsResource(data.user_id, user)) return null;
  return data as DesignRow;
}

/** Owner-only — user APIs must not allow cross-tenant writes. */
export async function getDesignOwnedByUser(designId: string, userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("designs")
    .select("*")
    .eq("id", designId)
    .single();

  if (error || !data || data.user_id !== userId) return null;
  return data as DesignRow;
}

/** Allowed fields for user design updates — blocks IDOR/privilege payloads. */
export function pickUserDesignUpdate(body: Record<string, unknown>) {
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.balconyWidthCm !== undefined) updateData.balcony_width_cm = body.balconyWidthCm;
  if (body.balconyHeightCm !== undefined) updateData.balcony_height_cm = body.balconyHeightCm;
  if (body.layoutData !== undefined) {
    updateData.layout_data =
      typeof body.layoutData === "string"
        ? body.layoutData
        : JSON.stringify(body.layoutData);
  }
  if (body.thumbnailUrl) updateData.thumbnail_url = body.thumbnailUrl;

  return updateData;
}

export function canAccessTemplate(
  template: { is_published: boolean },
  user: AuthUser | null | undefined
) {
  return template.is_published || (user ? isAdmin(user) : false);
}

export function isFreeUnlockAllowed() {
  return process.env.ALLOW_FREE_UNLOCK === "true" || process.env.NODE_ENV !== "production";
}
