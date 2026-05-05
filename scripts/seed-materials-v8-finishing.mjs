/**
 * Seed v8 — Finishing & flash (eyes, oval/embossed tinsel, junglecock, Estaz, EP brushes, Loon, Solarez).
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
// PAINTED LEAD EYES — Hareline
// =============================================================================
add({
  name: 'Painted Lead Eyes',
  brand: 'Hareline',
  category: 'eye',
  subcategory: 'lead-painted',
  material_type: 'lead',
  sizes: ['Mini 1/100 oz','Extra Small 1/80 oz','Small 1/50 oz','Medium 1/36 oz','Large 1/24 oz','Extra Large 1/10 oz'],
  colors: ['White/Red','Red/Black','Yellow/Black','Chartreuse/Red','Hot Orange/Black','Hot Pink/Black','Black/White','Pearl/Black'],
  description: 'Hareline painted lead dumbbell eyes — Clousers, sculpins, weighted streamers. Eye + weight in one.',
  popularity: 9,
});
add({
  name: 'Plain Lead Eyes',
  brand: 'Hareline',
  category: 'eye',
  subcategory: 'lead-plain',
  material_type: 'lead',
  sizes: ['Mini','Extra Small','Small','Medium','Large','Extra Large'],
  colors: ['Black','Plain Lead','Nickel'],
  description: 'Plain lead dumbbell eyes — paint your own or use as-is for sculpins.',
  popularity: 7,
});
add({
  name: 'Real Eyes Plus',
  brand: 'Spirit River',
  category: 'eye',
  subcategory: 'real-eyes',
  material_type: 'brass',
  sizes: ['Small','Medium','Large','Extra Large'],
  colors: ['Gold/Red','Silver/Red','Black/Red','Gold/Black','Nickel/Black','Yellow/Black'],
  description: "Spirit River Real Eyes Plus — recessed pupil dumbbell eyes. Premium look, less weight than lead.",
  popularity: 7,
});
add({
  name: '3D Holographic Eyes',
  brand: 'Hareline',
  category: 'eye',
  subcategory: '3d-stick-on',
  material_type: 'plastic',
  sizes: ['1.5mm','2mm','2.5mm','3mm','4mm','5mm','6mm','7mm','9mm'],
  colors: ['Silver','Gold','Pearl','Red','Yellow','Chartreuse','Holographic Silver','Holographic Gold'],
  description: 'Stick-on 3D pupil eyes — sculpin/baitfish heads, glued under UV resin.',
  popularity: 8,
});
add({
  name: 'Bead Chain Eyes',
  brand: 'Hareline',
  category: 'eye',
  subcategory: 'bead-chain',
  material_type: 'metal bead chain',
  sizes: ['Extra Small','Small','Medium','Large'],
  colors: ['Silver','Gold','Black','Brass'],
  description: 'Bead-chain eyes — light weight for spring creek streamers, bonefish flies.',
  popularity: 7,
});
add({
  name: 'Mono Eyes',
  brand: 'Hareline',
  category: 'eye',
  subcategory: 'mono',
  material_type: 'monofilament',
  sizes: ['Small','Medium','Large'],
  colors: ['Black','Red','Yellow','White'],
  description: 'Burnt mono eyes — neutral-buoyancy eyes for shrimp/crab patterns.',
  popularity: 5,
});

// =============================================================================
// OVAL / EMBOSSED TINSEL
// =============================================================================
add({
  name: 'Oval Tinsel',
  brand: 'UTC',
  category: 'ribbing',
  subcategory: 'oval-tinsel',
  material_type: 'metallic',
  sizes: ['Extra Small','Small','Medium','Large'],
  colors: ['Gold','Silver','Copper'],
  description: 'UTC oval tinsel — body and rib material on classic wets, soft hackles, salmon flies.',
  popularity: 7,
});
add({
  name: 'Oval Tinsel',
  brand: 'Veniard',
  category: 'ribbing',
  subcategory: 'oval-tinsel',
  material_type: 'metallic',
  sizes: ['Small','Medium','Large','Extra Large'],
  colors: ['Gold','Silver','Copper'],
  description: 'Veniard oval tinsel — premium UK tinsel, classic salmon/spey use.',
  popularity: 6,
});
add({
  name: 'Embossed Tinsel',
  brand: 'Hareline',
  category: 'ribbing',
  subcategory: 'embossed-tinsel',
  material_type: 'metallic',
  sizes: ['Small','Medium','Large'],
  colors: ['Gold','Silver','Copper'],
  description: 'Embossed tinsel — textured body wrap on classic streamers (Mickey Finn, Black Ghost).',
  popularity: 6,
});
add({
  name: 'Mylar Tinsel Flat',
  brand: 'Hareline',
  category: 'ribbing',
  subcategory: 'flat-tinsel',
  material_type: 'mylar',
  sizes: ['Extra Small','Small','Medium','Large'],
  colors: ['Gold','Silver','Pearl','Holographic Silver','Holographic Gold','Copper','Red','Blue'],
  description: 'Flat mylar tinsel — body material on Zonkers, Hornberg, classic streamers.',
  popularity: 7,
});

// =============================================================================
// JUNGLECOCK + substitutes
// =============================================================================
add({
  name: 'Junglecock Cape',
  brand: 'Veniard',
  category: 'wing',
  subcategory: 'junglecock',
  material_type: 'rare feather',
  colors: ['Natural'],
  description: 'Junglecock cape — premium classic salmon/streamer cheek feather. CITES-permitted captive bred.',
  popularity: 5,
});
add({
  name: 'Junglecock Substitute Eyes',
  brand: 'Spirit River',
  category: 'wing',
  subcategory: 'junglecock-sub',
  material_type: 'synthetic',
  sizes: ['Small','Medium','Large'],
  colors: ['Natural','White'],
  description: 'Junglecock substitute — printed/lacquered synthetic for streamer cheeks. Worthwhile alternative.',
  popularity: 6,
});

// =============================================================================
// ESTAZ / CACTUS CHENILLE
// =============================================================================
add({
  name: 'Estaz',
  brand: 'Hareline',
  category: 'chenille',
  subcategory: 'estaz',
  material_type: 'synthetic',
  sizes: ['Petite','Medium','Magnum','Grande'],
  colors: ['Pearl','White','Olive','Black','Brown','Sculpin Olive','Hot Pink','Hot Orange','Red','Chartreuse','Steelhead Blue','Purple','Yellow','Tan','Gold','Silver','Peacock'],
  description: 'Estaz — sparkle-fiber chenille for egg patterns, attractor bodies, San Juan worms.',
  popularity: 9,
});
add({
  name: 'Cactus Chenille',
  brand: 'Hareline',
  category: 'chenille',
  subcategory: 'cactus',
  material_type: 'synthetic',
  sizes: ['Small','Medium','Large'],
  colors: ['Pearl','Olive','Black','Hot Pink','Chartreuse','Hot Orange','Red','Gold','Silver','Peacock'],
  description: 'Cactus chenille — fluffier, longer fibers than Estaz. Egg patterns, intruder dubbing-loop bodies.',
  popularity: 7,
});

// =============================================================================
// EP FIBERS
// =============================================================================
add({
  name: 'EP Fibers',
  brand: 'Enrico Puglisi',
  category: 'wing',
  subcategory: 'ep-fibers',
  material_type: 'synthetic',
  colors: ['White','Tan','Olive','Sculpin Olive','Sand','Black','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Purple','Brown','Pearl Light','Pearl Dark'],
  description: 'EP Fibers — the original synthetic baitfish fiber. Holds shape wet/dry, builds tapered streamer profiles.',
  popularity: 9,
});
add({
  name: 'EP Trigger Point Fibers',
  brand: 'Enrico Puglisi',
  category: 'wing',
  subcategory: 'ep-trigger',
  material_type: 'synthetic',
  colors: ['White','Tan','Olive','Black','Hot Pink','Chartreuse','Pearl'],
  description: 'EP Trigger Point — finer fiber for smaller baitfish flies (size 6 and below).',
  popularity: 7,
});

// =============================================================================
// LOON UV RESIN + finishing
// =============================================================================
for (const variant of [
  { name: 'UV Fly Finish Thin', desc: 'Loon Thin — self-leveling, low viscosity UV resin. Tight bodies and small heads.' },
  { name: 'UV Fly Finish Thick', desc: 'Loon Thick — high-build UV resin. Big heads, baitfish profiles.' },
  { name: 'UV Fly Finish Flow', desc: 'Loon Flow — extra-thin, self-leveling for perfect bodies on small flies.' },
]) {
  add({
    name: variant.name,
    brand: 'Loon',
    category: 'resin',
    subcategory: 'uv-resin',
    material_type: 'UV-cured resin',
    description: variant.desc,
    popularity: 9,
  });
}
add({
  name: 'Hard Head Cement',
  brand: 'Loon',
  category: 'resin',
  subcategory: 'cement',
  material_type: 'cement',
  description: 'Loon Hard Head — fast-drying head cement for whip-finish reinforcement.',
  popularity: 8,
});
add({
  name: 'Knot Sense',
  brand: 'Loon',
  category: 'resin',
  subcategory: 'uv-resin',
  material_type: 'UV-cured resin',
  description: 'Knot Sense — small-bottle UV resin for knot reinforcement and fly finishing in the field.',
  popularity: 6,
});
add({
  name: 'UV Bond Power Light',
  brand: 'Loon',
  category: 'marker',
  subcategory: 'uv-light',
  material_type: 'UV light',
  description: 'Loon Power Light — high-intensity UV cure light for resin work.',
  popularity: 7,
});

// =============================================================================
// SOLAREZ — UV resins
// =============================================================================
for (const variant of [
  { name: 'Bone Dry', desc: 'Solarez Bone Dry — ultra-thin UV resin, no tack, ideal for small bodies.' },
  { name: 'Thin Hard Formula', desc: 'Solarez Thin Hard — tack-free thin UV resin. Bonds tight to thread.' },
  { name: 'Thick Hard Formula', desc: 'Solarez Thick Hard — high-build UV resin for large heads.' },
  { name: 'Flex Formula', desc: 'Solarez Flex — flexible UV resin for jointed/articulated patterns.' },
]) {
  add({
    name: variant.name,
    brand: 'Solarez',
    category: 'resin',
    subcategory: 'uv-resin',
    material_type: 'UV-cured resin',
    description: variant.desc,
    popularity: 8,
  });
}

// =============================================================================
// MORE FLASH
// =============================================================================
add({
  name: 'Polar Flash',
  brand: 'Hareline',
  category: 'flash',
  subcategory: 'polar-flash',
  material_type: 'synthetic',
  colors: ['Pearl','Silver','Gold','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Purple','Olive','Black','Holographic Silver','Holographic Pearl'],
  description: 'Polar Flash — long, flat strands for streamer wings. Substitute for Flashabou.',
  popularity: 8,
});
add({
  name: 'Angel Hair',
  brand: 'Hareline',
  category: 'flash',
  subcategory: 'angel-hair',
  material_type: 'synthetic',
  colors: ['Pearl','Silver','Gold','Olive','Black','Sculpin Olive','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Purple','Tan','Salmon Pink'],
  description: 'Angel Hair — fine, flat, kinky flash for baitfish wings and saltwater patterns.',
  popularity: 7,
});
add({
  name: 'Frizzy Fiber',
  brand: 'Hareline',
  category: 'flash',
  subcategory: 'frizzy',
  material_type: 'synthetic',
  colors: ['Pearl','Olive','Black','Sculpin Olive','Hot Pink','Hot Orange','Chartreuse','Steelhead Blue','Purple'],
  description: 'Frizzy Fiber — kinked synthetic for streamer flank/topping. Holds water-pushing volume.',
  popularity: 6,
});
add({
  name: 'Holographic Tinsel',
  brand: 'Hareline',
  category: 'flash',
  subcategory: 'holographic',
  material_type: 'mylar',
  sizes: ['Small','Medium','Large'],
  colors: ['Silver','Gold','Pearl','Pink','Blue','Red','Green','Copper','Purple'],
  description: 'Holographic tinsel — flat tinsel for ribs and flash streaks. Strong UV reflection.',
  popularity: 7,
});

// =============================================================================
// MISC body / wing
// =============================================================================
add({
  name: 'Body Stretch (Stretch Floss)',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'stretch-floss',
  material_type: 'stretch material',
  colors: ['Olive','Black','Brown','Red','Yellow','Sulphur','Hot Orange','Pink','Cream','Gray','Caddis Green'],
  description: 'Stretch Floss — segmented, translucent body wrap for chironomids, midges, scuds.',
  popularity: 7,
});
add({
  name: 'Body Glass / V-Rib',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'body-glass',
  material_type: 'stretch v-rib',
  sizes: ['Small','Medium','Large'],
  colors: ['Clear','Olive','Brown','Black','Red','Pink','Pearl'],
  description: 'V-Rib / Body Glass — D-shaped translucent rib for nymph segmentation.',
  popularity: 7,
});
add({
  name: 'Scud Back',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'scud-back',
  material_type: 'stretch vinyl',
  sizes: ['1/8 inch','1/4 inch','3/8 inch'],
  colors: ['Olive','Tan','Pink','Gray','Brown','Clear','Black'],
  description: 'Scud Back — clear/colored stretch vinyl for scud and sow bug shells.',
  popularity: 8,
});
add({
  name: 'Thin Skin',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'thin-skin',
  material_type: 'thin skin',
  colors: ['Mottled Oak','Mottled Olive','Mottled Brown','Mottled Black','Golden Stone','Tan','Olive','Brown'],
  description: 'Thin Skin — printed material for stonefly nymph backs and cased caddis.',
  popularity: 7,
});
add({
  name: 'Latex Sheet',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'latex',
  material_type: 'latex',
  colors: ['Cream','Olive','Tan','Pink','Brown','Black'],
  description: 'Latex sheet — segmented worm and grub bodies. Stretches when wrapped.',
  popularity: 5,
});
add({
  name: 'Pearl Body Tubing (Mylar Piping)',
  brand: 'Hareline',
  category: 'body',
  subcategory: 'mylar-tubing',
  material_type: 'mylar tubing',
  sizes: ['Small','Medium','Large','Extra Large'],
  colors: ['Pearl','Silver','Gold','Holographic Silver','Holographic Gold','Pink','Olive'],
  description: 'Mylar piping / pearl body tubing — Zonker bodies, baitfish overlays, salmon fly bodies.',
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

console.log(`\n=== v8 FINISHING SEED ===`);
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
