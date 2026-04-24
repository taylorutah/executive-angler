import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing env");
  process.exit(1);
}

const s = createClient(url, key);

async function main() {
  const { data, error } = await s
    .from("rivers")
    .select("slug, name, hero_image_url, thumbnail_url")
    .order("slug");
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Total rivers in Supabase: ${data!.length}`);
  const ext = data!.filter(
    (r) => r.hero_image_url && !r.hero_image_url.startsWith("/"),
  );
  const loc = data!.filter(
    (r) => r.hero_image_url && r.hero_image_url.startsWith("/"),
  );
  const none = data!.filter((r) => !r.hero_image_url);
  console.log(`External: ${ext.length}  Local: ${loc.length}  None: ${none.length}`);
  console.log();
  console.log("=== LOCAL ===");
  loc.forEach((r) => console.log(" ", r.slug, "->", r.hero_image_url));
  console.log();
  console.log("=== NONE ===");
  none.forEach((r) => console.log(" ", r.slug));
  console.log();
  console.log("=== EXTERNAL (first 10) ===");
  ext.slice(0, 10).forEach((r) => console.log(" ", r.slug));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
