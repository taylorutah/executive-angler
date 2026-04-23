/**
 * One-off: update hero_image_url + thumbnail_url for all articles
 * from the local src/data/articles.ts.
 */
import { createClient } from "@supabase/supabase-js";
import { articles } from "../src/data/articles";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log(`Updating hero/thumbnail URLs for ${articles.length} articles...`);
  let ok = 0;
  for (const a of articles) {
    const { error } = await supabase
      .from("articles")
      .update({
        hero_image_url: a.heroImageUrl,
        thumbnail_url: a.thumbnailUrl ?? a.heroImageUrl,
      })
      .eq("slug", a.slug);
    if (error) {
      console.error(`  ✗ ${a.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${a.slug}`);
      ok++;
    }
  }
  console.log(`Done: ${ok}/${articles.length} updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
