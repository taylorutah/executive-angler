/**
 * Batch-import canonical fly patterns from a JSON file.
 *
 * Usage:
 *   SEED_ADMIN_USER_ID=<uuid> tsx scripts/seed-flies-batch.ts <input.json> [--force-name]
 *
 * Behavior:
 *   - Idempotent: skips rows whose slug already exists in canonical_flies
 *   - Name-similarity guard: skips rows within Levenshtein distance 2 of an
 *     existing canonical name. Override with --force-name (use sparingly).
 *   - origin_credit is REQUIRED per row (use "Classic pattern, originator
 *     unknown" if truly unknown). Per the canonical-approval policy, every
 *     canonical needs provenance.
 *   - Defaults missing hero_image_url to /images/fly-icons/<category>.svg
 *     (reuses existing per-category icon SVGs)
 *   - Dual-writes to canonical_flies AND fly_patterns_v2 + fly_variants so
 *     the new pattern appears on the modern detail page (`/flies/[slug]`).
 *     The legacy backfill (20260508_phase2_canonical_backfill.sql) is one-shot;
 *     there is no trigger keeping the two tables in sync.
 *   - Writes a per-run log to scripts/logs/seed-flies-batch-<timestamp>.log
 *
 * Input shape (one object per pattern):
 *   {
 *     "name": "Purple Haze",
 *     "category": "dry",                                  // required: dry|nymph|streamer|emerger|wet|terrestrial|egg|midge
 *     "origin_credit": "Andy Carlson",                    // required
 *     "description": "Parachute Adams variant with a purple body.",
 *     "history": "Originated on the Big Hole...",
 *     "tying_overview": "...",
 *     "fishing_tips": "...",
 *     "imitates": ["mayfly", "BWO"],
 *     "hook_style": "dry fly, standard",
 *     "default_size": "16",
 *     "base_materials": [
 *       { "slot": "hook", "material": "TMC 100, size 16" },
 *       { "slot": "body", "material": "Purple superfine dubbing" }
 *     ],
 *     "hero_image_url": "https://..."                     // optional; falls back to category placeholder
 *   }
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const FLY_CATEGORIES = [
  "dry",
  "nymph",
  "streamer",
  "emerger",
  "wet",
  "terrestrial",
  "egg",
  "midge",
] as const;
type FlyCategory = (typeof FLY_CATEGORIES)[number];

interface BatchPattern {
  name: string;
  category: FlyCategory;
  origin_credit: string;
  description?: string;
  history?: string;
  tying_overview?: string;
  fishing_tips?: string;
  imitates?: string[];
  hook_style?: string;
  default_size?: string;
  base_materials?: Array<{
    slot: string;
    material: string;
    description?: string;
    brand?: string;
    is_optional?: boolean;
  }>;
  tying_steps?: unknown;
  hero_image_url?: string;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
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

const DEFAULT_SIZE: Record<FlyCategory, string> = {
  dry: "14",
  nymph: "16",
  streamer: "6",
  emerger: "18",
  wet: "14",
  terrestrial: "12",
  egg: "10",
  midge: "20",
};

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

  const { data: existing, error: existingErr } = await sb
    .from("canonical_flies")
    .select("id, slug, name");
  if (existingErr) {
    console.error("Couldn't fetch existing canonicals:", existingErr.message);
    process.exit(1);
  }
  const existingSlugs = new Set<string>(
    (existing ?? []).map((r) => r.slug as string),
  );
  const existingNames: Array<{ slug: string; name: string }> = (
    existing ?? []
  ).map((r) => ({ slug: r.slug as string, name: r.name as string }));
  console.log(`Found ${existingSlugs.size} existing canonicals.`);

  const summary = { inserted: 0, skipped_slug: 0, skipped_similar: 0, errored: 0 };
  const logLines: string[] = [];

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
    const defaultSize = row.default_size ?? DEFAULT_SIZE[row.category];
    const description = row.description ?? `${row.name} fly pattern.`;

    // 1. canonical_flies (legacy table — still queried in some paths)
    const { data: cf, error: cfErr } = await sb
      .from("canonical_flies")
      .insert({
        slug,
        name: row.name,
        category: row.category,
        description,
        history: row.history ?? null,
        tying_overview: row.tying_overview ?? null,
        fishing_tips: row.fishing_tips ?? null,
        hero_image_url: heroImageUrl,
        sizes: [defaultSize],
        imitates: row.imitates ?? [],
        origin_credit: row.origin_credit,
        contributed_by_user_id: adminUserId,
        featured: false,
        materials_list: row.base_materials ?? null,
        tying_steps: row.tying_steps ?? null,
      })
      .select("id")
      .single();

    if (cfErr || !cf) {
      console.error(
        `ERROR insert canonical_flies "${row.name}": ${cfErr?.message ?? "unknown"}`,
      );
      summary.errored++;
      logLines.push(`ERROR_CF\t${slug}\t${cfErr?.message ?? "unknown"}`);
      continue;
    }

    const patternId = cf.id as string;

    // 2. fly_patterns_v2 (modern unified table — what /flies/[slug] reads)
    const { error: pvErr } = await sb.from("fly_patterns_v2").insert({
      id: patternId,
      slug,
      name: row.name,
      category: row.category,
      description,
      history: row.history ?? null,
      tying_overview: row.tying_overview ?? null,
      fishing_tips: row.fishing_tips ?? null,
      imitates: row.imitates ?? [],
      water_types: [],
      base_materials: row.base_materials ?? [],
      tying_steps: row.tying_steps ?? [],
      hero_image_url: heroImageUrl,
      gallery_image_urls: [],
      visibility: "private",
      contributed_by_user_id: adminUserId,
      origin_credit: row.origin_credit,
      is_featured: false,
      owner_user_id: null,
    });

    if (pvErr) {
      console.error(
        `ERROR insert fly_patterns_v2 "${row.name}": ${pvErr.message}. canonical_flies row was created (id=${patternId}) — manual cleanup may be needed.`,
      );
      summary.errored++;
      logLines.push(`ERROR_PV2\t${slug}\t${pvErr.message}\tcf_id=${patternId}`);
      continue;
    }

    // 3. fly_variants — one default canonical variant
    const { error: fvErr } = await sb.from("fly_variants").insert({
      pattern_id: patternId,
      created_by_user_id: null,
      slug: "default",
      display_name: `${row.name} #${defaultSize}`,
      size: defaultSize,
      hook_style: row.hook_style ?? null,
      sort_order: 0,
      is_default_for_pattern: true,
    });

    if (fvErr) {
      console.error(
        `ERROR insert default variant "${row.name}": ${fvErr.message}. Pattern rows exist (${patternId}) — manual fix needed.`,
      );
      summary.errored++;
      logLines.push(`ERROR_FV\t${slug}\t${fvErr.message}\tcf_id=${patternId}`);
      continue;
    }

    console.log(`OK  inserted: "${row.name}" (${slug}) → ${patternId}`);
    summary.inserted++;
    logLines.push(`INSERTED\t${slug}\t${row.name}\t${patternId}`);
    existingSlugs.add(slug);
    existingNames.push({ slug, name: row.name });
  }

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(summary, null, 2));

  const logsDir = path.join(path.dirname(path.resolve(inputPath)), "..", "logs");
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
