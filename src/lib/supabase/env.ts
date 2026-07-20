function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

/** Project root only — never `/rest/v1` or other API paths. */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/rest/v1")) {
      parsed.pathname = "";
    }
    parsed.hash = "";
    parsed.search = "";
    return stripTrailingSlash(parsed.toString());
  } catch {
    return stripTrailingSlash(raw.replace(/\/rest\/v1\/?$/, ""));
  }
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder";
}

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3002";
}
