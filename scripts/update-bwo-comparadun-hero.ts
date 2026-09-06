/**
 * Point the approved BWO Comparadun hero at the in-repo still.
 *
 *   npx tsx scripts/update-bwo-comparadun-hero.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (.env.local or the environment). Safe to re-run. Does not touch recipe text.
 *
 * Equivalent SQL (run after this asset is on production, or the public page
 * 404s the hero until the JPEG ships):
 *
 *   UPDATE flies
 *   SET hero_image_url = '/images/flies/blue-winged-olive-comparadun.jpg'
 *   WHERE slug = 'blue-winged-olive-comparadun'
 *     AND deleted_at IS NULL;
 *
 * Verify:
 *
 *   SELECT slug, hero_image_url, status
 *   FROM flies
 *   WHERE slug = 'blue-winged-olive-comparadun';
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

try {
  const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // rely on the environment
}

const SLUG = "blue-winged-olive-comparadun";
const HERO = "/images/flies/blue-winged-olive-comparadun.jpg";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: before, error: readErr } = await supabase
    .from("flies")
    .select("id, slug, hero_image_url, status")
    .eq("slug", SLUG)
    .is("deleted_at", null)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!before) {
    console.error(`No flies row for slug ${SLUG}`);
    process.exit(1);
  }
  console.log("before", before);

  if (before.hero_image_url === HERO) {
    console.log("already set; no update");
    return;
  }

  const { data: after, error: writeErr } = await supabase
    .from("flies")
    .update({ hero_image_url: HERO })
    .eq("id", before.id)
    .eq("slug", SLUG)
    .select("id, slug, hero_image_url, status")
    .maybeSingle();
  if (writeErr) throw writeErr;
  console.log("after", after);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
