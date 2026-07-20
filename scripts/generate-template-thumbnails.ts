/**
 * Capture real 3D isometric snapshots from the designer for template previews.
 * Requires the dev server: npm run dev
 *
 * Run: npm run generate:template-thumbnails
 * Force replace existing previews: npm run generate:template-thumbnails -- --force
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { chromium, type Page } from "playwright";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.APP_URL ?? "http://localhost:3002";
const captureEmail = process.env.CAPTURE_USER_EMAIL ?? "user@happyoutdoor.co.uk";
const capturePassword = process.env.CAPTURE_USER_PASSWORD ?? "user123456";
const force = process.argv.includes("--force");

declare global {
  interface Window {
    __designerSnapshot?: () => string | null;
  }
}

function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Invalid data URL");
  return Buffer.from(base64, "base64");
}

async function login(page: Page) {
  await page.goto(`${appUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', captureEmail);
  await page.fill('input[name="password"]', capturePassword);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 30_000 });
}

async function waitForScene(page: Page) {
  await page.waitForSelector(".designer-viewport canvas", { timeout: 120_000 });
  await page
    .waitForFunction(() => !document.body.innerText.includes("Loading 3D"), {
      timeout: 120_000,
    })
    .catch(() => undefined);
  await page
    .waitForFunction(() => typeof window.__designerSnapshot === "function", {
      timeout: 60_000,
    })
    .catch(() => undefined);

  const perspectiveButton = page.getByRole("button", { name: "3D" });
  if (await perspectiveButton.isVisible().catch(() => false)) {
    await perspectiveButton.click().catch(() => undefined);
  }

  await page.waitForTimeout(10_000);
}

async function captureSnapshot(page: Page): Promise<Buffer | null> {
  const dataUrl = await page.evaluate(async () => {
    const capture = window.__designerSnapshot;
    if (!capture) return null;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await new Promise((resolve) => setTimeout(resolve, 400));

      const next = capture();
      if (typeof next === "string" && next.startsWith("data:image/") && next.length > 30_000) {
        return next;
      }
    }

    return null;
  });

  if (!dataUrl) return null;
  const buffer = dataUrlToBuffer(dataUrl);
  return buffer.byteLength >= 2048 ? buffer : null;
}

async function main() {
  if (!url || !serviceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  try {
    const health = await fetch(appUrl);
    if (!health.ok) throw new Error(`HTTP ${health.status}`);
  } catch {
    console.error(`App is not reachable at ${appUrl}. Start it with: npm run dev`);
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: templates, error } = await admin
    .from("templates")
    .select("id, name, thumbnail_url")
    .order("created_at");

  if (error) {
    console.error("Failed to load templates:", error.message);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });

  let updated = 0;

  try {
    await login(page);

    for (const template of templates ?? []) {
      if (template.thumbnail_url && !force) {
        console.log(`Skip (has preview): ${template.name}`);
        continue;
      }

      console.log(`Capturing: ${template.name}`);
      await page.goto(`${appUrl}/designer?template=${template.id}`, {
        waitUntil: "domcontentloaded",
        timeout: 120_000,
      });

      await waitForScene(page);
      const buffer = await captureSnapshot(page);

      if (!buffer) {
        console.error(`  Capture failed for ${template.name}`);
        continue;
      }

      const path = `templates/${template.id}.jpg`;
      const { error: uploadError } = await admin.storage.from("snapshots").upload(path, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (uploadError) {
        console.error(`  Upload failed for ${template.name}:`, uploadError.message);
        continue;
      }

      const { data: urlData } = admin.storage.from("snapshots").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;
      const { error: updateError } = await admin
        .from("templates")
        .update({ thumbnail_url: publicUrl })
        .eq("id", template.id);

      if (updateError) {
        console.error(`  DB update failed for ${template.name}:`, updateError.message);
        continue;
      }

      updated += 1;
      console.log(`  Saved ${Math.round(buffer.byteLength / 1024)}KB → ${urlData.publicUrl}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Done. ${updated} template preview(s) captured from the 3D canvas.`);
  if (updated === 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
