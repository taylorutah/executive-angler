/**
 * Seed v7 — Dubbing & body materials (Senyo's Laser Dub, SLF, Wapsi, Orvis, brushes, polypro).
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

// =============================================================================
// SENYO'S LASER DUB (Hareline) — full color range
// =============================================================================
add({
  name: "Senyo's Laser Dub",
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'streamer',
  material_type: 'synthetic chopped fiber',
  colors: [
    'White','Black','Olive','Sculpin Olive','Sculpin Brown','Sculpin Gray','Tan',
    'Yellow','Hot Yellow','Chartreuse','Hot Pink','Hot Orange','Burnt Orange',
    'Red','Purple','Steelhead Blue','Sand','Pearl','Adams Gray','Cream',
    'Salmon Pink','Gold','Copper','Dark Olive','Light Olive','Rust','Brown',
    'Fl. Pink','Fl. Yellow','Fl. Chartreuse','Fl. Orange',
  ],
  description: "Senyo's Laser Dub — the dubbing-loop streamer dubbing. Designed for sculpin/baitfish heads and bodies. Dense, mobile, holds shape.",
  popularity: 10,
});

// =============================================================================
// SLF (Wapsi/Hareline) — synthetic line
// =============================================================================
add({
  name: 'SLF Squirrel Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'slf',
  material_type: 'synthetic + squirrel blend',
  colors: ['Hares Ear','Olive','Black','Brown','Tan','Gray','Cream','Rust','Adams Gray','Sulphur','Dark Olive','Caddis Green','PMD'],
  description: 'SLF Squirrel — synthetic-blend dubbing with squirrel guard hairs. Sparkly, buggy, ideal for nymphs.',
  popularity: 8,
});
add({
  name: 'SLF Prism Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'slf-prism',
  material_type: 'synthetic',
  colors: ['Pearl','Mother of Pearl','UV Pearl','Olive','Brown','Gold','Copper','Black','Hot Pink','Chartreuse','Steelhead Blue','Purple','Hot Orange'],
  description: 'SLF Prism — fine synthetic dubbing with iridescent flash. Saltwater shrimp, baitfish bodies, attractor nymphs.',
  popularity: 7,
});
add({
  name: 'SLF Saltwater Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'slf-saltwater',
  material_type: 'synthetic',
  colors: ['Pearl','Tan','Olive','Pink','Chartreuse','Purple','Hot Orange','White','Black','Sand','Crab Tan'],
  description: 'SLF Saltwater — coarse synthetic for crab/shrimp/baitfish bodies. Tough fibers hold up in salt.',
  popularity: 6,
});

// =============================================================================
// WAPSI / HARELINE expansion
// =============================================================================
add({
  name: 'Sow-Scud Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'sow-scud',
  material_type: 'synthetic',
  colors: ['Tan','Olive','Pink','Orange','Cream','Gray','Brown','UV Pink','UV Olive','UV Tan','Dark Olive','Insect Green'],
  description: 'Wapsi Sow-Scud — translucent dubbing for scuds, sow bugs, soft-body nymphs.',
  popularity: 7,
});
add({
  name: 'Sparkle Emerger Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'sparkle-emerger',
  material_type: 'synthetic',
  colors: ['Olive','Brown','Gray','Cream','Sulphur','Adams Gray','Caddis Green','PMD','Trico','Black','Rust'],
  description: 'Wapsi Sparkle Emerger — fine flashy dubbing for emergers and trailing shucks. Antron-blend.',
  popularity: 7,
});
add({
  name: "Awesome 'Possum Dubbing",
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'possum',
  material_type: 'natural blend',
  colors: ['Hares Ear','Olive','Brown','Tan','Black','Cream','Rust','Sulphur','Caddis Green','PMD'],
  description: "Awesome 'Possum — buggy mix of possum, rabbit, hare. Premium nymph dubbing.",
  popularity: 7,
});
add({
  name: 'Antron Yarn',
  brand: 'Wapsi',
  category: 'tail',
  subcategory: 'antron-yarn',
  material_type: 'antron',
  colors: ['White','Cream','Yellow','Olive','Brown','Tan','Rust','Pink','Hot Orange','Gray','Black','Adams Gray','PMD','Sulphur','Caddis Green'],
  description: 'Antron yarn — sparkle dun shucks, parachute posts, X-Caddis trailing shuck.',
  popularity: 8,
});
add({
  name: 'Hareline Dubbin (Original)',
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'hareline',
  material_type: 'synthetic + rabbit blend',
  colors: ['Hares Ear','Black','Olive','Brown','Adams Gray','Tan','Cream','Rust','Caddis Green','Yellow','Sulphur','Light Olive','PMD','Trico'],
  description: 'Hareline Dubbin — the original, classic synthetic-blend nymph dubbing.',
  popularity: 8,
});
add({
  name: 'Ice Dub UV',
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'ice-dub',
  material_type: 'synthetic flash',
  colors: ['Pearl','UV Pearl','UV Tan','UV Olive','UV Brown','UV Black','UV Pink','UV Orange','Steelhead Blue','Mother of Pearl','Peacock','Copper','Gold','Rust','Sculpin Olive','Hot Pink','Hot Orange','Chartreuse','Purple'],
  description: 'Ice Dub UV — sparkle dubbing with UV-reactive fibers. Perdigon thoraxes, hot spots, attractor nymphs.',
  popularity: 10,
});
add({
  name: 'UV Polar Chenille',
  brand: 'Hareline',
  category: 'chenille',
  subcategory: 'polar-chenille',
  material_type: 'synthetic',
  sizes: ['Standard','Magnum'],
  colors: ['Pearl','UV Pearl','Olive','Black','Brown','Sculpin Olive','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Purple','Tan','Yellow','Copper'],
  description: 'UV Polar Chenille — flash core wrapped with translucent fibers. Sculpin/baitfish collars, mini-streamer bodies.',
  popularity: 8,
});
add({
  name: 'Diamond Brite Dubbing',
  brand: 'Hareline',
  category: 'dubbing',
  subcategory: 'diamond-brite',
  material_type: 'synthetic',
  colors: ['Pearl','Olive','Black','Brown','Tan','Hot Orange','Hot Pink','Chartreuse','Purple','Steelhead Blue','Copper','Gold'],
  description: 'Diamond Brite — coarse trilobal/tinsel dubbing for streamer bodies, eggs, attractors.',
  popularity: 6,
});

// =============================================================================
// ORVIS / SUPERFINE
// =============================================================================
add({
  name: 'Spectrum Dubbing',
  brand: 'Orvis',
  category: 'dubbing',
  subcategory: 'spectrum',
  material_type: 'synthetic',
  colors: ['BWO','PMD','Sulphur','Hendrickson','Adams Gray','Caddis Green','March Brown','Trico','Black','Olive','Rust','Cream','Brown','Tan'],
  description: 'Orvis Spectrum — fine synthetic dry-fly dubbing matched to common mayfly hatches.',
  popularity: 7,
});
add({
  name: 'Superfine Dry Fly Dubbing',
  brand: 'Wapsi',
  category: 'dubbing',
  subcategory: 'superfine',
  material_type: 'synthetic',
  colors: ['Adams Gray','BWO','PMD','Sulphur Yellow','Sulphur Orange','Hendrickson','March Brown','Mahogany','Trico Black','Light Cahill','Pale Morning Dun','Pale Evening Dun','Olive','Cream','Tan','Brown','Rust','Caddis Green','Hot Pink','Hot Orange'],
  description: 'Wapsi Superfine — the premier dry-fly dubbing. Fine, water-shedding, hatch-matched colors.',
  popularity: 10,
});

// =============================================================================
// PREDATOR / BIG-FLY brushes
// =============================================================================
add({
  name: 'Senyo Predator Wrap',
  brand: 'Hareline',
  category: 'flash',
  subcategory: 'predator-wrap',
  material_type: 'synthetic',
  colors: ['Pearl','Olive','Black','Sculpin Olive','Hot Orange','Hot Pink','Steelhead Blue','Purple','Brown','Tan'],
  description: 'Senyo Predator Wrap — flat ribbon for big-streamer bodies. Wraps tight, holds shape.',
  popularity: 7,
});
add({
  name: 'EP Sommerlatte Foxy Brush',
  brand: 'Enrico Puglisi',
  category: 'flash',
  subcategory: 'ep-brush',
  sizes: ['1.5 inch','3 inch','4 inch'],
  colors: ['White','Olive','Sculpin Olive','Sand','Tan','Black','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Brown'],
  description: 'EP Foxy Brush — pre-tied flash/fiber brush for sculpins, baitfish, streamers. Wraps in seconds.',
  popularity: 7,
});
add({
  name: 'Aqua Veil Chenille',
  brand: 'Senyo',
  category: 'chenille',
  subcategory: 'aqua-veil',
  material_type: 'synthetic flash',
  colors: ['Pearl','Olive','Sculpin Olive','Hot Pink','Hot Orange','Steelhead Blue','Purple','Brown','Black'],
  description: "Senyo's Aqua Veil — translucent body chenille for streamers, intruders, swing flies.",
  popularity: 7,
});
add({
  name: "Senyo Laser Yarn",
  brand: 'Hareline',
  category: 'flash',
  subcategory: 'laser-yarn',
  material_type: 'synthetic',
  colors: ['Pearl','UV Pearl','Olive','Black','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Purple','Sand'],
  description: 'Senyo Laser Yarn — translucent body yarn / wing material. Chartreuse/Pearl is a steelhead staple.',
  popularity: 6,
});

// =============================================================================
// POLY YARN / PARACHUTE POSTS
// =============================================================================
add({
  name: 'Poly Yarn',
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'poly-yarn',
  material_type: 'polypropylene',
  colors: ['White','Black','Yellow','Orange','Hot Pink','Hot Orange','Chartreuse','Olive','Brown','Tan','Cream','Light Dun','Medium Dun','Dark Dun','Adams Gray','Fl. Pink','Fl. Yellow','Fl. Orange','Sulphur'],
  description: 'Polypropylene yarn — parachute posts, wings, indicator material. Floats high, easy to see.',
  popularity: 9,
});
add({
  name: "McLean's Hi-Vis",
  brand: 'Hareline',
  category: 'wing',
  subcategory: 'hi-vis',
  material_type: 'synthetic poly',
  colors: ['White','Hot Orange','Hot Pink','Yellow','Chartreuse','Black'],
  description: "McLean's Hi-Vis — buoyant indicator post material; doubles as wing material.",
  popularity: 7,
});

// =============================================================================
// Dedupe + upsert
// =============================================================================
const bySlug = {};
for (const r of records) bySlug[r.slug] = r;
const deduped = Object.values(bySlug);

const byBrand = {};
for (const r of deduped) byBrand[r.brand] = (byBrand[r.brand] || 0) + 1;

console.log(`\n=== v7 DUBBING SEED ===`);
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
