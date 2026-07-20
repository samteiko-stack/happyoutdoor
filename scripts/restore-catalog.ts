/**
 * Restore categories, products, and templates from backup.sql into Supabase.
 * Run: npm run restore-catalog
 */
import dotenv from "dotenv";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { v5 as uuidv5 } from "uuid";

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

const LEGACY_NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

function legacyId(id: string) {
  return uuidv5(id, LEGACY_NAMESPACE);
}

function msToIso(ms: number | null) {
  if (!ms) return new Date().toISOString();
  return new Date(ms).toISOString();
}

function emptyToNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return value;
}

function rewriteLayoutProductIds(layoutData: string, idMap: Map<string, string>) {
  try {
    const items = JSON.parse(layoutData) as Array<{ productId?: string; [key: string]: unknown }>;
    if (!Array.isArray(items)) return layoutData;
    const next = items.map((item) => {
      if (!item.productId) return item;
      const mapped = idMap.get(item.productId);
      return mapped ? { ...item, productId: mapped } : item;
    });
    return JSON.stringify(next);
  } catch {
    return layoutData;
  }
}

function querySqlite<T>(dbPath: string, sql: string): T[] {
  const out = execSync(`sqlite3 -json ${JSON.stringify(dbPath)} ${JSON.stringify(sql)}`, {
    encoding: "utf8",
  }).trim();
  if (!out) return [];
  return JSON.parse(out) as T[];
}

async function main() {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const backupPath = path.join(repoRoot, "backup.sql");
  if (!fs.existsSync(backupPath)) {
    console.error("backup.sql not found at repo root");
    process.exit(1);
  }

  const dbPath = path.join(os.tmpdir(), `happy-balcony-restore-${Date.now()}.db`);
  fs.writeFileSync(dbPath, "");
  execSync(`sqlite3 ${JSON.stringify(dbPath)} < ${JSON.stringify(backupPath)}`, {
    stdio: "inherit",
    shell: "/bin/bash",
  });

  type CategoryRow = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    sortOrder: number;
    createdAt: number;
  };
  type ProductRow = {
    id: string;
    name: string;
    categoryId: string | null;
    description: string | null;
    price: number;
    affiliateLink: string | null;
    imageUrl: string | null;
    topViewImageUrl: string | null;
    modelUrl: string | null;
    widthCm: number;
    heightCm: number;
    createdAt: number;
    updatedAt: number;
  };
  type TemplateRow = {
    id: string;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    balconyWidthCm: number;
    balconyHeightCm: number;
    layoutData: string;
    isPublished: number;
    createdAt: number;
    updatedAt: number;
  };

  const categories = querySqlite<CategoryRow>(dbPath, 'SELECT * FROM "Category"');
  const products = querySqlite<ProductRow>(dbPath, 'SELECT * FROM "Product"');
  const templates = querySqlite<TemplateRow>(dbPath, 'SELECT * FROM "Template"');

  const idMap = new Map<string, string>();
  for (const row of [...categories, ...products, ...templates]) {
    idMap.set(row.id, legacyId(row.id));
  }

  console.log(
    `Found ${categories.length} categories, ${products.length} products, ${templates.length} templates\n`
  );

  const { count: existingProducts } = await admin
    .from("products")
    .select("*", { count: "exact", head: true });

  if ((existingProducts ?? 0) > 0) {
    console.log("Supabase already has catalog data. Skipping restore.");
    fs.unlinkSync(dbPath);
    return;
  }

  const categoryRows = categories.map((c) => ({
    id: idMap.get(c.id)!,
    name: c.name,
    slug: c.slug,
    icon: emptyToNull(c.icon),
    sort_order: c.sortOrder,
    created_at: msToIso(c.createdAt),
  }));

  const { error: categoryError } = await admin.from("categories").insert(categoryRows);
  if (categoryError) throw categoryError;
  console.log(`Restored ${categoryRows.length} categories`);

  const productRows = products.map((p) => ({
    id: idMap.get(p.id)!,
    name: p.name,
    category_id: p.categoryId ? idMap.get(p.categoryId) ?? null : null,
    description: emptyToNull(p.description),
    price: p.price,
    affiliate_link: emptyToNull(p.affiliateLink),
    image_url: emptyToNull(p.imageUrl),
    top_view_image_url: emptyToNull(p.topViewImageUrl),
    model_url: emptyToNull(p.modelUrl),
    width_cm: p.widthCm,
    height_cm: p.heightCm,
    created_at: msToIso(p.createdAt),
    updated_at: msToIso(p.updatedAt),
  }));

  const { error: productError } = await admin.from("products").insert(productRows);
  if (productError) throw productError;
  console.log(`Restored ${productRows.length} products`);

  const templateRows = templates.map((t) => ({
    id: idMap.get(t.id)!,
    name: t.name,
    description: emptyToNull(t.description),
    thumbnail_url: emptyToNull(t.thumbnailUrl),
    balcony_width_cm: t.balconyWidthCm,
    balcony_height_cm: t.balconyHeightCm,
    layout_data: rewriteLayoutProductIds(t.layoutData, idMap),
    is_published: Boolean(t.isPublished),
    created_at: msToIso(t.createdAt),
    updated_at: msToIso(t.updatedAt),
  }));

  const { error: templateError } = await admin.from("templates").insert(templateRows);
  if (templateError) throw templateError;
  console.log(`Restored ${templateRows.length} templates`);

  fs.unlinkSync(dbPath);

  console.log("\nDone. Refresh the app — products and templates should be back.");
}

main().catch((err) => {
  console.error("Restore failed:", err.message ?? err);
  process.exit(1);
});
