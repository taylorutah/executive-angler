/**
 * One-off: update hero_image_url + thumbnail_url for all destinations
 * from the local src/data/destinations.ts (now pointing to /images/destinations/*).
 */
import { createClient } from "@supabase/supabase-js";
import { destinations } from "../src/data/destinations";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log(`Updating hero/thumbnail URLs for ${destinations.length} destinations...`);
  let ok = 0;
  for (const d of destinations) {
    const { error } = await supabase
      .from("destinations")
      .update({
        hero_image_url: d.heroImageUrl,
        thumbnail_url: d.thumbnailUrl ?? d.heroImageUrl,
      })
      .eq("slug", d.slug);
    if (error) {
      console.error(`  ✗ ${d.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${d.slug}`);
      ok++;
    }
  }
  console.log(`Done: ${ok}/${destinations.length} updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
