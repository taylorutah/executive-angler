/**
 * One-off: set every river's hero_image_url + thumbnail_url to
 * `/images/rivers/{slug}-hero.jpg` for each river that has a file on disk.
 * Rivers already pointing to `/images/henrys-fork.jpg` and
 * `/images/madison-river-three-dollar-bridge.jpg` are skipped (keep as-is).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing env");
  process.exit(1);
}

const s = createClient(url, key);
const IMG_DIR = path.resolve("public/images/rivers");

async function main() {
  const { data, error } = await s
    .from("rivers")
    .select("slug, hero_image_url");
  if (error) throw error;

  const disk = new Set(
    fs.readdirSync(IMG_DIR).filter((f) => f.endsWith("-hero.jpg")),
  );

  let ok = 0,
    skipped = 0,
    missing = 0,
    errors = 0;
  for (const r of data!) {
    const file = `${r.slug}-hero.jpg`;
    if (!disk.has(file)) {
      // Keep existing local paths for madison and henrys-fork
      if (r.hero_image_url?.startsWith("/")) {
        skipped++;
        continue;
      }
      console.error(`  ! missing image for ${r.slug}`);
      missing++;
      continue;
    }
    const localPath = `/images/rivers/${file}`;
    const { error: upErr } = await s
      .from("rivers")
      .update({ hero_image_url: localPath, thumbnail_url: localPath })
      .eq("slug", r.slug);
    if (upErr) {
      console.error(`  ✗ ${r.slug}: ${upErr.message}`);
      errors++;
    } else {
      ok++;
    }
  }
  console.log(
    `Done: ${ok} updated, ${skipped} skipped (already local), ${missing} missing images, ${errors} errors`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
