/**
 * Batch-import flies from a JSON file into the post-2026-05-15 `flies` table.
 *
 * Usage:
 *   SEED_ADMIN_USER_ID=<uuid> tsx scripts/seed-flies-batch.ts <input.json> [--force-name]
 *
 * Behavior:
 *   - Idempotent: skips rows whose slug already exists in `flies`
 *   - Name-similarity guard: skips rows within Levenshtein distance 2 of an
 *     existing fly name. Override with --force-name (use sparingly).
 *   - origin_credit is REQUIRED per row (use "Classic pattern, originator
 *     unknown" if truly unknown). Every canonical fly needs provenance.
 *   - Inserts as status='approved' with admin user as both submitter +
 *     approver, so the row is immediately visible via the `canonical_flies`
 *     view and on /flies/[slug].
 *   - Defaults missing hero_image_url to /images/fly-icons/<category>.svg
 *     (reuses existing per-category icon SVGs)
 *   - Writes a per-run log to scripts/logs/seed-flies-batch-<timestamp>.log
 *
 * Input shape (one object per fly):
 *   {
 *     "name": "Purple Haze",
 *     "category": "dry",                          // required: dry|nymph|streamer|emerger|wet|terrestrial|egg|midge|other
 *     "origin_credit": "Andy Carlson",            // required
 *     "description": "Parachute Adams variant with a purple body.",
 *     "history": "Originated on the Big Hole...",
 *     "tying_overview": "...",
 *     "fishing_tips": "...",
 *     "recipe_notes": "...",
 *     "imitates": ["mayfly", "BWO"],
 *     "water_types": ["freestone", "tailwater"],
 *     "video_url": "https://www.youtube.com/...",
 *     "hero_image_url": "https://..."             // optional; falls back to category placeholder
 *     "materials_list": [                         // see MaterialSlot in src/types/flies.ts
 *       { "slot": "hook",   "material": "TMC 100 — size 16", "brand": "Tiemco" },
 *       { "slot": "thread", "material": "UTC 70 black", "brand": "UTC" },
 *       { "slot": "body",   "material": "Purple superfine dubbing" }
 *     ],
 *     "option_envelope": {                        // recommended options — informational only
 *       "sizes": [12, 14, 16, 18, 20],
 *       "bead": { "sizes_mm": [2.5, 3.0, 3.3], "colors": ["copper","gold"], "materials": ["tungsten"] },
 *       "colors": { "body": ["purple","olive"], "rib": ["red"] }
 *     }
 *   }
 *
 * Legacy field aliases (for old input files):
 *   - `base_materials` → `materials_list`
 *   - `default_size` + ignored `tying_steps`/`hook_style` — silently dropped
 *     since the v3 model has no analog. If you want sizes recommended on the
 *     fly, put them in `option_envelope.sizes`.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Inline .env.local loader
try {
  const envContent = fs.readFileSync(
    path.resolve(process.cwd(), ".env.local"),
    "utf-8",
  );
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const FLY_CATEGORIES = [
  "dry",
  "nymph",
  "streamer",
  "emerger",
  "wet",
  "terrestrial",
  "egg",
  "midge",
  "other",
] as const;
type FlyCategory = (typeof FLY_CATEGORIES)[number];

interface MaterialSlotInput {
  slot: string;
  material: string;
  description?: string;
  brand?: string;
  is_optional?: boolean;
}

interface OptionEnvelopeInput {
  sizes?: number[];
  bead?: {
    sizes_mm?: number[];
    colors?: string[];
    materials?: string[];
  };
  colors?: Record<string, string[]>;
}

interface BatchPattern {
  name: string;
  category: FlyCategory;
  origin_credit: string;
  description?: string;
  history?: string;
  tying_overview?: string;
  fishing_tips?: string;
  recipe_notes?: string;
  imitates?: string[];
  water_types?: string[];
  video_url?: string;
  hero_image_url?: string;
  materials_list?: MaterialSlotInput[];
  option_envelope?: OptionEnvelopeInput;
  // Legacy aliases — silently mapped onto the new shape
  base_materials?: MaterialSlotInput[];
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")    // strip accents (Luboš → lubos)
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "fly"
  );
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  const forceName = process.argv.includes("--force-name");

  if (!inputPath) {
    console.error(
      "Usage: SEED_ADMIN_USER_ID=<uuid> tsx scripts/seed-flies-batch.ts <input.json> [--force-name]",
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminUserId = process.env.SEED_ADMIN_USER_ID;
  if (!url || !key || !adminUserId) {
    console.error(
      "Missing required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ADMIN_USER_ID",
    );
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  const raw = fs.readFileSync(path.resolve(inputPath), "utf8");
  const parsed = JSON.parse(raw);
  const input: BatchPattern[] = Array.isArray(parsed) ? parsed : [parsed];
  console.log(`Loaded ${input.length} pattern(s) from ${inputPath}`);

  // Pull existing flies once for slug + Levenshtein checks.
  const { data: existing, error: existingErr } = await sb
    .from("flies")
    .select("id, slug, name");
  if (existingErr) {
    console.error("Couldn't fetch existing flies:", existingErr.message);
    process.exit(1);
  }
  const existingSlugs = new Set<string>(
    (existing ?? []).map((r) => r.slug as string),
  );
  const existingNames: Array<{ slug: string; name: string }> = (
    existing ?? []
  ).map((r) => ({ slug: r.slug as string, name: r.name as string }));
  console.log(`Found ${existingSlugs.size} existing flies.`);

  const summary = { inserted: 0, skipped_slug: 0, skipped_similar: 0, errored: 0 };
  const logLines: string[] = [];
  const nowIso = new Date().toISOString();

  for (const row of input) {
    if (!row.name?.trim()) {
      console.warn("ERROR: row missing name — skipping");
      summary.errored++;
      logLines.push(`ERROR_VALIDATION\t-\tmissing name`);
      continue;
    }
    if (!row.origin_credit?.trim()) {
      console.warn(
        `ERROR: ${row.name} missing origin_credit — every canonical needs provenance, even "Classic pattern, originator unknown". Skipping.`,
      );
      summary.errored++;
      logLines.push(`ERROR_VALIDATION\t${row.name}\tmissing origin_credit`);
      continue;
    }
    if (!FLY_CATEGORIES.includes(row.category)) {
      console.warn(
        `ERROR: ${row.name} has invalid category "${row.category}". Allowed: ${FLY_CATEGORIES.join(", ")}. Skipping.`,
      );
      summary.errored++;
      logLines.push(`ERROR_VALIDATION\t${row.name}\tbad category ${row.category}`);
      continue;
    }

    const slug = slugify(row.name);

    if (existingSlugs.has(slug)) {
      console.log(`SKIP slug exists: "${row.name}" (${slug})`);
      summary.skipped_slug++;
      logLines.push(`SKIP_SLUG\t${slug}\t${row.name}`);
      continue;
    }

    if (!forceName) {
      const lname = row.name.toLowerCase();
      const similar = existingNames.find(
        (n) => levenshtein(n.name.toLowerCase(), lname) <= 2,
      );
      if (similar) {
        console.warn(
          `SKIP near-duplicate: "${row.name}" ~ "${similar.name}" (${similar.slug}). Re-run with --force-name to insert anyway.`,
        );
        summary.skipped_similar++;
        logLines.push(
          `SKIP_SIMILAR\t${slug}\t${row.name}\t~\t${similar.slug}`,
        );
        continue;
      }
    }

    const heroImageUrl =
      row.hero_image_url ?? `/images/fly-icons/${row.category}.svg`;
    const description = row.description ?? `${row.name} fly pattern.`;
    const materialsList = row.materials_list ?? row.base_materials ?? [];
    const optionEnvelope = row.option_envelope ?? {};

    const { data: inserted, error: insErr } = await sb
      .from("flies")
      .insert({
        slug,
        name: row.name,
        category: row.category,
        description,
        history: row.history ?? null,
        tying_overview: row.tying_overview ?? null,
        fishing_tips: row.fishing_tips ?? null,
        recipe_notes: row.recipe_notes ?? null,
        hero_image_url: heroImageUrl,
        video_url: row.video_url ?? null,
        materials_list: materialsList,
        option_envelope: optionEnvelope,
        imitates: row.imitates ?? [],
        water_types: row.water_types ?? [],
        origin_credit: row.origin_credit,
        submitted_by_user_id: adminUserId,
        approved_by_user_id: adminUserId,
        approved_at: nowIso,
        status: "approved",
        is_featured: false,
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      console.error(
        `ERROR insert "${row.name}": ${insErr?.message ?? "unknown"}`,
      );
      summary.errored++;
      logLines.push(`ERROR_INSERT\t${slug}\t${insErr?.message ?? "unknown"}`);
      continue;
    }

    const flyId = inserted.id as string;
    console.log(`OK  inserted: "${row.name}" (${slug}) → ${flyId}`);
    summary.inserted++;
    logLines.push(`INSERTED\t${slug}\t${row.name}\t${flyId}`);
    existingSlugs.add(slug);
    existingNames.push({ slug, name: row.name });
  }

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(summary, null, 2));

  const logsDir = path.join(__dirname, "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const logPath = path.join(logsDir, `seed-flies-batch-${ts}.log`);
  fs.writeFileSync(logPath, logLines.join("\n") + "\n");
  console.log(`Log written: ${logPath}`);

  if (summary.errored > 0) process.exit(2);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
