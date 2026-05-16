/**
 * Read-only audit of every canonical fly across both recipe stores:
 *
 *   1. flies.materials_list (jsonb)
 *   2. fly_recipe_ingredients WHERE canonical_fly_id = flies.id
 *
 * Prints a per-fly summary + bucket counts so we can size the
 * reconciliation cleanly.
 *
 * Run: npx tsx scripts/audit-recipe-stores.ts             (counts only)
 *      npx tsx scripts/audit-recipe-stores.ts --details   (every fly)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  const envText = readFileSync(".env.local", "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface FlyRow {
  id: string;
  slug: string;
  name: string;
  materials_list: unknown;
}

interface IngRow {
  canonical_fly_id: string;
}

async function main() {
  const showDetails = process.argv.includes("--details");

  const { data: flies, error: flyErr } = await supabase
    .from("flies")
    .select("id, slug, name, materials_list")
    .eq("status", "approved")
    .order("name");
  if (flyErr) {
    console.error("Fly query failed:", flyErr);
    process.exit(1);
  }

  const { data: ings, error: ingErr } = await supabase
    .from("fly_recipe_ingredients")
    .select("canonical_fly_id")
    .not("canonical_fly_id", "is", null);
  if (ingErr) {
    console.error("Ingredient query failed:", ingErr);
    process.exit(1);
  }

  const ingCountById = new Map<string, number>();
  for (const r of (ings ?? []) as IngRow[]) {
    if (!r.canonical_fly_id) continue;
    ingCountById.set(
      r.canonical_fly_id,
      (ingCountById.get(r.canonical_fly_id) ?? 0) + 1,
    );
  }

  let bothEmpty = 0;
  let libraryOnly = 0;
  let workbenchOnly = 0;
  let bothPopulated = 0;
  const detailLines: string[] = [];

  for (const f of (flies ?? []) as FlyRow[]) {
    const mlLen = Array.isArray(f.materials_list) ? f.materials_list.length : 0;
    const ingLen = ingCountById.get(f.id) ?? 0;

    let bucket: string;
    if (mlLen === 0 && ingLen === 0) {
      bothEmpty++;
      bucket = "EMPTY    ";
    } else if (mlLen > 0 && ingLen === 0) {
      libraryOnly++;
      bucket = "LIB-only ";
    } else if (mlLen === 0 && ingLen > 0) {
      workbenchOnly++;
      bucket = "WB-only  ";
    } else {
      bothPopulated++;
      bucket = "BOTH     ";
    }

    detailLines.push(
      `  ${bucket}  ml=${String(mlLen).padStart(2)}  wb=${String(ingLen).padStart(2)}  ${f.slug.padEnd(38)}  ${f.name}`,
    );
  }

  const total = (flies ?? []).length;
  console.log(`\nAudit of ${total} approved canonical flies:\n`);
  console.log(`  EMPTY (both stores)        : ${bothEmpty}`);
  console.log(`  LIB-only (materials_list)  : ${libraryOnly}`);
  console.log(`  WB-only (ingredients)      : ${workbenchOnly}`);
  console.log(`  BOTH (potentially diverge) : ${bothPopulated}\n`);

  if (showDetails) {
    console.log("Per-fly:");
    for (const line of detailLines) console.log(line);
    console.log("");
  } else {
    console.log("Pass --details for per-fly breakdown.\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
