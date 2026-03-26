#!/usr/bin/env npx tsx
/**
 * Fix fly ↔ river cross-linking.
 * ONLY updates related_river_ids and related_destination_ids on canonical_flies.
 *
 * Scoring: for each fly×river pair
 *   - hatch category overlaps × 10  (rivers WITH hatch chart data)
 *   - species overlaps × 5
 *   - rivers with empty hatch charts but matching trout species → flat 5
 *
 * Top 12 rivers by score. No diversity caps, no randomization.
 * related_destination_ids = unique destinations from those 12 rivers.
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load env from .env.vercel.tmp
const envContent = readFileSync(".env.vercel.tmp", "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Hatch normalization ────────────────────────────────────────
// Maps a river hatch entry insect name → canonical categories
function normalizeHatch(hatch: string): string[] {
  const h = hatch.toLowerCase().trim();

  if (h.includes("midge") || h.includes("chironomid")) return ["midges"];
  if (h.includes("blue-winged olive") || h.includes("bwo") || h.includes("baetis")) return ["mayflies", "bwos"];
  if (h.includes("pale morning dun") || h.includes("pmd")) return ["mayflies", "pmds"];
  if (h.includes("trico")) return ["mayflies", "tricos"];
  if (h.includes("callibaetis")) return ["mayflies", "callibaetis"];
  if (h.includes("green drake") || h.includes("grey drake")) return ["mayflies", "drakes"];
  if (h.includes("brown drake")) return ["mayflies", "drakes"];
  if (h.includes("hexagenia") || h.includes("hex (")) return ["mayflies", "drakes"];
  if (h.includes("flavs") || h.includes("drunella")) return ["mayflies", "pmds"]; // Flavs are PMD relatives
  if (h.includes("hendrickson")) return ["mayflies"];
  if (h.includes("sulphur")) return ["mayflies"];
  if (h.includes("march brown")) return ["mayflies"];
  if (h.includes("mahogany dun") || h.includes("mahogany")) return ["mayflies"];
  if (h.includes("isonychia")) return ["mayflies"];
  if (h.includes("light cahill")) return ["mayflies"];
  if (h.includes("quill gordon") || h.includes("blue quill")) return ["mayflies"];
  if (h.includes("mayfly")) return ["mayflies"];
  if (h.includes("olive dun") || h.includes("dark olive")) return ["mayflies"];
  if (h.includes("spinner")) return ["mayflies"];
  if (h.includes("dun")) return ["mayflies"];
  if (h.includes("october caddis")) return ["caddis", "october_caddis"];
  if (h.includes("caddis") || h.includes("sedge")) return ["caddis"];
  if (h.includes("salmonfly")) return ["stoneflies", "salmonflies"];
  if (h.includes("golden stone")) return ["stoneflies", "golden_stones"];
  if (h.includes("little yellow stone")) return ["stoneflies"];
  if (h.includes("stonefly") || h.includes("skwala") || h.includes("yellow sally") || h.includes("little black stone")) return ["stoneflies"];
  if (h.includes("hopper") || h.includes("grasshopper")) return ["terrestrials"];
  if (h.includes("ant")) return ["terrestrials"];
  if (h.includes("beetle")) return ["terrestrials"];
  if (h.includes("terrestrial") || h.includes("daddy longlegs") || h.includes("crane fly")) return ["terrestrials"];
  if (h.includes("egg")) return ["eggs"];
  if (h.includes("scud") || h.includes("sowbug") || h.includes("mysis")) return ["scuds"];
  if (h.includes("streamer") || h.includes("leech") || h.includes("marabou") || h.includes("intruder")) return ["baitfish"];
  if (h.includes("flesh fly") || h.includes("crayfish") || h.includes("hellgrammite")) return ["baitfish"];
  if (h.includes("popper") || h.includes("topwater")) return ["baitfish"];
  if (h.includes("salmon fry") || h.includes("fry")) return ["baitfish"];
  if (h.includes("worm") || h.includes("san juan")) return ["worms"];
  // Steelhead/salmon techniques → treat as baitfish (streamer-like)
  if (h.includes("steelhead") || h.includes("spey") || h.includes("skater")) return ["baitfish"];
  // Smallmouth-specific entries
  if (h.includes("smallmouth")) return ["baitfish"];

  return [];
}

// ─── Fly imitates normalization ─────────────────────────────────
function flyImitatesNormalized(fly: any): Set<string> {
  const result = new Set<string>();
  if (!fly.imitates) return result;

  for (const im of fly.imitates) {
    const lower = im.toLowerCase();

    // Mayflies (broad)
    if (lower.includes("mayfl") || lower.includes("baetis") || lower.includes("dun") ||
        lower.includes("hendrickson") || lower.includes("sulphur") || lower.includes("isonychia") ||
        lower.includes("cahill") || lower.includes("quill") || lower.includes("spinner")) {
      result.add("mayflies");
    }
    // Specific mayfly sub-categories
    if (lower.includes("bwo") || lower.includes("blue-winged olive") || lower.includes("baetis")) result.add("bwos");
    if (lower.includes("pmd") || lower.includes("pale morning dun")) result.add("pmds");
    if (lower.includes("trico")) result.add("tricos");
    if (lower.includes("callibaetis")) result.add("callibaetis");
    if (lower.includes("drake")) result.add("drakes");

    if (lower.includes("caddis") || lower.includes("sedge")) result.add("caddis");
    if (lower.includes("october caddis")) result.add("october_caddis");
    if (lower.includes("midge") || lower.includes("chironomid")) result.add("midges");
    if (lower.includes("stonefl") || lower.includes("skwala") || lower.includes("yellow sally")) result.add("stoneflies");
    if (lower.includes("salmonfl") || lower.includes("salmonfly")) result.add("salmonflies");
    if (lower.includes("golden stone")) result.add("golden_stones");
    if (lower.includes("terrestrial") || lower.includes("hopper") || lower.includes("grasshopper") ||
        lower.includes("ant") || lower.includes("beetle") || lower.includes("cricket") || lower.includes("cicada")) {
      result.add("terrestrials");
    }
    if (lower.includes("baitfish") || lower.includes("sculpin") || lower.includes("minnow") ||
        lower.includes("leech") || lower.includes("crayfish") || lower.includes("shad") || lower.includes("fry")) {
      result.add("baitfish");
    }
    if (lower.includes("egg")) result.add("eggs");
    if (lower.includes("scud") || lower.includes("sowbug") || lower.includes("shrimp") || lower.includes("mysis")) result.add("scuds");
    if (lower.includes("worm") || lower.includes("annelid")) result.add("worms");
    if (lower.includes("attractor") || lower.includes("general")) result.add("attractor");
  }

  // Category-based fallbacks if nothing matched
  if (result.size === 0) {
    const cat = fly.category;
    if (cat === "dry") { result.add("mayflies"); result.add("attractor"); }
    if (cat === "nymph") { result.add("mayflies"); result.add("attractor"); }
    if (cat === "streamer") result.add("baitfish");
    if (cat === "emerger") result.add("mayflies");
    if (cat === "wet") { result.add("mayflies"); result.add("attractor"); }
    if (cat === "terrestrial") result.add("terrestrials");
    if (cat === "egg") result.add("eggs");
    if (cat === "midge") result.add("midges");
  }

  return result;
}

// ─── Species matching ───────────────────────────────────────────
// Normalize species names for matching: steelhead = rainbow trout, etc.
function normalizeSpeciesName(s: string): string[] {
  const lower = s.toLowerCase();
  const results = [lower];
  // Steelhead ARE rainbow trout (same species: Oncorhynchus mykiss)
  if (lower.includes("steelhead")) results.push("rainbow trout");
  if (lower.includes("rainbow trout")) results.push("steelhead");
  // Sea trout = brown trout (anadromous form)
  if (lower.includes("sea trout")) results.push("brown trout");
  // Resident trout → matches any trout
  if (lower === "resident trout") results.push("rainbow trout", "brown trout", "cutthroat trout", "brook trout");
  return results;
}

function speciesOverlapCount(flySpecies: string[], riverSpecies: string[]): number {
  // Expand river species with aliases
  const rExpanded: string[] = [];
  for (const rs of riverSpecies) {
    rExpanded.push(...normalizeSpeciesName(rs));
  }
  const fNorm = flySpecies.map(s => s.toLowerCase());
  let count = 0;
  for (const fs of fNorm) {
    if (rExpanded.some(rs => rs.includes(fs) || fs.includes(rs))) count++;
  }
  return count;
}

async function main() {
  console.log("Fetching flies and rivers...");

  const [{ data: flies, error: fErr }, { data: rivers, error: rErr }] = await Promise.all([
    supabase.from("canonical_flies").select("id, slug, name, category, imitates, effective_species"),
    supabase.from("rivers").select("id, slug, name, destination_id, primary_species, hatch_chart"),
  ]);

  if (!flies || fErr) { console.error("Failed to fetch flies:", fErr); process.exit(1); }
  if (!rivers || rErr) { console.error("Failed to fetch rivers:", rErr); process.exit(1); }

  console.log(`Loaded ${flies.length} flies, ${rivers.length} rivers`);

  // ─── Pre-compute river hatch data ───────────────────────────
  const riverHatchCategories: Map<string, Set<string>> = new Map();
  const riverHasRealHatches: Map<string, boolean> = new Map();
  const riverDestMap: Map<string, string> = new Map();
  // Per-category: how many months does each category appear? (temporal depth)
  const riverCategoryMonths: Map<string, Map<string, number>> = new Map();

  for (const r of rivers) {
    riverDestMap.set(r.id, r.destination_id);
    const cats = new Set<string>();
    let hasReal = false;
    const catMonthCounts = new Map<string, number>();

    if (r.hatch_chart && Array.isArray(r.hatch_chart)) {
      for (const month of r.hatch_chart) {
        if (month.hatches && Array.isArray(month.hatches)) {
          // Track which categories appear THIS month (deduplicate within month)
          const monthCats = new Set<string>();
          for (const h of month.hatches) {
            const normalized = normalizeHatch(h.insect || h.pattern || "");
            for (const n of normalized) {
              cats.add(n);
              monthCats.add(n);
              hasReal = true;
            }
          }
          // Increment month count for each category seen this month
          for (const cat of monthCats) {
            catMonthCounts.set(cat, (catMonthCounts.get(cat) || 0) + 1);
          }
        }
      }
    }

    riverHatchCategories.set(r.id, cats);
    riverHasRealHatches.set(r.id, hasReal);
    riverCategoryMonths.set(r.id, catMonthCounts);
  }

  // ─── Score each fly against each river ──────────────────────
  // Track how many times each river has been assigned across all flies.
  // Within the same score tier, prefer less-assigned rivers to spread coverage.
  const riverUsageCount: Map<string, number> = new Map();
  const updates: { id: string; slug: string; related_river_ids: string[]; related_destination_ids: string[] }[] = [];
  const allLinkedRivers = new Set<string>();

  for (const fly of flies) {
    const flyIm = flyImitatesNormalized(fly);
    const flySpecies = (fly.effective_species || []) as string[];

    const scored: { id: string; score: number; name: string }[] = [];

    for (const r of rivers) {
      const rSpecies = (r.primary_species || []) as string[];
      const specOvlp = speciesOverlapCount(flySpecies, rSpecies);

      // Must have at least SOME species overlap to be relevant
      if (specOvlp === 0) continue;

      const rCats = riverHatchCategories.get(r.id) || new Set();
      const hasReal = riverHasRealHatches.get(r.id) || false;

      if (hasReal) {
        // Count hatch category overlaps
        let hatchOvlp = 0;
        for (const im of flyIm) {
          if (rCats.has(im)) hatchOvlp++;
        }
        if (hatchOvlp === 0) continue; // No hatch match, skip

        // Core score: hatch overlaps × 10 + species overlaps × 5 (capped at 2)
        const score = hatchOvlp * 10 + Math.min(specOvlp, 2) * 5;
        scored.push({ id: r.id, score, name: r.name });
      } else {
        // River has no hatch data — infer common categories for trout rivers
        const rSpecLower = rSpecies.map(s => s.toLowerCase());
        const hasTrout = rSpecLower.some(s =>
          s.includes("trout") || s.includes("char") || s.includes("grayling") || s.includes("steelhead")
        );
        if (hasTrout) {
          const inferredCats = new Set(["mayflies", "caddis", "midges", "stoneflies", "terrestrials", "bwos", "pmds", "baitfish", "worms", "attractor"]);
          let hatchOvlp = 0;
          for (const im of flyIm) {
            if (inferredCats.has(im)) hatchOvlp++;
          }
          if (hatchOvlp === 0) continue;

          // Score at 50% of real-hatch river (×5 instead of ×10)
          const score = hatchOvlp * 5 + Math.min(specOvlp, 2) * 5;
          scored.push({ id: r.id, score, name: r.name });
        }
      }
    }

    // Sort by:
    // 1. Score tier (rounded to nearest 5) descending — groups equally-relevant rivers
    // 2. Usage count ascending — prefer less-used rivers within same tier
    // 3. Name alphabetically — deterministic final tiebreak
    scored.sort((a, b) => {
      const tierA = Math.floor(a.score / 5) * 5;
      const tierB = Math.floor(b.score / 5) * 5;
      if (tierB !== tierA) return tierB - tierA;
      const usageA = riverUsageCount.get(a.id) || 0;
      const usageB = riverUsageCount.get(b.id) || 0;
      if (usageA !== usageB) return usageA - usageB;
      return a.name.localeCompare(b.name);
    });

    const topRivers = scored.slice(0, 12).map(s => s.id);

    // Update usage counts
    for (const rid of topRivers) {
      riverUsageCount.set(rid, (riverUsageCount.get(rid) || 0) + 1);
    }

    // Unique destinations from those rivers
    const destSet = new Set<string>();
    for (const rid of topRivers) {
      const d = riverDestMap.get(rid);
      if (d) destSet.add(d);
    }

    for (const rid of topRivers) allLinkedRivers.add(rid);

    updates.push({
      id: fly.id,
      slug: fly.slug,
      related_river_ids: topRivers,
      related_destination_ids: [...destSet],
    });
  }

  // ─── Apply updates ──────────────────────────────────────────
  console.log(`\nApplying updates to ${updates.length} flies...`);

  let success = 0;
  let errors = 0;

  for (const u of updates) {
    const { error } = await supabase
      .from("canonical_flies")
      .update({
        related_river_ids: u.related_river_ids,
        related_destination_ids: u.related_destination_ids,
      })
      .eq("id", u.id);

    if (error) {
      console.error(`ERROR ${u.slug}:`, error.message);
      errors++;
    } else {
      success++;
    }
  }

  console.log(`\nDone! ${success} updated, ${errors} errors.`);

  // ─── Verification stats ─────────────────────────────────────
  console.log("\n=== VERIFICATION ===");
  console.log(`Unique rivers linked across all flies: ${allLinkedRivers.size}`);
  console.log(`Avg rivers/fly: ${(updates.reduce((s, u) => s + u.related_river_ids.length, 0) / updates.length).toFixed(1)}`);
  console.log(`Flies with 0 rivers: ${updates.filter(u => u.related_river_ids.length === 0).length}`);
  console.log(`Flies with 12 rivers: ${updates.filter(u => u.related_river_ids.length === 12).length}`);

  // Check specific rivers
  const checkRivers = [
    "river-madison",
    "river-henry-s-fork",
    "river-deschutes",
    "river-yellowstone",
    "river-missouri",
    "river-frying-pan",
    "river-gunnison",
    "river-san-juan",
  ];

  console.log("\n--- Key river appearance counts ---");
  for (const rid of checkRivers) {
    const count = updates.filter(u => u.related_river_ids.includes(rid)).length;
    const rName = rivers.find(r => r.id === rid)?.name || rid;
    console.log(`  ${rName} (${rid}): ${count} flies`);
  }

  // Show a few sample flies
  const sampleSlugs = ["parachute-adams", "elk-hair-caddis", "woolly-bugger", "pheasant-tail-nymph", "rs2"];
  console.log("\n--- Sample flies ---");
  for (const slug of sampleSlugs) {
    const u = updates.find(u => u.slug === slug);
    if (u) {
      const riverNames = u.related_river_ids.map(rid => rivers.find(r => r.id === rid)?.name || rid);
      console.log(`  ${slug}: ${u.related_river_ids.length} rivers → ${riverNames.join(", ")}`);
    }
  }
}

main().catch(console.error);
