import { cache } from "react";
import { createClient } from "@/lib/supabase/server.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/mappers";
import type { AuthUser } from "@/lib/auth-types";
import { isAdmin } from "@/lib/auth-types";

export type { AuthUser } from "@/lib/auth-types";
export { isAdmin } from "@/lib/auth-types";

const AUTH_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

function userFromMetadata(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AuthUser | null {
  const role = user.user_metadata?.role;
  if (typeof role !== "string" || !role.trim()) return null;

  const name = user.user_metadata?.name;
  return {
    id: user.id,
    email: user.email ?? "",
    name: typeof name === "string" ? name : null,
    role: role.toUpperCase(),
  };
}

/** Get the authenticated user with profile (role). Returns null if not logged in. */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const supabase = await createClient();
    const authResult = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);

    if (!authResult) return null;

    const {
      data: { user },
    } = authResult;

    if (!user) return null;

    const fromMetadata = userFromMetadata(user);
    if (fromMetadata) return fromMetadata;

    const admin = createAdminClient();
    const profileResult = await withTimeout(
      (async () => admin.from("profiles").select("*").eq("id", user.id).single())(),
      AUTH_TIMEOUT_MS
    );

    const profile = profileResult?.data;
    if (!profile) {
      return {
        id: user.id,
        email: user.email ?? "",
        name: (user.user_metadata?.name as string | undefined) ?? null,
        role: "USER",
      };
    }

    const mapped = mapProfile(profile);
    return {
      id: mapped.id,
      email: mapped.email,
      name: mapped.name,
      role: mapped.role,
    };
  } catch {
    return null;
  }
});

/** Backward-compatible session shape used by API routes. */
export async function auth() {
  const user = await getAuthUser();
  if (!user) return null;
  return { user };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!isAdmin(user)) throw new Error("Unauthorized");
  return user;
}

/** Sign out helper for server actions */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
