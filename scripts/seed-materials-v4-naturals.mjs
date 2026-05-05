/**
 * Seed v4 — Natural materials (deer/elk/bucktail/calf/rabbit/fox/squirrel).
 * Idempotent: upsert on `slug`. One row per branded product; colors[]/sizes[] hold variants.
 *
 * Dry run: node scripts/seed-materials-v4-naturals.mjs --dry-run
 * Live:    node scripts/seed-materials-v4-naturals.mjs
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
  return `${brand || ''}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const records = [];
const add = (r) => records.push({ ...r, is_verified: true, popularity: r.popularity ?? 5, slug: slugify(r.brand, r.name) });

// =============================================================================
// Bucktails (Hareline) — 20+ colors, single row with full color array
// Source: harelinedubbin.com/bucktails
// =============================================================================
const BUCKTAIL_COLORS = [
  'White', 'Natural', 'Black', 'Yellow', 'Hot Yellow', 'Chartreuse',
  'Hot Pink', 'Pink', 'Red', 'Hot Orange', 'Orange', 'Olive',
  'Light Olive', 'Dark Olive', 'Brown', 'Tan', 'Purple', 'Blue',
  'Royal Blue', 'Gray', 'Fl. Yellow', 'Fl. Chartreuse', 'Fl. Orange', 'Fl. Pink',
];
add({
  name: 'Bucktail',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'bucktail',
  material_type: 'natural hair',
  colors: BUCKTAIL_COLORS,
  description: 'Hareline bucktail — the streamer hair. Long, hollow, durable; wing on Clousers, Deceivers, baitfish patterns. Sold by the half tail.',
  popularity: 9,
});
add({
  name: 'Northern Bucktail',
  brand: 'Wapsi',
  category: 'tail',
  subcategory: 'bucktail',
  material_type: 'natural hair',
  colors: ['White', 'Natural', 'Black', 'Yellow', 'Chartreuse', 'Red', 'Olive', 'Brown', 'Hot Pink', 'Hot Orange', 'Purple', 'Blue'],
  description: 'Wapsi northern bucktail — premium-grade hair, less hollow than southern, stacks tighter. Half-tail packaging.',
  popularity: 7,
});

// =============================================================================
// Deer body / face / coastal / yearling (Hareline + Nature's Spirit)
// =============================================================================
add({
  name: 'Premo Deer Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'deer-body',
  material_type: 'natural hair',
  colors: ['Natural', 'Black', 'Olive', 'Brown', 'Yellow', 'Tan', 'Orange', 'Red', 'Chartreuse', 'White', 'Dark Dun'],
  description: 'Premium grade deer body hair — long, fine tips, ideal for Comparaduns, Sparkle Duns, hoppers, spun heads. Hareline staple.',
  popularity: 9,
});
add({
  name: 'Comparadun / Coastal Deer Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'deer-coastal',
  material_type: 'natural hair',
  colors: ['Natural', 'Light Dun', 'Dark Dun', 'Tan', 'Yellow Olive', 'Mahogany'],
  description: 'Short, fine tips for Comparadun/Sparkle Dun wings. Lighter dye lots than premo body hair.',
  popularity: 8,
});
add({
  name: 'Spinning Deer Hair',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'deer-spinning',
  material_type: 'natural hair',
  colors: ['Natural', 'Black', 'Olive', 'Brown', 'Yellow', 'White', 'Chartreuse', 'Red', 'Hot Orange'],
  description: 'Hollow, easy-spinning hair for muddler heads, bass bugs, mouse patterns. Stacks and packs cleanly.',
  popularity: 8,
});
add({
  name: 'Yearling Deer Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'deer-yearling',
  material_type: 'natural hair',
  colors: ['Natural', 'Tan', 'Light Dun', 'Dark Dun'],
  description: 'Short, fine yearling deer hair for size 14–18 dries — caddis wings and elk-style emergers.',
  popularity: 7,
});
add({
  name: 'Coastal Deer Hair',
  brand: "Nature's Spirit",
  category: 'wing',
  subcategory: 'deer-coastal',
  material_type: 'natural hair',
  colors: ['Natural', 'Tan', 'Light Dun', 'Dark Dun', 'Mahogany', 'Olive Dun'],
  description: "Nature's Spirit graded coastal deer — exceptionally fine tips for size 16–22 Comparaduns.",
  popularity: 7,
});
add({
  name: 'Mule Deer Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'deer-mule',
  material_type: 'natural hair',
  colors: ['Natural', 'Olive', 'Dark Brown'],
  description: 'Mule deer body — denser, stiffer than whitetail; popular for hopper bodies and stonefly wings.',
  popularity: 6,
});

// =============================================================================
// Elk hair (Hareline + Nature's Spirit)
// =============================================================================
add({
  name: 'Cow Elk Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'elk-cow',
  material_type: 'natural hair',
  colors: ['Natural', 'Bleached', 'Yellow', 'Tan', 'Olive', 'Black', 'Light Dun'],
  description: 'Elk Hair Caddis bread-and-butter. Cow elk = shorter, finer tips than bull elk. Universal #12–18 caddis wing.',
  popularity: 10,
});
add({
  name: 'Bull Elk Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'elk-bull',
  material_type: 'natural hair',
  colors: ['Natural', 'Bleached', 'Tan', 'Dark Brown', 'Olive'],
  description: 'Coarser, longer bull elk — stonefly bodies, big hoppers, indicator wings.',
  popularity: 7,
});
add({
  name: 'Yearling Elk Hair',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'elk-yearling',
  material_type: 'natural hair',
  colors: ['Natural', 'Bleached', 'Light Dun'],
  description: 'Smaller, finer yearling elk — size 16–20 caddis and small dries.',
  popularity: 6,
});

// =============================================================================
// Calf tail / Calf body
// =============================================================================
add({
  name: 'Calf Tail',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'calf',
  material_type: 'natural hair',
  colors: ['White', 'Black', 'Brown', 'Tan', 'Yellow', 'Red', 'Hot Pink', 'Chartreuse', 'Orange', 'Olive', 'Fl. Yellow', 'Fl. Orange'],
  description: 'Crinkly calf tail — Wulff wings, hairwing salmon flies, parachute posts. Stacks cleaner than expected.',
  popularity: 8,
});
add({
  name: 'Calf Body Hair (Kip)',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'calf-body',
  material_type: 'natural hair',
  colors: ['White', 'Black', 'Brown', 'Tan', 'Olive', 'Light Dun'],
  description: 'Straight calf body / kip — Royal Wulff wings, indicator posts. Less crinkle than tail.',
  popularity: 7,
});

// =============================================================================
// Rabbit / Zonker strips
// =============================================================================
const RABBIT_COLORS = [
  'Natural', 'Black', 'White', 'Olive', 'Dark Olive', 'Brown',
  'Tan', 'Rust', 'Sculpin Olive', 'Hot Pink', 'Purple', 'Yellow',
  'Hot Orange', 'Chartreuse', 'Gray', 'Barred Olive', 'Barred Black',
  'Barred Natural',
];
add({
  name: 'Standard Zonker Strips',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'zonker',
  material_type: 'rabbit fur on hide',
  sizes: ['1/8 inch', '3/16 inch', '1/4 inch'],
  colors: RABBIT_COLORS,
  description: 'Cut-strip rabbit zonker — Sculpin, Zonker, Sex Dungeon tail/body material. Movement and bulk in water.',
  popularity: 9,
});
add({
  name: 'Magnum Zonker Strips',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'zonker',
  material_type: 'rabbit fur on hide',
  sizes: ['Magnum'],
  colors: RABBIT_COLORS,
  description: 'Magnum-cut rabbit strips for big streamers, articulated patterns, pike/bass flies.',
  popularity: 8,
});
add({
  name: 'Cross Cut Rabbit Strips',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'rabbit-cross-cut',
  material_type: 'rabbit fur on hide',
  colors: RABBIT_COLORS,
  description: 'Cross-cut for palmering bodies and dubbing-loop collars. Won’t twist when wrapped.',
  popularity: 8,
});
add({
  name: 'Rabbit Dubbing',
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'rabbit',
  material_type: 'natural fur',
  colors: ['Natural', 'Hares Ear', 'Dark Hares Ear', 'Black', 'Olive', 'Brown', 'Tan', 'Gray', 'Cream', 'Rust', 'Adams Gray'],
  description: 'Bagged rabbit dubbing — buggy, soft, classic hares-ear texture. Touch-dub or wax-loaded.',
  popularity: 8,
});

// =============================================================================
// Arctic fox tail / body
// =============================================================================
const FOX_COLORS = [
  'White', 'Natural', 'Black', 'Olive', 'Dark Olive', 'Brown',
  'Tan', 'Rust', 'Sculpin Olive', 'Light Dun', 'Red', 'Yellow',
  'Hot Orange', 'Hot Pink', 'Chartreuse', 'Purple', 'Steelhead Blue',
];
add({
  name: 'Arctic Fox Tail',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'fox-tail',
  material_type: 'natural hair',
  colors: FOX_COLORS,
  description: 'Long, ultra-mobile arctic fox — steelhead intruders, soft hackle wings, articulated streamers.',
  popularity: 7,
});
add({
  name: 'Arctic Fox Body',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'fox-body',
  material_type: 'natural hair',
  colors: FOX_COLORS,
  description: 'Shorter, denser fox body — collars, micro-streamer dubbing-loops, baitfish heads.',
  popularity: 6,
});

// =============================================================================
// Squirrel (fox/gray/pine) — tail and dubbing
// =============================================================================
add({
  name: 'Fox Squirrel Tail',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'squirrel',
  material_type: 'natural hair',
  colors: ['Natural'],
  description: "Fox squirrel tail — wings on Picket Pin, soft hackles. Buggy color, fine tips.",
  popularity: 7,
});
add({
  name: 'Gray Squirrel Tail',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'squirrel',
  material_type: 'natural hair',
  colors: ['Natural'],
  description: "Gray squirrel tail — barred markings, classic streamer wing material.",
  popularity: 6,
});
add({
  name: 'Pine Squirrel Strips',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'pine-squirrel',
  material_type: 'fur on hide',
  sizes: ['1/16 inch', '1/8 inch'],
  colors: ['Natural', 'Black', 'Olive', 'Brown', 'Tan', 'Rust', 'Hot Pink', 'Sculpin Olive', 'Cinnamon'],
  description: 'Mini-zonker strips — Mini Sex Dungeon, Sculpzilla, Galloup’s patterns; size 6–2 streamers.',
  popularity: 8,
});
add({
  name: 'Squirrel Dubbing',
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'squirrel',
  material_type: 'natural fur',
  colors: ['Natural', 'Fox Squirrel', 'Gray Squirrel', 'Pine Squirrel'],
  description: "Squirrel guard hair + underfur dubbing — spiky, buggy, grade-A nymph dubbing.",
  popularity: 7,
});
add({
  name: 'STS Trilobal Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'synthetic-trilobal',
  material_type: 'synthetic blend',
  colors: ['Black', 'Brown', 'Olive', 'Tan', 'Cinnamon', 'Rust', 'Sculpin Olive', 'Hot Pink', 'Chartreuse'],
  description: 'STS Trilobal — sculpin/streamer dubbing for collars and dubbing loops. Wapsi staple.',
  popularity: 7,
});

// =============================================================================
// Misc supporting hair
// =============================================================================
add({
  name: 'Snowshoe Rabbit Foot',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'snowshoe',
  material_type: 'natural fur',
  colors: ['Natural', 'Light Dun', 'Dark Dun', 'Olive', 'Cream', 'Tan', 'Adams Gray'],
  description: 'Snowshoe hare foot — water-resistant emerger wings, USK-style trailing shucks.',
  popularity: 7,
});
add({
  name: 'Hares Mask',
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'hares-mask',
  material_type: 'natural fur',
  colors: ['Natural', 'Olive', 'Black', 'Tan'],
  description: 'Whole hare’s mask — pluck guard hair + soft underfur for buggy nymph dubbing. The classic.',
  popularity: 9,
});
add({
  name: 'Moose Body Hair',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'moose-body',
  material_type: 'natural hair',
  colors: ['Natural'],
  description: 'Black/brown moose body — classic Wulff/Adams tail material. Stiff, durable.',
  popularity: 6,
});
add({
  name: 'Moose Mane',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'moose-mane',
  material_type: 'natural hair',
  colors: ['Natural', 'Mixed Light/Dark'],
  description: 'Long moose mane fibers — woven body and tail material; classic dry-fly tail substitute.',
  popularity: 5,
});

// =============================================================================
// Dedupe by slug & report
// =============================================================================
const bySlug = {};
for (const r of records) bySlug[r.slug] = r;
const deduped = Object.values(bySlug);

const byBrand = {}, byCategory = {};
for (const r of deduped) {
  byBrand[r.brand] = (byBrand[r.brand] || 0) + 1;
  byCategory[r.category] = (byCategory[r.category] || 0) + 1;
}

console.log(`\n=== v4 NATURALS SEED ===`);
console.log(`Total records: ${deduped.length} (after dedupe from ${records.length})`);
console.log(`\nBY BRAND:`);
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)} ${v}`);
console.log(`\nBY CATEGORY:`);
for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)} ${v}`);

if (DRY_RUN) {
  console.log(`\n[DRY RUN] Sample records:`);
  console.log(JSON.stringify(deduped.slice(0, 2), null, 2));
  process.exit(0);
}

const CHUNK = 100;
let upserted = 0;
for (let i = 0; i < deduped.length; i += CHUNK) {
  const chunk = deduped.slice(i, i + CHUNK);
  const { error } = await supabase.from('tying_materials').upsert(chunk, { onConflict: 'slug' });
  if (error) {
    console.error(`\n❌ Chunk ${i / CHUNK + 1} failed:`, error.message);
    process.exit(1);
  }
  upserted += chunk.length;
  console.log(`✓ Upserted chunk ${i / CHUNK + 1} (${upserted}/${deduped.length})`);
}

const { count } = await supabase.from('tying_materials').select('*', { count: 'exact', head: true });
console.log(`\n✅ Done. Total materials in DB: ${count}`);
