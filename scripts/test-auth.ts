import dotenv from "dotenv";
import { createBrowserClient } from "@supabase/ssr";

dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const client = createBrowserClient(url, anon);

  const { data, error } = await client.auth.signInWithPassword({
    email: "admin@happyoutdoor.co.uk",
    password: "admin123456",
  });

  console.log("browser client signIn:", error?.message ?? "ok");
  console.log("role:", data.user?.user_metadata?.role);
}

main();
