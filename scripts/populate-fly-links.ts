#!/usr/bin/env npx tsx
/**
 * Populate cross-linking data on canonical_flies:
 * - related_river_ids (based on imitates ↔ hatch chart matching)
 * - related_destination_ids (derived from rivers)
 * - fly_shop_ids (based on destination overlap)
 * - related_fly_ids (same category + overlapping imitates)
 * - key_variations slug_fragment (slugified name)
 * - affiliate_links (single URL for all)
 * - hatch_associations (fly → river+month connections)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Hatch name normalization ---
// River hatch entries use inconsistent naming. This maps them to canonical imitates values.
function normalizeHatch(hatch: string): string[] {
  const h = hatch.toLowerCase().trim();

  // Direct matches
  if (h.includes("midge")) return ["midges"];
  if (h.includes("blue-winged olive") || h.includes("bwo") || h.includes("baetis")) return ["mayflies", "bwos"];
  if (h.includes("pale morning dun") || h.includes("pmd")) return ["mayflies", "pmds"];
  if (h.includes("caddis") && !h.includes("october")) return ["caddis"];
  if (h.includes("october caddis")) return ["caddis"];
  if (h.includes("salmonfly")) return ["stoneflies"];
  if (h.includes("golden stone")) return ["stoneflies"];
  if (h.includes("stonefly") || h.includes("skwala") || h.includes("yellow sally") || h.includes("little black stone")) return ["stoneflies"];
  if (h.includes("green drake")) return ["mayflies"];
  if (h.includes("hendrickson")) return ["mayflies"];
  if (h.includes("sulphur")) return ["mayflies"];
  if (h.includes("march brown")) return ["mayflies"];
  if (h.includes("trico")) return ["mayflies"];
  if (h.includes("callibaetis")) return ["mayflies"];
  if (h.includes("mahogany dun")) return ["mayflies"];
  if (h.includes("isonychia")) return ["mayflies"];
  if (h.includes("light cahill")) return ["mayflies"];
  if (h.includes("quill gordon") || h.includes("blue quill")) return ["mayflies"];
  if (h.includes("hexagenia") || h.includes("hex")) return ["mayflies"];
  if (h.includes("brown drake")) return ["mayflies"];
  if (h.includes("mayfly")) return ["mayflies"];
  if (h.includes("olive dun") || h.includes("dark olive")) return ["mayflies"];
  if (h.includes("spinner")) return ["mayflies"];
  if (h.includes("dun")) return ["mayflies"];
  if (h.includes("hopper") || h.includes("grasshopper")) return ["terrestrials"];
  if (h.includes("ant")) return ["terrestrials"];
  if (h.includes("beetle")) return ["terrestrials"];
  if (h.includes("terrestrial")) return ["terrestrials"];
  if (h.includes("daddy longlegs") || h.includes("crane fly")) return ["terrestrials"];
  if (h.includes("egg")) return ["eggs"];
  if (h.includes("scud") || h.includes("sowbug")) return ["scuds"];
  if (h.includes("streamer") || h.includes("leech") || h.includes("intruder") || h.includes("marabou")) return ["baitfish"];
  if (h.includes("flesh fly")) return ["baitfish"];
  if (h.includes("crayfish") || h.includes("hellgrammite")) return ["baitfish"];
  if (h.includes("popper") || h.includes("topwater")) return ["baitfish"];
  if (h.includes("worm") || h.includes("san juan")) return ["worms"];
  if (h.includes("sedge")) return ["caddis"];
  if (h.includes("mysis")) return ["scuds"];

  return [];
}

// Slugify a string
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("Fetching all data...");

  const [{ data: flies }, { data: rivers }, { data: shops }] = await Promise.all([
    supabase.from("canonical_flies").select("id, slug, name, category, imitates, effective_species, water_types, key_variations, related_river_ids, related_destination_ids"),
    supabase.from("rivers").select("id, slug, name, destination_id, primary_species, hatch_chart"),
    supabase.from("fly_shops").select("id, slug, name, destination_id"),
  ]);

  if (!flies || !rivers || !shops) {
    console.error("Failed to fetch data");
    process.exit(1);
  }

  console.log(`Loaded ${flies.length} flies, ${rivers.length} rivers, ${shops.length} shops`);

  // Build river hatch index: river → normalized hatch categories
  const riverHatches: Map<string, Set<string>> = new Map();
  // Track real vs inferred hatch data separately
  const riverRealHatches: Map<string, Set<string>> = new Map();
  const riverInferredHatches: Map<string, Set<string>> = new Map();

  for (const r of rivers) {
    const realSet = new Set<string>();
    const inferredSet = new Set<string>();

    if (r.hatch_chart && Array.isArray(r.hatch_chart)) {
      for (const month of r.hatch_chart) {
        if (month.hatches && Array.isArray(month.hatches)) {
          for (const h of month.hatches) {
            const normalized = normalizeHatch(h.insect || h.pattern || "");
            for (const n of normalized) realSet.add(n);
          }
        }
      }
    }

    // Trout rivers with empty hatch charts get inferred (low-priority) categories
    const species = (r.primary_species || []).map((s: string) => s.toLowerCase());
    const hasTrout = species.some((s: string) => s.includes("trout") || s.includes("char") || s.includes("grayling"));
    if (hasTrout) {
      inferredSet.add("attractor");
      if (realSet.size === 0) {
        inferredSet.add("mayflies");
        inferredSet.add("caddis");
        inferredSet.add("midges");
        inferredSet.add("terrestrials");
        inferredSet.add("stoneflies");
      }
    }

    riverRealHatches.set(r.id, realSet);
    riverInferredHatches.set(r.id, inferredSet);
    // Combined for backward compat
    const combined = new Set([...realSet, ...inferredSet]);
    riverHatches.set(r.id, combined);
  }

  // Build shop-by-destination index
  const shopsByDest: Map<string, string[]> = new Map();
  for (const s of shops) {
    const existing = shopsByDest.get(s.destination_id) || [];
    existing.push(s.id);
    shopsByDest.set(s.destination_id, existing);
  }

  // River-by-destination index
  const riversByDest: Map<string, string[]> = new Map();
  for (const r of rivers) {
    const existing = riversByDest.get(r.destination_id) || [];
    existing.push(r.id);
    riversByDest.set(r.destination_id, existing);
  }

  // River destination lookup
  const riverDest: Map<string, string> = new Map();
  for (const r of rivers) {
    riverDest.set(r.id, r.destination_id);
  }

  // Normalize fly imitates for matching
  function flyImitatesNormalized(fly: any): Set<string> {
    const result = new Set<string>();
    if (!fly.imitates) return result;
    for (const im of fly.imitates) {
      const lower = im.toLowerCase();
      if (lower.includes("mayfl") || lower.includes("bwo") || lower.includes("pmd") || lower.includes("baetis") || lower.includes("dun") || lower.includes("hendrickson") || lower.includes("sulphur") || lower.includes("drake") || lower.includes("trico") || lower.includes("callibaetis") || lower.includes("isonychia") || lower.includes("cahill") || lower.includes("quill")) result.add("mayflies");
      if (lower.includes("caddis") || lower.includes("sedge")) result.add("caddis");
      if (lower.includes("midge") || lower.includes("chironomid")) result.add("midges");
      if (lower.includes("stonefl") || lower.includes("salmonfl") || lower.includes("golden stone") || lower.includes("skwala") || lower.includes("yellow sally")) result.add("stoneflies");
      if (lower.includes("terrestrial") || lower.includes("hopper") || lower.includes("grasshopper") || lower.includes("ant") || lower.includes("beetle") || lower.includes("cricket") || lower.includes("cicada")) result.add("terrestrials");
      if (lower.includes("baitfish") || lower.includes("sculpin") || lower.includes("minnow") || lower.includes("leech") || lower.includes("crayfish") || lower.includes("shad") || lower.includes("fry")) result.add("baitfish");
      if (lower.includes("egg")) result.add("eggs");
      if (lower.includes("scud") || lower.includes("sowbug") || lower.includes("shrimp")) result.add("scuds");
      if (lower.includes("worm") || lower.includes("annelid")) result.add("worms");
      if (lower.includes("attractor") || lower.includes("general")) result.add("attractor");
    }
    // Category-based fallbacks
    if (result.size === 0) {
      const cat = fly.category;
      if (cat === "dry") result.add("mayflies"), result.add("attractor");
      if (cat === "nymph") result.add("mayflies"), result.add("attractor");
      if (cat === "streamer") result.add("baitfish");
      if (cat === "emerger") result.add("mayflies");
      if (cat === "wet") result.add("mayflies"), result.add("attractor");
      if (cat === "terrestrial") result.add("terrestrials");
      if (cat === "egg") result.add("eggs");
      if (cat === "midge") result.add("midges");
    }
    return result;
  }

  // --- Compute links for each fly ---
  const updates: any[] = [];
  const flyById: Map<string, any> = new Map();
  for (const f of flies) flyById.set(f.id, f);

  for (const fly of flies) {
    const flyIm = flyImitatesNormalized(fly);

    // 1. Related rivers: match imitates against river hatch categories
    const matchedRivers: string[] = [];
    for (const r of rivers) {
      const rHatches = riverHatches.get(r.id) || new Set();
      // Check overlap
      let overlap = 0;
      for (const im of flyIm) {
        if (rHatches.has(im)) overlap++;
      }
      // Also check species overlap
      const rSpecies = (r.primary_species || []).map((s: string) => s.toLowerCase());
      const fSpecies = (fly.effective_species || []).map((s: string) => s.toLowerCase());
      let speciesOverlap = false;
      for (const fs of fSpecies) {
        if (rSpecies.some((rs: string) => rs.includes(fs) || fs.includes(rs))) {
          speciesOverlap = true;
          break;
        }
      }

      if (overlap > 0 && speciesOverlap) {
        matchedRivers.push(r.id);
      }
    }

    // Score rivers with multi-factor scoring
    const scoredRivers = matchedRivers.map((rid) => {
      const realH = riverRealHatches.get(rid) || new Set();
      const inferredH = riverInferredHatches.get(rid) || new Set();
      let score = 0;

      // Hatch category matches: real = 10 pts, inferred = 1 pt
      for (const im of flyIm) {
        if (realH.has(im)) score += 10;
        else if (inferredH.has(im)) score += 1;
      }

      // Bonus for hatch chart richness (more entries = more relevant river)
      score += Math.min(realH.size, 5) * 2;

      // Bonus for species overlap depth
      const rSpecies = (rivers.find(r => r.id === rid)?.primary_species || []).map((s: string) => s.toLowerCase());
      const fSpecies = (fly.effective_species || []).map((s: string) => s.toLowerCase());
      let speciesMatches = 0;
      for (const fs of fSpecies) {
        if (rSpecies.some((rs: string) => rs.includes(fs) || fs.includes(rs))) speciesMatches++;
      }
      score += speciesMatches * 3;

      // Small random factor to break ties (0-2 pts) — ensures geographic spread
      score += Math.random() * 2;

      return { id: rid, score };
    });
    scoredRivers.sort((a, b) => b.score - a.score);

    // Round-robin by destination: pick best river from each dest, then 2nd best, etc.
    // This guarantees maximum geographic diversity.
    const byDest: Map<string, { id: string; score: number }[]> = new Map();
    for (const sr of scoredRivers) {
      const d = riverDest.get(sr.id) || "unknown";
      const arr = byDest.get(d) || [];
      arr.push(sr);
      byDest.set(d, arr);
    }
    // Sort each dest's rivers by score descending
    for (const arr of byDest.values()) arr.sort((a, b) => b.score - a.score);

    // Round-robin: take 1st from each dest, then 2nd, etc.
    const topRivers: string[] = [];
    const usedFromDest: Map<string, number> = new Map();
    let round = 0;
    while (topRivers.length < 12 && round < 5) {
      let addedThisRound = false;
      // Sort destinations by their best remaining river score (descending)
      const destOrder = [...byDest.entries()]
        .filter(([, arr]) => arr.length > round)
        .sort((a, b) => b[1][round].score - a[1][round].score);
      for (const [, arr] of destOrder) {
        if (topRivers.length >= 12) break;
        if (arr.length > round) {
          topRivers.push(arr[round].id);
          addedThisRound = true;
        }
      }
      if (!addedThisRound) break;
      round++;
    }

    // 2. Related destinations: unique destinations from matched rivers
    const destSet = new Set<string>();
    for (const rid of topRivers) {
      const d = riverDest.get(rid);
      if (d) destSet.add(d);
    }
    const topDests = [...destSet].slice(0, 6);

    // 3. Fly shops: shops in matched destinations, cap at 4
    const matchedShops: string[] = [];
    for (const d of topDests) {
      const dShops = shopsByDest.get(d) || [];
      for (const sid of dShops) {
        if (!matchedShops.includes(sid)) matchedShops.push(sid);
      }
    }
    const topShops = matchedShops.slice(0, 6);

    // 4. Related flies: same category OR overlapping imitates, exclude self
    const relatedScores: { id: string; score: number }[] = [];
    for (const other of flies) {
      if (other.id === fly.id) continue;
      let score = 0;
      if (other.category === fly.category) score += 2;
      const otherIm = flyImitatesNormalized(other);
      for (const im of flyIm) {
        if (otherIm.has(im)) score += 1;
      }
      if (score > 0) relatedScores.push({ id: other.id, score });
    }
    relatedScores.sort((a, b) => b.score - a.score);
    // Take top 6, but prefer variety — take max 3 from same category
    const relatedIds: string[] = [];
    const catCounts: Record<string, number> = {};
    for (const rs of relatedScores) {
      if (relatedIds.length >= 6) break;
      const otherCat = flyById.get(rs.id)?.category || "";
      const count = catCounts[otherCat] || 0;
      if (count >= 3) continue;
      relatedIds.push(rs.id);
      catCounts[otherCat] = count + 1;
    }

    // 5. Key variations: add slug_fragment to existing variations
    let updatedVariations = fly.key_variations;
    if (updatedVariations && Array.isArray(updatedVariations)) {
      updatedVariations = updatedVariations.map((v: any) => ({
        ...v,
        slugFragment: v.slugFragment || slugify(v.name),
      }));
    }

    // 6. Affiliate links
    const affiliateLinks = [
      {
        label: "Buy at Fly Fish Food",
        url: "https://www.flyfishfood.com/collections/flies",
      },
    ];

    // 7. Hatch associations: which months this fly works on which rivers
    const hatchAssociations: { riverId: string; riverName: string; months: string[]; insects: string[] }[] = [];
    for (const rid of topRivers.slice(0, 4)) {
      const river = rivers.find((r) => r.id === rid);
      if (!river || !river.hatch_chart) continue;
      const months: Set<string> = new Set();
      const insects: Set<string> = new Set();
      for (const monthEntry of river.hatch_chart) {
        if (!monthEntry.hatches) continue;
        for (const h of monthEntry.hatches) {
          const normalized = normalizeHatch(h.insect || h.pattern || "");
          const hasOverlap = normalized.some((n: string) => flyIm.has(n));
          if (hasOverlap) {
            months.add(monthEntry.month);
            insects.add(h.insect || h.pattern || "");
          }
        }
      }
      if (months.size > 0) {
        hatchAssociations.push({
          riverId: rid,
          riverName: river.name,
          months: [...months],
          insects: [...insects].slice(0, 5),
        });
      }
    }

    updates.push({
      id: fly.id,
      slug: fly.slug,
      related_river_ids: topRivers,
      related_destination_ids: topDests,
      fly_shop_ids: topShops,
      related_fly_ids: relatedIds,
      key_variations: updatedVariations,
      affiliate_links: affiliateLinks,
      hatch_associations: hatchAssociations.length > 0 ? hatchAssociations : null,
    });
  }

  // --- Apply updates in batches ---
  console.log(`\nApplying updates to ${updates.length} flies...`);

  let success = 0;
  let errors = 0;

  for (const u of updates) {
    const { error } = await supabase
      .from("canonical_flies")
      .update({
        related_river_ids: u.related_river_ids,
        related_destination_ids: u.related_destination_ids,
        fly_shop_ids: u.fly_shop_ids,
        related_fly_ids: u.related_fly_ids,
        key_variations: u.key_variations,
        affiliate_links: u.affiliate_links,
        hatch_associations: u.hatch_associations,
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

  // --- Summary stats ---
  const stats = {
    avgRivers: (updates.reduce((s, u) => s + u.related_river_ids.length, 0) / updates.length).toFixed(1),
    avgDests: (updates.reduce((s, u) => s + u.related_destination_ids.length, 0) / updates.length).toFixed(1),
    avgShops: (updates.reduce((s, u) => s + u.fly_shop_ids.length, 0) / updates.length).toFixed(1),
    avgRelated: (updates.reduce((s, u) => s + u.related_fly_ids.length, 0) / updates.length).toFixed(1),
    withHatchAssoc: updates.filter((u) => u.hatch_associations).length,
    withVariations: updates.filter((u) => u.key_variations?.length > 0).length,
  };

  console.log("\n--- STATS ---");
  console.log(`Avg rivers/fly: ${stats.avgRivers}`);
  console.log(`Avg destinations/fly: ${stats.avgDests}`);
  console.log(`Avg shops/fly: ${stats.avgShops}`);
  console.log(`Avg related flies/fly: ${stats.avgRelated}`);
  console.log(`With hatch associations: ${stats.withHatchAssoc}`);
  console.log(`With variations (slug_fragment added): ${stats.withVariations}`);

  // Show a sample
  const sample = updates.find((u) => u.slug === "parachute-adams") || updates[0];
  console.log("\n--- SAMPLE:", sample.slug, "---");
  console.log("Rivers:", sample.related_river_ids.length, sample.related_river_ids.slice(0, 3));
  console.log("Destinations:", sample.related_destination_ids);
  console.log("Shops:", sample.fly_shop_ids);
  console.log("Related:", sample.related_fly_ids.slice(0, 3));
  console.log("Hatch assoc:", sample.hatch_associations?.length || 0);
}

main().catch(console.error);
