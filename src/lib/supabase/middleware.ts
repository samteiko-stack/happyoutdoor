import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRole, isCustomerWorkspacePath } from "@/lib/auth-routes";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const PUBLIC_PATHS = new Set([
  "/",
  "/landing",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const AUTH_TIMEOUT_MS = 1500;

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/")
  );
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Supabase request timed out")), ms);
      }),
    ]);
  } catch {
    return null;
  }
}

function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
  );
}

async function resolveUserIsAdmin(user: {
  id: string;
  user_metadata?: Record<string, unknown>;
}) {
  const metaRole = user.user_metadata?.role;
  if (isAdminRole(typeof metaRole === "string" ? metaRole : undefined)) {
    return true;
  }

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return isAdminRole(data?.role as string | undefined);
  } catch {
    return false;
  }
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request });
  }

  if (!hasSupabaseSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const sessionResult = await withTimeout(supabase.auth.getSession(), AUTH_TIMEOUT_MS);

  if (sessionResult && !sessionResult.data.session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const session = sessionResult?.data.session;
  if (session?.user) {
    const admin = await resolveUserIsAdmin(session.user);

    if (admin && isCustomerWorkspacePath(pathname, request.nextUrl.search)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (!admin && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
