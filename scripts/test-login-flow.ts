/**
 * Test login + profile API flow against local dev server.
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const client = createClient(url, anon);

  const { data, error } = await client.auth.signInWithPassword({
    email: "admin@happyoutdoor.co.uk",
    password: "admin123456",
  });

  if (error) {
    console.error("signIn failed:", error.message);
    process.exit(1);
  }

  const session = data.session!;
  const res = await fetch("http://localhost:3002/api/auth/profile", {
    headers: {
      Cookie: `sb-${new URL(url).hostname.split(".")[0]}-auth-token=base64-${Buffer.from(JSON.stringify(session)).toString("base64")}`,
    },
  });

  console.log("profile API status:", res.status);
  console.log("profile API body:", await res.text());
}

main();
