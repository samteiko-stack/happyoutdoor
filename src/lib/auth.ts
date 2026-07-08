import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/mappers";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function isAdmin(user: AuthUser | { role?: string | null }) {
  return user.role?.toUpperCase() === "ADMIN";
}

/** Get the authenticated user with profile (role). Returns null if not logged in. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? null,
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
}

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
