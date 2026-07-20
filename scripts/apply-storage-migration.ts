/**
 * Apply 003_storage_snapshots.sql using the Supabase database password.
 * Run: npx tsx scripts/apply-storage-migration.ts
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!url || !dbPassword) {
  console.error(
    "Add SUPABASE_DB_PASSWORD to .env.local, or paste\n" +
      "supabase/migrations/003_storage_snapshots.sql into the Supabase SQL Editor."
  );
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
const sqlPath = path.join(process.cwd(), "supabase/migrations/003_storage_snapshots.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const hosts = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`,
];

async function tryConnect(connectionString: string) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
}

async function main() {
  let lastError: unknown;

  for (const connectionString of hosts) {
    try {
      await tryConnect(connectionString);
      console.log("Storage migration applied successfully.");
      return;
    } catch (err) {
      lastError = err;
    }
  }

  console.error(
    "Failed to apply storage migration:",
    lastError instanceof Error ? lastError.message : lastError
  );
  process.exit(1);
}

main();
