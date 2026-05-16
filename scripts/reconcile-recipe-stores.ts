/**
 * Unify the two recipe stores so every canonical fly is consistent.
 *
 * Direction A — Workbench (fly_recipe_ingredients) → Library (materials_list):
 *   For every fly with ingredient rows, rebuild materials_list from them.
 *   Workbench wins on conflict (per user decision 2026-05-16).
 *
 * Direction B — Library (materials_list) → Workbench (ingredients):
 *   For every fly with materials_list but NO ingredient rows (the 12
 *   LIB-only flies from the audit), insert ingredient rows derived from
 *   materials_list. Attempts material_id lookup by name+brand match against
 *   tying_materials so future inventory ops work.
 *
 * Run: npx tsx scripts/reconcile-recipe-stores.ts            (dry-run summary)
 *      npx tsx scripts/reconcile-recipe-stores.ts --details  (every fly)
 *      npx tsx scripts/reconcile-recipe-stores.ts --apply    (commit)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import {
  ingredientsToMaterialSlots,
  materialSlotsToIngredientInserts,
  type IngredientRow,
  type IngredientInsert,
} from "../src/lib/flies/recipe-conversion";
import type { MaterialSlot } from "../src/types/flies";

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
  materials_list: MaterialSlot[] | null;
}

interface TyingMaterialRow {
  id: string;
  name: string;
  brand: string | null;
}

function normalizeForMatch(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Stable canonical JSON: sort object keys recursively, ignore null/undefined. */
function canonicalize(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonicalize);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(o).sort()) {
      if (o[k] === null || o[k] === undefined) continue;
      out[k] = canonicalize(o[k]);
    }
    return out;
  }
  return v;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));
}

async function buildMaterialLookup(): Promise<Map<string, string>> {
  // Lookup keyed by "{brand}|{name}" lowercased. Single bulk fetch.
  const lookup = new Map<string, string>();
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("tying_materials")
      .select("id, name, brand")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data ?? []) as TyingMaterialRow[];
    for (const r of rows) {
      const key = `${normalizeForMatch(r.brand)}|${normalizeForMatch(r.name)}`;
      if (!lookup.has(key)) lookup.set(key, r.id);
      // Also index by name alone for brand-less matches
      const nameOnly = `|${normalizeForMatch(r.name)}`;
      if (!lookup.has(nameOnly)) lookup.set(nameOnly, r.id);
    }
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return lookup;
}

function tryMatchMaterialId(
  slot: MaterialSlot & Record<string, unknown>,
  lookup: Map<string, string>,
): string | null {
  if (typeof slot.material_id === "string") return slot.material_id;
  const name = (typeof slot.material_name === "string" && slot.material_name) || slot.material;
  if (!name) return null;
  const brand = typeof slot.brand === "string" ? slot.brand : "";
  const keyed = `${normalizeForMatch(brand)}|${normalizeForMatch(name)}`;
  if (lookup.has(keyed)) return lookup.get(keyed)!;
  const nameOnly = `|${normalizeForMatch(name)}`;
  if (lookup.has(nameOnly)) return lookup.get(nameOnly)!;
  return null;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const details = process.argv.includes("--details");

  console.log(apply ? "APPLY MODE" : "DRY-RUN MODE");
  console.log("Fetching flies + ingredients…");

  const { data: flies, error: flyErr } = await supabase
    .from("flies")
    .select("id, slug, name, materials_list")
    .eq("status", "approved")
    .order("name");
  if (flyErr) throw flyErr;

  // Fetch all ingredient rows for canonicals, with joined material.
  const ingByFly = new Map<string, IngredientRow[]>();
  {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("fly_recipe_ingredients")
        .select(
          "id, canonical_fly_id, material_id, material_name, step_position, role, quantity, notes, color_choice, size_choice, is_optional, material:tying_materials(id, name, brand, category, material_type, finish)",
        )
        .not("canonical_fly_id", "is", null)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (data ?? []) as any[];
      for (const r of rows) {
        const k = r.canonical_fly_id as string;
        if (!ingByFly.has(k)) ingByFly.set(k, []);
        ingByFly.get(k)!.push(r as IngredientRow);
      }
      if (rows.length < PAGE) break;
      from += PAGE;
    }
  }

  console.log(
    `  Loaded ${flies?.length ?? 0} flies and ${[...ingByFly.values()].reduce((a, b) => a + b.length, 0)} ingredient rows`,
  );

  // Direction A: ingredients → materials_list (Workbench wins)
  const aPlans: {
    fly: FlyRow;
    newSlots: MaterialSlot[];
    oldLen: number;
  }[] = [];
  // Direction B: materials_list → ingredients (LIB-only backfill)
  const bPlans: {
    fly: FlyRow;
    inserts: IngredientInsert[];
    matched: number;
    unmatched: number;
  }[] = [];

  const lookup = await buildMaterialLookup();
  console.log(`  Built material lookup with ${lookup.size} keys`);

  for (const f of (flies ?? []) as FlyRow[]) {
    const ings = ingByFly.get(f.id) ?? [];
    const ml = Array.isArray(f.materials_list) ? f.materials_list : [];

    if (ings.length > 0) {
      const newSlots = ingredientsToMaterialSlots(ings);
      // Only plan a write if it differs from current materials_list.
      const same = deepEqual(newSlots, ml);
      if (!same) {
        aPlans.push({ fly: f, newSlots, oldLen: ml.length });
      }
    } else if (ml.length > 0) {
      const inserts = materialSlotsToIngredientInserts(ml, f.id);
      let matched = 0;
      for (const ins of inserts) {
        if (ins.material_id) {
          matched++;
          continue;
        }
        const seedSlot = ml.find((s, i) => i === inserts.indexOf(ins));
        const mid = seedSlot ? tryMatchMaterialId(seedSlot as MaterialSlot & Record<string, unknown>, lookup) : null;
        if (mid) {
          ins.material_id = mid;
          matched++;
        }
      }
      const unmatched = inserts.length - matched;
      bPlans.push({ fly: f, inserts, matched, unmatched });
    }
  }

  console.log(`\nDirection A — Workbench → Library (overwrite materials_list)`);
  console.log(`  ${aPlans.length} flies need updating`);
  if (details) {
    for (const p of aPlans) {
      console.log(
        `    ${p.fly.slug.padEnd(38)} ml ${String(p.oldLen).padStart(2)} → ${p.newSlots.length}  ${p.fly.name}`,
      );
    }
  }

  console.log(`\nDirection B — Library → Workbench (insert ingredients)`);
  console.log(`  ${bPlans.length} flies need ingredient backfill`);
  for (const p of bPlans) {
    console.log(
      `    ${p.fly.slug.padEnd(38)} ${p.inserts.length} slots (matched ${p.matched}, free-text ${p.unmatched})  ${p.fly.name}`,
    );
  }

  if (!apply) {
    console.log("\nDry-run only. Pass --apply to commit.");
    return;
  }

  console.log("\nApplying Direction A…");
  let aOk = 0;
  let aFail = 0;
  for (const p of aPlans) {
    const { error } = await supabase
      .from("flies")
      .update({
        materials_list: p.newSlots,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.fly.id);
    if (error) {
      console.error(`  ✗ ${p.fly.slug}: ${error.message}`);
      aFail++;
    } else {
      aOk++;
    }
  }
  console.log(`  A: ${aOk} updated, ${aFail} failed`);

  console.log("\nApplying Direction B…");
  let bOk = 0;
  let bFail = 0;
  for (const p of bPlans) {
    // Delete any stragglers just in case, then insert fresh
    await supabase
      .from("fly_recipe_ingredients")
      .delete()
      .eq("canonical_fly_id", p.fly.id);
    const { error } = await supabase
      .from("fly_recipe_ingredients")
      .insert(p.inserts);
    if (error) {
      console.error(`  ✗ ${p.fly.slug}: ${error.message}`);
      bFail++;
    } else {
      bOk++;
    }
  }
  console.log(`  B: ${bOk} updated, ${bFail} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
