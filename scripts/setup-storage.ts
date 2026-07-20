/**
 * Ensure Supabase storage buckets exist, are public, and accept uploads.
 * Run: npm run setup:storage
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REQUIRED_BUCKETS = ["snapshots", "models", "products"] as const;

async function main() {
  if (!url || !serviceKey) {
    console.error(
      "Missing Supabase credentials. Add to .env.local:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL\n" +
        "  SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  if (url.includes("placeholder") || serviceKey.includes("placeholder")) {
    console.error("Supabase credentials are still placeholders. Update .env.local.");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error("Could not list buckets:", listError.message);
    process.exit(1);
  }

  const existing = new Map((buckets ?? []).map((bucket) => [bucket.id, bucket]));

  for (const id of REQUIRED_BUCKETS) {
    const bucket = existing.get(id);
    if (!bucket) {
      const { error } = await admin.storage.createBucket(id, { public: true });
      if (error) {
        console.error(`Failed to create bucket "${id}":`, error.message);
        process.exit(1);
      }
      console.log(`Created bucket: ${id} (public)`);
      continue;
    }

    if (!bucket.public) {
      const { error } = await admin.storage.updateBucket(id, { public: true });
      if (error) {
        console.error(`Failed to make bucket "${id}" public:`, error.message);
        process.exit(1);
      }
      console.log(`Updated bucket: ${id} → public`);
      continue;
    }

    console.log(`OK bucket: ${id} (public)`);
  }

  const testPath = `setup-verify-${Date.now()}.jpg`;
  const testImage = Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=",
    "base64"
  );

  const { error: uploadError } = await admin.storage.from("snapshots").upload(testPath, testImage, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    console.error("Snapshot upload test failed:", uploadError.message);
    process.exit(1);
  }

  const { data: publicUrl } = admin.storage.from("snapshots").getPublicUrl(testPath);
  const response = await fetch(publicUrl.publicUrl);
  await admin.storage.from("snapshots").remove([testPath]);

  if (!response.ok) {
    console.error(`Snapshot public URL test failed: HTTP ${response.status}`);
    process.exit(1);
  }

  console.log("Snapshot upload + public read: OK");
  console.log(`Supabase project: ${new URL(url).hostname}`);
}

main();
