/**
 * Project setup — env check, storage buckets, optional DB migrations.
 * Run: npm run setup
 */
import dotenv from "dotenv";
import { execSync } from "node:child_process";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

function checkEnv() {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error("Missing environment variables in .env.local:");
    for (const key of missing) console.error(`  - ${key}`);
    console.error("\nCopy .env.example → .env.local and fill in Supabase keys.");
    process.exit(1);
  }

  for (const key of required) {
    const value = process.env[key]!;
    if (value.includes("your-") || value.includes("placeholder")) {
      console.error(`${key} still looks like a placeholder. Update .env.local.`);
      process.exit(1);
    }
  }

  console.log("Environment: OK");
}

function runStorageSetup() {
  execSync("npx tsx scripts/setup-storage.ts", { stdio: "inherit" });
}

function maybeApplyMigrations() {
  if (!process.env.SUPABASE_DB_PASSWORD?.trim()) {
    console.log("Skipping DB migrations (SUPABASE_DB_PASSWORD not set).");
    console.log("Paste supabase/migrations/*.sql into Supabase SQL Editor, in order.");
    return;
  }

  try {
    execSync("npx tsx scripts/apply-migrations.ts", { stdio: "inherit" });
  } catch {
    console.warn("Migrations failed — apply supabase/migrations/*.sql manually.");
  }
}

function main() {
  checkEnv();
  runStorageSetup();
  maybeApplyMigrations();
  console.log("\nSetup complete.");
  console.log("Start the app: npm run dev");
  console.log("Design previews update when you Save in the designer (3D view).");
}

main();
