import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server.server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const role = session?.user?.user_metadata?.role;
      const defaultNext =
        typeof role === "string" && role.toUpperCase() === "ADMIN"
          ? "/admin"
          : "/dashboard";
      const destination =
        next === "/dashboard" && defaultNext === "/admin" ? defaultNext : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
