/**
 * Apply all supabase/migrations/*.sql in order using the database password.
 * Run: npx tsx scripts/apply-migrations.ts
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!url || !dbPassword) {
  console.error(
    "Add SUPABASE_DB_PASSWORD to .env.local, or paste each file from\n" +
      "supabase/migrations/ into the Supabase SQL Editor (in order)."
  );
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
const migrationsDir = path.join(process.cwd(), "supabase/migrations");

const hosts = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`,
];

async function applyWithClient(client: pg.Client) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`  OK`);
  }
}

async function main() {
  let lastError: unknown;

  for (const connectionString of hosts) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      await applyWithClient(client);
      await client.end();
      console.log("All migrations applied.");
      return;
    } catch (err) {
      lastError = err;
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }

  console.error(
    "Failed to apply migrations:",
    lastError instanceof Error ? lastError.message : lastError
  );
  process.exit(1);
}

main();
