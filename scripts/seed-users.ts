/**
 * Seed one admin + one regular user in Supabase Auth.
 * Run: npm run seed
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  {
    email: "admin@happyoutdoor.co.uk",
    password: "admin123456",
    name: "Admin",
    role: "ADMIN" as const,
  },
  {
    email: "user@happyoutdoor.co.uk",
    password: "user123456",
    name: "Test User",
    role: "USER" as const,
  },
];

async function findUserByEmail(email: string) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function seedUser(user: (typeof SEED_USERS)[number]) {
  const existing = await findUserByEmail(user.email);

  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    });

    await admin
      .from("profiles")
      .update({ name: user.name, role: user.role, email: user.email })
      .eq("id", existing.id);

    console.log(`Updated existing user: ${user.email} (${user.role})`);
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name, role: user.role },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Failed to create ${user.email}`);
  }

  await admin
    .from("profiles")
    .update({ role: user.role, name: user.name })
    .eq("id", data.user.id);

  console.log(`Created user: ${user.email} (${user.role})`);
  return data.user.id;
}

async function main() {
  console.log("Seeding Supabase users...\n");

  for (const user of SEED_USERS) {
    await seedUser(user);
  }

  console.log("\nDone. Login with:\n");
  console.log("  Admin → admin@happyoutdoor.co.uk / admin123456");
  console.log("  User  → user@happyoutdoor.co.uk / user123456");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
