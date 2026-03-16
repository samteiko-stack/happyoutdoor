import { put } from "@vercel/blob";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: join(process.cwd(), ".env.local") });

async function migrateModels() {
  const modelsDir = join(process.cwd(), "public", "models");
  const files = await readdir(modelsDir);

  console.log(`Found ${files.length} models to migrate\n`);

  for (const filename of files) {
    try {
      const filePath = join(modelsDir, filename);
      const fileBuffer = await readFile(filePath);
      const file = new File([fileBuffer], filename);

      console.log(`Uploading ${filename}...`);
      
      const blob = await put(`models/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
      });

      console.log(`✓ ${filename} → ${blob.url}\n`);
    } catch (error) {
      console.error(`✗ Failed to upload ${filename}:`, error);
    }
  }

  console.log("Migration complete!");
}

migrateModels();
