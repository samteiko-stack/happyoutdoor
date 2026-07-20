/**
 * Upload local catalog assets to Supabase Storage and rewrite DB URLs.
 * Run: npm run migrate-catalog-to-supabase
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
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

const repoRoot = path.resolve(import.meta.dirname, "..");

function contentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".glb") return "model/gltf-binary";
  if (ext === ".gltf") return "model/gltf+json";
  return "application/octet-stream";
}

async function uploadDir(
  localDir: string,
  bucket: "models" | "products",
  publicPrefix: string
) {
  const urlMap = new Map<string, string>();

  if (!fs.existsSync(localDir)) {
    console.warn(`Skipping missing directory: ${localDir}`);
    return urlMap;
  }

  const files = fs.readdirSync(localDir).filter((f) => !f.startsWith("."));

  for (const filename of files) {
    const filePath = path.join(localDir, filename);
    if (!fs.statSync(filePath).isFile()) continue;

    const buffer = fs.readFileSync(filePath);
    const storagePath = filename;

    const { error } = await admin.storage.from(bucket).upload(storagePath, buffer, {
      contentType: contentType(filename),
      upsert: true,
    });

    if (error) {
      throw new Error(`Failed to upload ${bucket}/${filename}: ${error.message}`);
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(storagePath);
    const localUrl = `${publicPrefix}/${filename}`;
    urlMap.set(localUrl, data.publicUrl);
    console.log(`✓ ${localUrl} → ${data.publicUrl}`);
  }

  return urlMap;
}

function rewriteUrl(value: string | null, urlMap: Map<string, string>) {
  if (!value) return value;
  if (urlMap.has(value)) return urlMap.get(value)!;
  if (value.startsWith("/models/") || value.startsWith("/products/")) {
    console.warn(`  No upload found for ${value}`);
  }
  return value;
}

async function main() {
  console.log("Uploading models…\n");
  const modelUrls = await uploadDir(
    path.join(repoRoot, "public", "models"),
    "models",
    "/models"
  );

  console.log("\nUploading product images…\n");
  const productUrls = await uploadDir(
    path.join(repoRoot, "public", "products"),
    "products",
    "/products"
  );

  const allUrls = new Map([...modelUrls, ...productUrls]);

  console.log("\nUpdating products…\n");
  const { data: products, error: fetchError } = await admin.from("products").select("*");
  if (fetchError) throw fetchError;

  let updated = 0;
  for (const product of products ?? []) {
    const next = {
      image_url: rewriteUrl(product.image_url, allUrls),
      top_view_image_url: rewriteUrl(product.top_view_image_url, allUrls),
      model_url: rewriteUrl(product.model_url, allUrls),
    };

    const changed =
      next.image_url !== product.image_url ||
      next.top_view_image_url !== product.top_view_image_url ||
      next.model_url !== product.model_url;

    if (!changed) continue;

    const { error } = await admin.from("products").update(next).eq("id", product.id);
    if (error) throw error;

    console.log(`✓ ${product.name}`);
    updated += 1;
  }

  console.log(`\nUpdated ${updated} product(s).`);

  const { data: templates, error: templateFetchError } = await admin
    .from("templates")
    .select("id, name, thumbnail_url");
  if (templateFetchError) throw templateFetchError;

  let templatesUpdated = 0;
  for (const template of templates ?? []) {
    const thumbnail = rewriteUrl(template.thumbnail_url, allUrls);
    if (thumbnail === template.thumbnail_url) continue;

    const { error } = await admin
      .from("templates")
      .update({ thumbnail_url: thumbnail })
      .eq("id", template.id);
    if (error) throw error;

    console.log(`✓ template: ${template.name}`);
    templatesUpdated += 1;
  }

  if (templatesUpdated > 0) {
    console.log(`Updated ${templatesUpdated} template(s).`);
  }

  console.log("\nDone. Catalog assets now point at Supabase Storage.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message ?? err);
  process.exit(1);
});
