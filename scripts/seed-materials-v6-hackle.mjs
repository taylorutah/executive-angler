/**
 * Seed v6 — Hackle expansion (Metz, Collins, Whiting, schlappen, soft hackle).
 * Idempotent upsert on `slug`.
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
  return `${brand || ''}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const records = [];
const add = (r) => records.push({ ...r, is_verified: true, popularity: r.popularity ?? 5, slug: slugify(r.brand, r.name) });

const STD_HACKLE_COLORS = ['Grizzly','Brown','Black','White','Cream','Ginger','Light Dun','Medium Dun','Dark Dun','Badger','Furnace','Coachman Brown','Dyed Olive'];

// =============================================================================
// METZ — capes & saddles
// =============================================================================
for (const grade of [
  { name: 'Magnum', desc: 'Metz Magnum — top-tier cape, longest fibers, widest hook range.' },
  { name: 'Grade #1', desc: 'Metz #1 — premium grade dry hackle, full color/size range.' },
  { name: 'Grade #2', desc: 'Metz #2 — workhorse dry fly cape, very high quality, broader hook range.' },
  { name: 'Grade #3', desc: 'Metz #3 — value-priced cape for student tyers and high-volume use.' },
]) {
  add({
    name: `Cape ${grade.name}`,
    brand: 'Metz',
    category: 'feather',
    subcategory: 'cape',
    material_type: 'rooster cape',
    colors: STD_HACKLE_COLORS,
    description: grade.desc,
    popularity: grade.name === 'Grade #2' ? 9 : 7,
  });
  add({
    name: `Saddle ${grade.name}`,
    brand: 'Metz',
    category: 'feather',
    subcategory: 'saddle',
    material_type: 'rooster saddle',
    colors: STD_HACKLE_COLORS,
    description: `Metz ${grade.name} saddle — long, narrow feathers, excellent for size 12–18 dries with high feather count.`,
    popularity: grade.name === 'Grade #2' ? 9 : 7,
  });
}

// =============================================================================
// COLLINS HACKLE FARM — premium small-batch
// =============================================================================
add({
  name: 'Rooster Cape',
  brand: 'Collins',
  category: 'feather',
  subcategory: 'cape',
  material_type: 'rooster cape',
  colors: ['Grizzly','Brown','Black','Cream','Ginger','Cream Badger','Cream Variant','Medium Dun','Dark Dun','Light Dun','Coachman','Furnace','Honey Dun'],
  description: 'Collins rooster cape — Pennsylvania family farm, prized for natural variants and dun lines. Smaller than Whiting but exceptional fiber quality.',
  popularity: 7,
});
add({
  name: 'Rooster Saddle',
  brand: 'Collins',
  category: 'feather',
  subcategory: 'saddle',
  material_type: 'rooster saddle',
  colors: ['Grizzly','Brown','Black','Cream','Ginger','Medium Dun','Dark Dun','Honey Dun'],
  description: 'Collins saddle — fine fibers, narrow stems, great for technical dries.',
  popularity: 6,
});

// =============================================================================
// WHITING expansion — Brahma hen, Coq de Leon, Spey, Eurohackle
// =============================================================================
add({
  name: 'Brahma Hen Cape',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'hen-cape',
  material_type: 'hen cape',
  colors: ['Natural','Black','Brown','Olive','Tan','Dun','White','Grizzly','Cream','Light Olive','Speckled Cree','Brown Olive','Furnace','Badger'],
  description: 'Whiting Brahma hen — soft, webby, perfect for soft hackles, wet flies, sculpin collars, and Euro nymphs.',
  popularity: 9,
});
add({
  name: 'Brahma Hen Saddle',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'hen-saddle',
  material_type: 'hen saddle',
  colors: ['Natural','Black','Brown','Olive','Tan','Dun','Grizzly','Cream','Speckled Cree'],
  description: 'Whiting Brahma hen saddle — longer feathers than the cape, ideal for streamer/soft-hackle bodies.',
  popularity: 8,
});
add({
  name: 'Coq de Leon Hen Cape',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'hen-cape',
  material_type: 'hen cape',
  colors: ['Light Pardo','Dark Pardo','Indio','Speckled Sorrel'],
  description: 'Whiting CDL hen — heavily speckled, traditional Spanish dry/soft hackle. Tail and wing material.',
  popularity: 7,
});
add({
  name: 'Coq de Leon Tailing Pack',
  brand: 'Whiting',
  category: 'tail',
  subcategory: 'cdl',
  material_type: 'rooster spey/tail',
  colors: ['Pardo','Indio','Sorrel','Black'],
  description: 'Whiting CDL tailing — long, stiff, speckled fibers for split-tail mayfly imitations.',
  popularity: 8,
});
add({
  name: 'Spey Saddle (4B)',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'spey',
  material_type: 'rooster spey',
  colors: ['Black','Olive','Brown','Yellow','Hot Orange','Burnt Orange','Purple','Hot Pink','Claret','Blue','Chartreuse','White'],
  description: 'Whiting 4B Spey — long fibers, tapering stems for dee/spey/intruder collars.',
  popularity: 7,
});
add({
  name: 'Eurohackle 100s Pack',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'saddle-100s',
  material_type: 'rooster saddle',
  sizes: ['12','14','16','18','20','22'],
  colors: ['Grizzly','Brown','Black','Dun','Cream','Ginger','Badger','Furnace','Olive Dyed Grizzly'],
  description: 'Whiting Eurohackle / 100 packs — bagged size-specific feathers for high-volume tying. Great value.',
  popularity: 9,
});
add({
  name: 'Hebert Miner Cape',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'cape',
  material_type: 'rooster cape',
  colors: ['Grizzly','Cream','Brown','Ginger','Coachman','Cream Badger','Honey Dun','Medium Dun','Dark Dun'],
  description: 'Whiting Hebert Miner — softer feathers than the standard Whiting line, more web; great for traditional dries.',
  popularity: 7,
});
add({
  name: 'High & Dry Hackle',
  brand: 'Whiting',
  category: 'feather',
  subcategory: 'cape',
  material_type: 'rooster cape',
  colors: ['Grizzly','Brown','Cream','Ginger','Dun','Black','White','Light Olive','Olive Dyed Grizzly','Sulphur'],
  description: 'Whiting High & Dry — premium dry-fly cape, narrow stems, exceptional barb count.',
  popularity: 8,
});

// =============================================================================
// SCHLAPPEN
// =============================================================================
add({
  name: 'Schlappen',
  brand: 'Hareline',
  category: 'feather',
  subcategory: 'schlappen',
  material_type: 'rooster body',
  colors: ['White','Black','Yellow','Hot Yellow','Olive','Sculpin Olive','Brown','Tan','Burnt Orange','Hot Orange','Red','Hot Pink','Purple','Chartreuse','Blue'],
  description: 'Schlappen — long-fibered webby hackle for streamer collars and large dry flies. Hareline staple.',
  popularity: 9,
});

// =============================================================================
// MORE SOFT HACKLE
// =============================================================================
add({
  name: 'Hungarian Partridge Skin',
  brand: 'Hareline',
  category: 'feather',
  subcategory: 'partridge',
  material_type: 'partridge',
  colors: ['Natural','Brown','Olive','Yellow','Orange','Dun'],
  description: 'Hungarian partridge skin — classic soft-hackle wet fly material. Mottled bars on every feather.',
  popularity: 9,
});
add({
  name: 'English Grouse',
  brand: 'Hareline',
  category: 'feather',
  subcategory: 'grouse',
  material_type: 'grouse',
  colors: ['Natural'],
  description: 'English grouse — classic British wet-fly soft hackle, mottled brown.',
  popularity: 6,
});
add({
  name: 'Starling Skin',
  brand: 'Hareline',
  category: 'feather',
  subcategory: 'starling',
  material_type: 'starling',
  colors: ['Natural','Bleached','Olive','Brown'],
  description: 'Starling skin — tiny feathers for size 18–24 soft hackles and emergers.',
  popularity: 7,
});
add({
  name: 'Mallard Flank',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'mallard',
  material_type: 'duck flank',
  colors: ['Natural','Bronze','Yellow','Orange','Red','Olive','Brown'],
  description: 'Mallard flank — wood-duck substitute, mayfly wings on Catskill-style dries.',
  popularity: 8,
});
add({
  name: 'Wood Duck Flank',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'wood-duck',
  material_type: 'duck flank',
  colors: ['Natural','Lemon'],
  description: 'Wood duck flank — the premium mayfly wing material; lemon-barred natural is the gold standard.',
  popularity: 7,
});
add({
  name: 'Teal Flank',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'teal',
  material_type: 'duck flank',
  colors: ['Natural'],
  description: 'Teal flank — heavily barred, classic streamer wing, salmon fly substitute.',
  popularity: 6,
});
add({
  name: 'Hen Pheasant Skin',
  brand: 'Hareline',
  category: 'feather',
  subcategory: 'pheasant',
  material_type: 'hen pheasant',
  colors: ['Natural'],
  description: 'Hen pheasant — soft hackle/wet wings; finer markings than rooster pheasant.',
  popularity: 6,
});
add({
  name: 'Cock Pheasant Tail',
  brand: 'Hareline',
  category: 'tail',
  subcategory: 'pheasant-tail',
  material_type: 'pheasant tail',
  colors: ['Natural','Olive','Black','Brown','Red','Orange','Sulphur'],
  description: "Pheasant tail — Sawyer's PT bread-and-butter. Per pair.",
  popularity: 10,
});
add({
  name: 'Peacock Herl Strung',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'peacock',
  material_type: 'peacock',
  colors: ['Natural'],
  description: 'Strung peacock herl — Royal Wulff bands, prince nymph thoraxes, the classic.',
  popularity: 10,
});
add({
  name: 'Peacock Eye Tail',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'peacock',
  material_type: 'peacock eye',
  colors: ['Natural'],
  description: 'Peacock eye — the densest, brightest herl. Best for prince nymph thoraxes.',
  popularity: 8,
});
add({
  name: 'Ostrich Herl',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'ostrich',
  material_type: 'ostrich',
  colors: ['Black','White','Olive','Brown','Tan','Gray','Red','Yellow','Hot Orange','Sculpin Olive','Light Olive','Purple','Hot Pink','Chartreuse'],
  description: 'Ostrich herl — gills on stoneflies, long flowy collars, long-fiber thoraxes.',
  popularity: 9,
});
add({
  name: 'CDC Puffs',
  brand: 'Hareline',
  category: 'feather',
  subcategory: 'cdc',
  material_type: 'cdc',
  colors: ['Natural','White','Olive','Tan','Black','Dun','Light Dun','Brown','Hot Orange','Yellow','Pink'],
  description: 'CDC puffs (oiler-puff feathers) — high floatation, ideal for emergers and small dries.',
  popularity: 9,
});
add({
  name: 'CDC Feathers (Marc Petitjean)',
  brand: 'Marc Petitjean',
  category: 'feather',
  subcategory: 'cdc',
  material_type: 'cdc',
  colors: ['Natural','Bleached','Light Dun','Medium Dun','Dark Dun','Olive','Tan','Mahogany','Black','Cream'],
  description: 'Marc Petitjean CDC — graded, Swiss, premium quality. The standard for CDC dries and emergers.',
  popularity: 8,
});

// =============================================================================
// Dedupe + upsert
// =============================================================================
const bySlug = {};
for (const r of records) bySlug[r.slug] = r;
const deduped = Object.values(bySlug);

const byBrand = {};
for (const r of deduped) byBrand[r.brand] = (byBrand[r.brand] || 0) + 1;

console.log(`\n=== v6 HACKLE SEED ===`);
console.log(`Total records: ${deduped.length} (after dedupe from ${records.length})`);
console.log(`\nBY BRAND:`);
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(20)} ${v}`);

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
