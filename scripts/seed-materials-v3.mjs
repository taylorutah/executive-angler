/**
 * Seed Script: Fly-Tying Materials v3 — Thread & Wire Expansion
 *
 * Expands four product lines to their complete manufacturer catalogs:
 *   • UTC Ultra Thread 70 — 35 colors (Wapsi)
 *   • UTC Ultra Wire      — 28 colors × up to 5 sizes (Wapsi)
 *   • Veevus threads      — 12 product lines, ~190 SKUs (veevus.com)
 *   • Veniard Glo-Brite   — 16 floss colors + 16 multi-yarn colors
 *
 * Idempotent via upsert on `slug`. Existing rows will be refreshed, new rows inserted.
 *
 * Run dry-run:  node scripts/seed-materials-v3.mjs --dry-run
 * Run for real: node scripts/seed-materials-v3.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function slugify(brand, name) {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// =============================================================================
// UTC Ultra Thread 70 — 35 colors (Wapsi official)
// Source: https://wapsifly.com/products/spooled/ultra-thread-70denier/
// =============================================================================
const UTC70_COLORS = [
  // Standard colors (26)
  'White', 'Cream', 'Yellow', 'Hopper Yellow', 'Burnt Orange', 'Blue Dun',
  'Light Tan', 'Tan', 'Brown', 'Rusty Brown', 'Wine', 'Red', 'Light Olive',
  'Yellow Olive', 'Dark Brown', 'Olive', 'Brown Olive', 'Purple', 'Black',
  'Dark Gray', 'Gray Brown', 'Wood Duck', 'Olive Green', 'Peacock Blue',
  'Watery Olive', 'Dark Olive',
  // Fluorescents (9)
  'Fl. Yellow', 'Fl. Orange', 'Fl. Green', 'Fl. Fire Orange', 'Fl. White',
  'Fl. Shell Pink', 'Fl. Chartreuse', 'Fl. Pink', 'Fl. Cerise',
];

const utc70 = UTC70_COLORS.map((c) => ({
  name: `Ultra Thread 70 ${c}`,
  brand: 'UTC',
  category: 'thread',
  subcategory: 'standard',
  sizes: ['70 denier'],
  colors: [c.toLowerCase()],
  material_type: 'standard',
  weight: '70 denier',
  description: `UTC Ultra Thread 70 denier in ${c}. Strong, flat-lying waxed thread — go-to for size 14–22 nymphs and dries.`,
}));

// =============================================================================
// UTC Ultra Wire — 28 colors × up to 5 sizes (Wapsi official)
// Source: https://wapsifly.com/products/spooled/ultra-wire/
// Consolidates per-color rows with sizes[] array reflecting available gauges.
// =============================================================================
const ALL_SIZES = ['x-small', 'small', 'brassie', 'medium', 'large'];
const ULTRA_WIRE_MATRIX = [
  { color: 'Amber',                sizes: ALL_SIZES },
  { color: 'Black',                sizes: ALL_SIZES },
  { color: 'Blue Metallic',        sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Brown',                sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Cerise',               sizes: ['brassie', 'medium', 'large'] },
  { color: 'Chartreuse Metallic',  sizes: ALL_SIZES },
  { color: 'Copper',               sizes: ALL_SIZES },
  { color: 'Copper Brown',         sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Dun',                  sizes: ['brassie', 'medium', 'large'] },
  { color: 'Fuchsia',              sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Ginger',               sizes: ['small', 'brassie', 'medium'] },
  { color: 'Gold',                 sizes: ALL_SIZES },
  { color: 'Golden Olive',         sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Gray',                 sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Green Metallic',       sizes: ALL_SIZES },
  { color: 'Gun Metal Blue',       sizes: ALL_SIZES },
  { color: 'Hot Orange Metallic',  sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Hot Yellow Metallic',  sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Olive',                sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Pink',                 sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Purple',               sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Red Metallic',         sizes: ALL_SIZES },
  { color: 'Rust',                 sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Sculpin Olive',        sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Silver',               sizes: ALL_SIZES },
  { color: 'Tan',                  sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'White',                sizes: ['small', 'brassie', 'medium', 'large'] },
  { color: 'Wine Metallic',        sizes: ['small', 'brassie', 'medium', 'large'] },
];

const ultraWire = ULTRA_WIRE_MATRIX.map(({ color, sizes }) => ({
  name: `Ultra Wire ${color}`,
  brand: 'UTC',
  category: 'wire',
  subcategory: 'ultra-wire',
  sizes,
  colors: [color.toLowerCase()],
  material_type: 'copper wire',
  description: `UTC Ultra Wire in ${color} — corrosion-resistant copper wire for ribbing, segmented bodies, and weighted nymph underbodies. Sizes: ${sizes.join(', ')}.`,
}));

// =============================================================================
// Veevus — 12 product lines, full catalog (veevus.com)
// Per-color-per-size rows matching existing pattern ("Veevus 8/0 Black")
// =============================================================================

const veevus16 = [
  'Black', 'White', 'Claret', 'Gray', 'Olive Dun', 'Light Grey', 'Red', 'Dun',
  'Olive', 'Dark Tan', 'Brown', 'Light Cahill', 'Pink', 'Fl. Yellow Chartreuse',
  'Fl. Orange', 'Fl. Green', 'Tan', 'Light Olive', 'Sunburst Yellow', 'Rust',
  'Blue Winged Olive',
].map((c) => ({
  name: `Veevus 16/0 ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'ultra-fine',
  sizes: ['16/0'], colors: [c.toLowerCase()], weight: '16/0', material_type: 'polyester',
  description: `Veevus 16/0 thread in ${c}. Ultra-fine 100m spool — ideal for size 22–28 midges, dry flies, and small nymphs.`,
}));

const veevus14 = [
  'Black', 'White', 'Dark Brown', 'Red', 'Gray', 'Orange', 'Dun', 'Rusty Brown',
  'Brown', 'Tan', 'Claret', 'Pale Red', 'Light Cahill', 'Olive', 'Pale Green',
  'Pink', 'Fl. Yellow Chartreuse', 'Fl. Orange', 'Fl. Green', 'Light Olive',
].map((c) => ({
  name: `Veevus 14/0 ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'fine',
  sizes: ['14/0'], colors: [c.toLowerCase()], weight: '14/0', material_type: 'polyester',
  description: `Veevus 14/0 thread in ${c}. 100m spool — fine thread for size 18–24 patterns.`,
}));

const veevus12 = [
  'Black', 'White', 'Lavender', 'Light Cahill', 'Claret', 'Red', 'Light Grey',
  'Light Olive', 'Dun', 'Pale Tan', 'Dark Olive', 'Tan', 'Dark Dun Brown', 'Pink',
  'Fl. Yellow Chartreuse', 'Fl. Orange', 'Fl. Green', 'Olive', 'Lt. Olive',
].map((c) => ({
  name: `Veevus 12/0 ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'fine',
  sizes: ['12/0'], colors: [c.toLowerCase()], weight: '12/0', material_type: 'polyester',
  description: `Veevus 12/0 thread in ${c}. 100m spool — versatile fine thread for size 16–22 trout flies.`,
}));

const veevus10 = [
  'Black', 'White', 'Orange', 'Pale Green', 'Hot Orange', 'Sunburst Yellow',
  'Rose Pink', 'Pale Pink', 'Dark Pink', 'Light Cahill', 'Marron', 'Light Olive',
  'Claret', 'Pink', 'Red', 'Rusty Brown', 'Purple', 'Lavender', 'Pale Red',
  'Dark Brown', 'Brown', 'Fl. Yellow Chartreuse', 'Fl. Orange', 'Fl. Green', 'Olive',
].map((c) => ({
  name: `Veevus 10/0 ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'standard',
  sizes: ['10/0'], colors: [c.toLowerCase()], weight: '10/0', material_type: 'polyester',
  description: `Veevus 10/0 thread in ${c}. 100m spool — widest color range in Veevus lineup.`,
}));

const veevus8 = [
  'Black', 'White', 'Rusty Brown', 'Red', 'Brown', 'Pink', 'Purple', 'Orange',
  'Light Cahill', 'Dark Pink', 'Claret', 'Tan', 'Dark Dun Brown', 'Olive',
  'Fl. Yellow Chartreuse', 'Fl. Orange', 'Fl. Green', 'Light Olive',
].map((c) => ({
  name: `Veevus 8/0 ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'standard',
  sizes: ['8/0'], colors: [c.toLowerCase()], weight: '8/0', material_type: 'polyester',
  description: `Veevus 8/0 thread in ${c}. 100m spool — workhorse thread for size 12–18 trout flies and nymphs.`,
}));

const veevus6 = [
  'Black', 'White', 'Rusty Brown', 'Red', 'Pale Green', 'Rose Pink', 'Lavender',
  'Pink', 'Silver Doctor Blue', 'Light Cahill', 'Dark Pink', 'Claret',
  'Fl. Yellow Chartreuse', 'Fl. Orange', 'Fl. Green', 'Olive', 'Brown', 'Light Olive',
].map((c) => ({
  name: `Veevus 6/0 ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'heavy',
  sizes: ['6/0'], colors: [c.toLowerCase()], weight: '6/0', material_type: 'polyester',
  description: `Veevus 6/0 thread in ${c}. 100m spool — heavy thread for streamers and size 2–12 flies.`,
}));

// GSP: 5 sizes × 2 colors, but 30D is White only (9 SKUs not 10)
const veevusGSP = [
  { size: '30D', colors: ['White'] },
  { size: '50D', colors: ['Black', 'White'] },
  { size: '100D', colors: ['Black', 'White'] },
  { size: '150D', colors: ['Black', 'White'] },
  { size: '200D', colors: ['Black', 'White'] },
].flatMap(({ size, colors }) =>
  colors.map((c) => ({
    name: `Veevus GSP ${size} ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'gsp',
    sizes: [size], colors: [c.toLowerCase()], weight: size, material_type: 'gel-spun polyethylene',
    description: `Veevus GSP ${size} in ${c}. Gel-spun polyethylene — extreme strength for deer-hair spinning and heavy streamers.`,
  })),
);

// Power Thread: 3 sizes × 10 colors
const POWER_COLORS = ['Black', 'White', 'Olive', 'Red', 'Gray', 'Brown', 'Fl. Hot Pink', 'Fl. Orange', 'Fl. Chartreuse', 'Fl. Fire Orange'];
const veevusPower = ['70D', '140D', '240D'].flatMap((size) =>
  POWER_COLORS.map((c) => ({
    name: `Veevus Power Thread ${size} ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'power',
    sizes: [size], colors: [c.toLowerCase()], weight: size, material_type: 'polyester power',
    description: `Veevus Power Thread ${size} in ${c}. Flat, strong, laid-flat profile for saltwater and large streamer patterns.`,
  })),
);

// Body Quills: 16 colors, single product (~30m)
const veevusBodyQuills = [
  'Black', 'Pale Pink', 'Lt. Olive', 'Gold', 'Olive', 'Claret', 'Hot Orange',
  'Brown', 'Yellow', 'Fuchsia', 'Tan', 'Fl. Hot Pink', 'G. Brown', 'Fl. Orange',
  'Fl. Yellow', 'Fl. Chartreuse',
].map((c) => ({
  name: `Veevus Body Quill ${c}`, brand: 'Veevus', category: 'body', subcategory: 'body-quill',
  colors: [c.toLowerCase()], material_type: 'synthetic quill',
  description: `Veevus Body Quill in ${c}. Synthetic segmented quill for nymph and dry fly bodies — 30m per spool.`,
}));

// Iris Thread: 22 colors
const veevusIris = [
  'Black Rainbow', 'Silver Snow', 'Blue', 'Gold', 'Copper', 'Pink', 'Smolt Blue',
  'Purple', 'Light Blue', 'Red', 'Olive', 'Aqua Green', 'Tan', 'Cream', 'Peacock',
  'Shrimp Pink', 'Bonefish Tan', 'Fl. Pink', 'Fl. Yellow', 'Fl. Orange',
  'Fl. Yellow Chartreuse', 'Pearl',
].map((c) => ({
  name: `Veevus Iris Thread ${c}`, brand: 'Veevus', category: 'flash', subcategory: 'iris',
  colors: [c.toLowerCase()], material_type: 'iridescent multi-strand',
  description: `Veevus Iris Thread in ${c}. Iridescent multi-strand thread/flash — for bodies, ribs, and highlights. 30m per spool.`,
}));

// Monofil: 2 sizes × 2 colors
const veevusMonofil = [
  { size: '0.10mm', colors: ['Black', 'Clear'] },
  { size: '0.20mm', colors: ['Black', 'Clear'] },
].flatMap(({ size, colors }) =>
  colors.map((c) => ({
    name: `Veevus Monofil ${size} ${c}`, brand: 'Veevus', category: 'thread', subcategory: 'mono',
    sizes: [size], colors: [c.toLowerCase()], weight: size, material_type: 'monofilament',
    description: `Veevus Monofil ${size} in ${c}. Clear/black monofilament thread for translucent bodies and shellbacks.`,
  })),
);

// Kevlar: single SKU
const veevusKevlar = [{
  name: 'Veevus Kevlar Thread',
  brand: 'Veevus',
  category: 'thread',
  subcategory: 'kevlar',
  colors: ['yellow'],
  material_type: 'kevlar',
  description: 'Veevus Kevlar Thread in natural yellow. Extreme tensile strength for spinning deer hair and bass bug heads. 75m per spool.',
}];

const veevus = [
  ...veevus16, ...veevus14, ...veevus12, ...veevus10, ...veevus8, ...veevus6,
  ...veevusGSP, ...veevusPower, ...veevusBodyQuills, ...veevusIris, ...veevusMonofil,
  ...veevusKevlar,
];

// =============================================================================
// Veniard Glo-Brite — 16 numbered colors × 2 product lines (Floss, Multi Yarn)
// Source: veniard.com (official)
// =============================================================================
const GLO_BRITE_COLORS = [
  { n: 1, name: 'Neon Magenta' },
  { n: 2, name: 'Pink' },
  { n: 3, name: 'Crimson' },
  { n: 4, name: 'Scarlet' },
  { n: 5, name: 'Fire Orange' },
  { n: 6, name: 'Hot Orange' },
  { n: 7, name: 'Orange' },
  { n: 8, name: 'Amber' },
  { n: 9, name: 'Chrome Yellow' },
  { n: 10, name: 'Yellow' },
  { n: 11, name: 'Phosphor Yellow' },
  { n: 12, name: 'Lime Green' },
  { n: 13, name: 'Green' },
  { n: 14, name: 'Blue' },
  { n: 15, name: 'Purple' },
  { n: 16, name: 'White' },
];

const gloBriteFloss = GLO_BRITE_COLORS.map(({ n, name }) => ({
  name: `Glo-Brite Floss No.${n} ${name}`,
  brand: 'Veniard',
  category: 'body',
  subcategory: 'floss',
  colors: [name.toLowerCase()],
  material_type: 'fluorescent floss',
  description: `Veniard Glo-Brite Floss No.${n} — ${name}. Classic fluorescent multi-strand floss for hot spots, butts, and tags. The standard for salmon tube flies and steelhead patterns.`,
}));

const gloBriteMultiYarn = GLO_BRITE_COLORS.map(({ n, name }) => ({
  name: `Glo-Brite Multi Yarn No.${n} ${name}`,
  brand: 'Veniard',
  category: 'body',
  subcategory: 'yarn',
  colors: [name.toLowerCase()],
  material_type: 'fluorescent yarn',
  description: `Veniard Glo-Brite Multi Yarn No.${n} — ${name}. Fluorescent synthetic yarn for parachute posts, hot spots, and indicator wings.`,
}));

// =============================================================================
// Combine everything
// =============================================================================
const allMaterials = [
  ...utc70,
  ...ultraWire,
  ...veevus,
  ...gloBriteFloss,
  ...gloBriteMultiYarn,
];

// Normalize: add slug, ensure required fields, strip blanks
// popularity=5 surfaces these curated additions above legacy popularity=0 items
const records = allMaterials.map((m) => ({
  slug: slugify(m.brand, m.name),
  name: m.name,
  brand: m.brand,
  category: m.category,
  subcategory: m.subcategory || null,
  sizes: m.sizes || null,
  colors: m.colors || null,
  material_type: m.material_type || null,
  weight: m.weight || null,
  finish: m.finish || null,
  description: m.description || null,
  is_verified: true,
  popularity: 5,
}));

// Deduplicate by slug (safety)
const seen = new Set();
const deduped = records.filter((r) => {
  if (seen.has(r.slug)) return false;
  seen.add(r.slug);
  return true;
});

// =============================================================================
// Reporting & upsert
// =============================================================================
const byBrand = {};
const byCategory = {};
for (const r of deduped) {
  byBrand[r.brand] = (byBrand[r.brand] || 0) + 1;
  byCategory[r.category] = (byCategory[r.category] || 0) + 1;
}

console.log(`\n=== v3 MATERIALS SEED ===`);
console.log(`Total records: ${deduped.length} (after dedupe from ${records.length})`);
console.log(`\nBY BRAND:`);
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(15)} ${v}`);
}
console.log(`\nBY CATEGORY:`);
for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(15)} ${v}`);
}

if (DRY_RUN) {
  console.log(`\n[DRY RUN] First 3 records:`);
  console.log(JSON.stringify(deduped.slice(0, 3), null, 2));
  console.log(`\n[DRY RUN] Last 3 records:`);
  console.log(JSON.stringify(deduped.slice(-3), null, 2));
  console.log(`\nRun without --dry-run to upsert.`);
  process.exit(0);
}

// Upsert in chunks of 100
const CHUNK = 100;
let upserted = 0;
for (let i = 0; i < deduped.length; i += CHUNK) {
  const chunk = deduped.slice(i, i + CHUNK);
  const { error } = await supabase
    .from('tying_materials')
    .upsert(chunk, { onConflict: 'slug' });
  if (error) {
    console.error(`\n❌ Chunk ${i / CHUNK + 1} failed:`, error.message);
    process.exit(1);
  }
  upserted += chunk.length;
  console.log(`✓ Upserted chunk ${i / CHUNK + 1} (${upserted}/${deduped.length})`);
}

// Post-insert verification
const { count } = await supabase
  .from('tying_materials')
  .select('*', { count: 'exact', head: true });
console.log(`\n✅ Done. Total materials in DB: ${count}`);
