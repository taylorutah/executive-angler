/**
 * Materials Seed Expansion (2026-05) — Tactical Fly Fisher catalog gap fill.
 *
 * Adds the SKUs from https://tacticalflyfisher.com/collections/hooks (and
 * the bead + thread catalogs) that the original seed missed. Idempotent —
 * uses upsert on slug so it can re-run safely.
 *
 * Run: npx tsx scripts/seed-materials-2026-05-tactical.ts
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MaterialSeed {
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  sizes?: string[];
  colors?: string[];
  material_type?: string;
  weight?: string;
  finish?: string;
  description?: string;
}

function slugify(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── HOOKS — TFF Catalog Gap Fill ──────────────────────────────────────────
const hookGapFill: MaterialSeed[] = [
  // Hanak — fill missing models from TFF
  { name: "H100BL", brand: "Hanak", category: "hook", subcategory: "dry", sizes: ["14","16","18","20","22"], finish: "barbless", description: "Klinkhamer / parachute dry, wide gape" },
  { name: "H230BL", brand: "Hanak", category: "hook", subcategory: "wet", sizes: ["8","10","12","14","16","18"], finish: "barbless", description: "Wet fly / nymph, traditional bend" },
  { name: "H300BL", brand: "Hanak", category: "hook", subcategory: "nymph", sizes: ["12","14","16","18","20","22"], finish: "barbless", description: "Czech-style nymph, fine wire, curved shank" },
  { name: "H500BL", brand: "Hanak", category: "hook", subcategory: "jig", sizes: ["8","10","12","14","16","18","20"], finish: "barbless", description: "Jig nymph, premium tournament hook" },
  { name: "H700BL", brand: "Hanak", category: "hook", subcategory: "streamer", sizes: ["2","4","6","8","10"], finish: "barbless", description: "Streamer hook, heavy wire" },

  // Fulling Mill — missing competition SKUs
  { name: "5125 All Purpose Jig", brand: "Fulling Mill", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18","20"], finish: "barbless", description: "Short-shank jig, wide gape, all-purpose euro" },
  { name: "5145 Ultimate Dry Fly", brand: "Fulling Mill", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20","22","24"], finish: "barbless", description: "Premium dry fly, ultra-fine wire" },
  { name: "5070 Czech Nymph", brand: "Fulling Mill", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Heavy curved nymph hook" },
  { name: "5085 Tactical Wet Fly", brand: "Fulling Mill", category: "hook", subcategory: "wet", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Wet fly / soft hackle, tactical bend" },
  { name: "5095 Czech Nymph Heavyweight", brand: "Fulling Mill", category: "hook", subcategory: "nymph", sizes: ["8","10","12","14","16"], finish: "barbless", description: "Heavyweight Czech nymph for fast water" },

  // Umpqua — euro-nymph and tactical
  { name: "XC 210BL-BN", brand: "Umpqua", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18","20"], finish: "barbless", description: "Perdi-Jig — black nickel, narrow gape jig" },
  { name: "XS 412", brand: "Umpqua", category: "hook", subcategory: "scud", sizes: ["12","14","16","18","20"], finish: "standard", description: "Scud / pupa hook, wide gape" },
  { name: "U203", brand: "Umpqua", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20","22"], finish: "barbless", description: "Premium barbless dry fly, light wire" },

  // Dohiku — Czech competition hooks
  { name: "HDD 301", brand: "Dohiku", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Dry fly, barbless, Czech competition" },
  { name: "HDG 644", brand: "Dohiku", category: "hook", subcategory: "scud", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Scud / pupa hook, wide gape" },
  { name: "HDJ", brand: "Dohiku", category: "hook", subcategory: "jig", sizes: ["8","10","12","14","16","18"], finish: "barbless", description: "Jig hook, classic Czech profile" },
  { name: "HDN 302", brand: "Dohiku", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Standard nymph / wet fly" },
  { name: "HDN 302 SP", brand: "Dohiku", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Short-point jig nymph variant" },
  { name: "HDC 303", brand: "Dohiku", category: "hook", subcategory: "nymph", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Short-shank nymph, wide gape" },

  // Fasna — Eastern European competition hooks
  { name: "F-100", brand: "Fasna", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Dry fly, ultra-light wire" },
  { name: "F-200", brand: "Fasna", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Standard nymph hook" },
  { name: "F-300", brand: "Fasna", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Jig hook, narrow gape" },
  { name: "F-415", brand: "Fasna", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Wide-gape jig, competition spec" },
  { name: "F-630", brand: "Fasna", category: "hook", subcategory: "scud", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Scud / shrimp curved hook" },

  // Orientsun — value tactical hooks
  { name: "5230", brand: "Orientsun", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18","20"], finish: "barbless", description: "Jig nymph, value tactical" },
  { name: "5240", brand: "Orientsun", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18","20"], finish: "barbless", description: "Wider gape jig nymph" },
  { name: "5250", brand: "Orientsun", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Standard nymph, value option" },

  // Firehole Outdoors / Firehole Sticks
  { name: "Firehole 315", brand: "Firehole Outdoors", category: "hook", subcategory: "nymph", sizes: ["8","10","12","14","16","18","20"], finish: "barbless", description: "Standard nymph, black nickel finish" },
  { name: "Firehole 316", brand: "Firehole Outdoors", category: "hook", subcategory: "dry", sizes: ["10","12","14","16","18","20","22"], finish: "barbless", description: "Premium dry fly hook" },
  { name: "Firehole 411", brand: "Firehole Outdoors", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Jig hook, wide gape" },
  { name: "Firehole 539", brand: "Firehole Outdoors", category: "hook", subcategory: "scud", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Curved scud / pupa hook" },
  { name: "Firehole 718", brand: "Firehole Outdoors", category: "hook", subcategory: "streamer", sizes: ["2","4","6","8","10"], finish: "barbless", description: "Articulated streamer rear hook" },
  { name: "Firehole 811", brand: "Firehole Outdoors", category: "hook", subcategory: "streamer", sizes: ["2","4","6","8"], finish: "barbless", description: "Streamer / saltwater hook" },

  // Ahrex — Scandinavian quality
  { name: "FW500 Tactical Dry", brand: "Ahrex", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Tactical dry, fine wire" },
  { name: "FW501 Tactical Wet", brand: "Ahrex", category: "hook", subcategory: "wet", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Soft hackle / wet fly hook" },
  { name: "FW504 Tactical Nymph", brand: "Ahrex", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Heavy nymph hook" },
  { name: "FW540 Curved Nymph", brand: "Ahrex", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Curved nymph for buggers and czechs" },

  // Partridge — UK heritage
  { name: "Patriot Barbless", brand: "Partridge", category: "hook", subcategory: "wet", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Universal wet fly, barbless" },
  { name: "Klinkhamer Extreme", brand: "Partridge", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Klinkhamer style with extra-wide gape" },
  { name: "SUD Sproat", brand: "Partridge", category: "hook", subcategory: "wet", sizes: ["8","10","12","14","16"], finish: "standard", description: "Sproat-bend wet/nymph" },

  // Guru
  { name: "Wide Gape Specialist", brand: "Guru", category: "hook", subcategory: "scud", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Wide gape specialist hook" },

  // Riberfly — Spanish competition
  { name: "RB400 Jig", brand: "Riberfly", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Premium Spanish jig hook" },
  { name: "RB200 Nymph", brand: "Riberfly", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Standard competition nymph" },

  // Troutline
  { name: "TLJ Jig", brand: "Troutline", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Tactical jig nymph" },
  { name: "TLN Nymph", brand: "Troutline", category: "hook", subcategory: "nymph", sizes: ["10","12","14","16","18"], finish: "barbless", description: "Standard nymph" },

  // Baetis Fly Fishing
  { name: "BFF Klink", brand: "Baetis Fly Fishing", category: "hook", subcategory: "dry", sizes: ["12","14","16","18","20"], finish: "barbless", description: "Klinkhamer-style dry" },
  { name: "BFF Jig 60", brand: "Baetis Fly Fishing", category: "hook", subcategory: "jig", sizes: ["10","12","14","16","18"], finish: "barbless", description: "60-degree jig hook" },
];

// ─── BEADS — Slotted tungsten in every size × finish (TFF coverage) ────────
const beadGapFill: MaterialSeed[] = [
  // Hareline Slotted Tungsten — full size grid × top colors
  ...[
    { size: "1.5mm", weight: "1.5mm" },
    { size: "2.0mm", weight: "2.0mm" },
    { size: "2.3mm", weight: "2.3mm" },
    { size: "2.5mm", weight: "2.5mm" },
    { size: "2.8mm", weight: "2.8mm" },
    { size: "3.0mm", weight: "3.0mm" },
    { size: "3.3mm", weight: "3.3mm" },
    { size: "3.5mm", weight: "3.5mm" },
    { size: "3.8mm", weight: "3.8mm" },
    { size: "4.0mm", weight: "4.0mm" },
    { size: "4.6mm", weight: "4.6mm" },
  ].flatMap((sz): MaterialSeed[] =>
    [
      "Gold",
      "Copper",
      "Silver",
      "Black Nickel",
      "Matte Black",
      "Hot Orange",
      "Hot Pink",
      "Fluorescent Chartreuse",
      "Fluorescent Red",
      "Olive Metallic",
    ].map((color) => ({
      name: `Slotted Tungsten ${sz.size} ${color}`,
      brand: "Hareline",
      category: "bead",
      subcategory: "slotted",
      sizes: [sz.size],
      colors: [color],
      material_type: "tungsten",
      weight: sz.weight,
      finish: "slotted",
      description: `${sz.size} slotted tungsten bead in ${color}, fits jig hooks`,
    })),
  ),

  // Plummeting Tungsten — value tier
  ...["2.0mm", "2.5mm", "3.0mm", "3.5mm", "4.0mm"].flatMap((sz): MaterialSeed[] =>
    ["Gold", "Copper", "Black Nickel", "Hot Orange"].map((color) => ({
      name: `Plummeting Tungsten ${sz} ${color}`,
      brand: "Plummeting",
      category: "bead",
      subcategory: "slotted",
      sizes: [sz],
      colors: [color],
      material_type: "tungsten",
      weight: sz,
      finish: "slotted",
      description: `${sz} slotted tungsten, value tier`,
    })),
  ),

  // FireHole Stones — FireHole's anodized tungsten line (popular)
  ...["2.0mm", "2.5mm", "3.0mm", "3.5mm"].flatMap((sz): MaterialSeed[] =>
    [
      "Black Nickel",
      "Copper",
      "Gold",
      "Mercury Silver",
      "Anodized Olive",
      "Anodized Blood Red",
      "Anodized Pink",
    ].map((color) => ({
      name: `Stone ${sz} ${color}`,
      brand: "FireHole",
      category: "bead",
      subcategory: "slotted",
      sizes: [sz],
      colors: [color],
      material_type: "tungsten",
      weight: sz,
      finish: "slotted",
      description: `Anodized slotted tungsten ${sz} in ${color}`,
    })),
  ),
];

// ─── THREADS — UTC, Veevus, Semperfli (TFF coverage) ───────────────────────
const threadGapFill: MaterialSeed[] = [
  // UTC Ultra Thread
  ...["70", "140"].flatMap((denier): MaterialSeed[] =>
    [
      "Black",
      "White",
      "Olive",
      "Brown",
      "Camel",
      "Tan",
      "Rusty Brown",
      "Red",
      "Hot Orange",
      "Fluorescent Pink",
      "Fluorescent Chartreuse",
      "Wood Duck",
      "Yellow",
      "Wine",
      "Gray",
      "Cream",
    ].map((color) => ({
      name: `Ultra Thread ${denier} ${color}`,
      brand: "UTC",
      category: "thread",
      subcategory: "tying",
      sizes: [`${denier} denier`],
      colors: [color],
      material_type: "polyester",
      weight: `${denier} denier`,
      description: `${denier} denier UTC tying thread in ${color}`,
    })),
  ),

  // Veevus 8/0 — full color range
  ...["6/0", "8/0", "10/0", "12/0", "14/0", "16/0"].flatMap((weight): MaterialSeed[] =>
    [
      "Black",
      "White",
      "Olive",
      "Brown",
      "Tan",
      "Red",
      "Hot Orange",
      "Yellow",
      "Wine",
      "Gray",
      "Pale Olive",
      "Iron Gray",
      "Cream",
      "Light Cahill",
    ].map((color) => ({
      name: `${weight} ${color}`,
      brand: "Veevus",
      category: "thread",
      subcategory: "tying",
      sizes: [weight],
      colors: [color],
      weight,
      description: `Veevus ${weight} tying thread in ${color}`,
    })),
  ),

  // Semperfli Nano Silk — competition-grade
  ...["18/0", "12/0", "8/0"].flatMap((weight): MaterialSeed[] =>
    ["Black", "White", "Olive", "Brown", "Red", "Hot Orange", "Tan"].map((color) => ({
      name: `Nano Silk ${weight} ${color}`,
      brand: "Semperfli",
      category: "thread",
      subcategory: "tying",
      sizes: [weight],
      colors: [color],
      material_type: "GSP",
      weight,
      description: `Semperfli Nano Silk ${weight} GSP-blend competition thread`,
    })),
  ),
];

const all: MaterialSeed[] = [...hookGapFill, ...beadGapFill, ...threadGapFill];

async function run() {
  console.log(`Seeding ${all.length} additional materials (TFF gap fill)...`);
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  // Chunk to avoid hitting the request size limit
  const CHUNK = 100;
  for (let i = 0; i < all.length; i += CHUNK) {
    const batch = all.slice(i, i + CHUNK).map((m) => ({
      ...m,
      slug: slugify(m.brand, m.name),
      is_verified: true,
      popularity: 0,
    }));
    const { data, error } = await supabase
      .from("tying_materials")
      .upsert(batch, { onConflict: "slug" })
      .select("id");
    if (error) {
      console.error(`Batch ${i / CHUNK + 1} failed:`, error.message);
      failed += batch.length;
    } else {
      inserted += data?.length ?? 0;
    }
  }

  console.log(`\n✓ Done.`);
  console.log(`  Inserted/updated: ${inserted}`);
  console.log(`  Failed:           ${failed}`);
  console.log(`  Total attempted:  ${all.length}`);
  void updated;
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
