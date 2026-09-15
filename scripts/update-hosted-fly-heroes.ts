/**
 * Point approved fly heroes at the in-repo stills in HOSTED_FLY_HERO_BY_SLUG.
 *
 *   npx tsx scripts/update-hosted-fly-heroes.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Safe to re-run. Does not touch recipe text except bwo-parachute tying notes
 * when those notes still describe a Catskill/upright wing.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { HOSTED_FLY_HERO_BY_SLUG } from "../src/lib/flies/hosted-hero";

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

const BWO_PARA_TYING =
  "Same structure as a Parachute Adams: olive body, dun tail, and a parachute post. The post can be white or hi-vis. Change body and hackle color to match the Baetis in front of you.";

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

  for (const [slug, hero] of Object.entries(HOSTED_FLY_HERO_BY_SLUG)) {
    const { data: before, error: readErr } = await supabase
      .from("flies")
      .select("id, slug, hero_image_url, tying_overview, status")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!before) {
      console.error(`skip missing slug ${slug}`);
      continue;
    }

    const patch: { hero_image_url: string; tying_overview?: string } = {
      hero_image_url: hero,
    };
    if (slug === "bwo-parachute") {
      patch.tying_overview = BWO_PARA_TYING;
    }

    if (
      before.hero_image_url === hero &&
      (slug !== "bwo-parachute" || before.tying_overview === BWO_PARA_TYING)
    ) {
      console.log("already set", slug);
      continue;
    }

    const { error: writeErr } = await supabase
      .from("flies")
      .update(patch)
      .eq("id", before.id)
      .eq("slug", slug);
    if (writeErr) throw writeErr;
    console.log("updated", slug, hero);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
