/**
 * Promote a list of personal patterns to canonical flies.
 *
 * Reads pattern IDs from PATTERN_IDS below (or the --ids CLI arg, comma-
 * separated). For each, fetches the row from fly_patterns and calls
 * promoteToCanonical (which dual-writes to canonical_flies +
 * fly_patterns_v2 + fly_variants thanks to commit c0277c3).
 *
 * Catches are NOT migrated — the source personal pattern keeps them.
 * Manual cleanup later if Taylor wants catches reassigned to the canonical.
 *
 * Usage:
 *   tsx scripts/promote-personal-patterns.ts
 *   tsx scripts/promote-personal-patterns.ts --ids=uuid1,uuid2,uuid3
 *   tsx scripts/promote-personal-patterns.ts --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { promoteToCanonical } from "../src/lib/flies/promote-canonical";

// Inline .env.local loader
try {
  const c = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const l of c.split("\n")) {
    const t = l.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

// The 16 "would create new canonical" candidates from
// scripts/sweep-canonical-candidates.ts (run 2026-05-10).
const PATTERN_IDS = [
  "1946f383-832d-46f2-87c9-57cb72c5079b", // Lite Bright Perdigon
  "6c99ffb4-ce3f-4fe6-b1cf-f072b9758e96", // Fluorescent Surprise Perdigon
  "60a5b7e5-396d-4c22-84fb-b69b01b9eeb4", // Missing Link
  "15e5f77b-f50e-4863-ba52-e84bfca04e89", // CDC Pheasant Tail Pink
  "9c5f22d1-ec6e-463c-94c2-203c2ae2c1d1", // Elkhair Caddis (typo dupe)
  "cde9e619-ae2e-442d-ae00-b3f508f51cc6", // Stone Pony
  "9bc88432-fe10-4f36-8f55-70b480605fc3", // Sculpin Streamer (generic)
  "6597e74f-ed0e-4eef-aae1-c65b6db52530", // Purple Haze
  "e5fc11e8-61cd-43b9-85eb-619d9bc673eb", // BWO Sparkle Dun
  "7b0cb436-ecbf-4d13-97fe-e8e0625c2fda", // Pheasant Tail (likely shorthand)
  "0d472185-cb84-49fb-ba33-a43c73d74db0", // Hares Ear (likely shorthand)
  "422e5949-12e3-40f9-a63d-4f8cd4310e91", // Jack Daniels
  "763f959d-32b3-4b0d-aa09-e72102b1e913", // Eggstasy Yellow
  "fd7b86db-ab95-438a-881c-cddbf7c3b49d", // Sexy Walts
  "6cb28afd-26bf-46ea-a024-21d746fe9246", // France Fly
  "579f7274-b1ad-4f16-8c93-c4e8ef5a05f2", // Silver Bullet
];

interface FlyPatternRow {
  id: string;
  name: string;
  type: string | null;
  notes: string | null;
  description: string | null;
  materials: string | null;
  hook: string | null;
  size: string | null;
  fly_color: string | null;
  bead_color: string | null;
  bead_size: string | null;
  imitates: string[] | null;
  effective_species: string[] | null;
  parent_canonical_id: string | null;
  provenance_credit: string | null;
  user_id: string;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const dryRun = process.argv.includes("--dry-run");
  const idsArg = process.argv.find((a) => a.startsWith("--ids="));
  const ids = idsArg ? idsArg.slice(6).split(",").map((s) => s.trim()).filter(Boolean) : PATTERN_IDS;

  const sb = createClient(url, key, { auth: { persistSession: false } });

  console.log(`Promoting ${ids.length} personal patterns${dryRun ? " (DRY RUN)" : ""}...\n`);

  const results = { promoted: 0, skipped: 0, errored: 0 };

  for (const id of ids) {
    const { data: pat, error } = await sb
      .from("fly_patterns")
      .select(
        "id, name, type, notes, description, materials, hook, size, fly_color, bead_color, bead_size, imitates, effective_species, parent_canonical_id, provenance_credit, user_id, promoted_to_canonical_id",
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !pat) {
      console.log(`SKIP ${id}: not found (${error?.message ?? "no row"})`);
      results.skipped++;
      continue;
    }

    const row = pat as FlyPatternRow & { promoted_to_canonical_id: string | null };
    if (row.promoted_to_canonical_id) {
      console.log(`SKIP "${row.name}": already promoted → ${row.promoted_to_canonical_id}`);
      results.skipped++;
      continue;
    }

    const description =
      row.description?.trim() ||
      row.notes?.trim() ||
      `${row.name} — placeholder canonical promoted from a personal pattern. Fill in details via the admin editor.`;

    const proposed = {
      name: row.name.trim(),
      type: row.type, // promote-canonical maps "Nymph" → "nymph" via mapTypeToCategory
      description,
      materials: row.materials,
      sizes: row.size ? [row.size] : null,
      imitates: row.imitates,
      effectiveSpecies: row.effective_species,
      originCredit: row.provenance_credit ?? "Executive Angler Staff",
      parentCanonicalId: row.parent_canonical_id,
    };

    if (dryRun) {
      console.log(`DRY  "${row.name}" [${row.type ?? "?"}] → would promote with description: "${description.slice(0, 60)}..."`);
      results.promoted++;
      continue;
    }

    const result = await promoteToCanonical(sb, {
      sourcePatternId: row.id,
      proposed,
    });

    if (result.ok) {
      console.log(`OK   "${row.name}" → canonical ${result.canonicalId}`);
      results.promoted++;
    } else {
      console.error(`FAIL "${row.name}": ${result.error}`);
      results.errored++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
