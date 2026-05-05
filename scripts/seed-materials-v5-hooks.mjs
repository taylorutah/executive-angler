/**
 * Seed v5 — Hook brand expansion (Mustad, Partridge, Owner, Umpqua, Allen).
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
// MUSTAD — Signature & Heritage barbless ranges
// =============================================================================
add({ name: 'Signature R30 Dry Fly', brand: 'Mustad', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20','22','24'], finish: 'bronze', description: 'Mustad Signature R30 — classic dry fly hook, fine wire, down eye, sproat bend.', popularity: 8 });
add({ name: 'Signature R50 Dry Fly Standard', brand: 'Mustad', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20','22'], finish: 'bronze', description: 'Mustad R50 — standard dry fly, 1X fine, down eye, classic Adams hook.', popularity: 8 });
add({ name: 'Signature S70 Dry Fly Down-Eye', brand: 'Mustad', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'bronze', description: 'Mustad S70 — heavier wire dry hook for hoppers, stoneflies, big attractors.', popularity: 7 });
add({ name: 'Signature R75 Nymph 2X Long', brand: 'Mustad', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'bronze', description: 'Mustad R75 — 2XL nymph hook, classic Pheasant Tail / Hares Ear shank length.', popularity: 8 });
add({ name: 'Signature R74 Streamer 4X Long', brand: 'Mustad', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'bronze', description: 'Mustad R74 — 4XL streamer hook for Wooly Buggers, classic streamers.', popularity: 8 });
add({ name: 'Signature R73 Streamer 3X Long', brand: 'Mustad', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'bronze', description: 'Mustad R73 — 3XL streamer/wet fly hook.', popularity: 7 });
add({ name: 'Signature R90 Curved Nymph', brand: 'Mustad', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'bronze', description: 'Mustad R90 — curved shank scud/nymph/emerger hook.', popularity: 7 });
add({ name: 'Heritage 94840 Dry Fly', brand: 'Mustad', category: 'hook', subcategory: 'dry', sizes: ['8','10','12','14','16','18','20','22','24'], finish: 'bronze', description: 'Heritage 94840 — the legendary dry fly hook, 1X fine, down eye.', popularity: 7 });
add({ name: 'Heritage 3906B Sproat Wet', brand: 'Mustad', category: 'hook', subcategory: 'wet', sizes: ['6','8','10','12','14','16'], finish: 'bronze', description: '3906B — heavy-wire wet fly hook, 1XL, sproat bend.', popularity: 6 });
add({ name: 'Heritage 9672 Streamer 3X', brand: 'Mustad', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'bronze', description: '9672 — classic streamer hook, 3XL, ringed eye.', popularity: 6 });
add({ name: 'Heritage 79580 Streamer 4X Long', brand: 'Mustad', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'bronze', description: '79580 — 4XL streamer/leech hook.', popularity: 7 });
add({ name: 'Heritage 3399 Wet Fly', brand: 'Mustad', category: 'hook', subcategory: 'wet', sizes: ['8','10','12','14','16'], finish: 'bronze', description: '3399 — sproat bend wet fly hook.', popularity: 5 });
add({ name: 'Heritage 9395 Streamer 6X Long', brand: 'Mustad', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8'], finish: 'bronze', description: '9395 — 6XL long shank streamer for big baitfish patterns.', popularity: 6 });
add({ name: 'C49S Curved Caddis Pupa', brand: 'Mustad', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18','20'], finish: 'bronze', description: 'C49S — curved scud/caddis pupa/emerger hook.', popularity: 7 });
add({ name: 'C53S Sedge / Caddis', brand: 'Mustad', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18'], finish: 'bronze', description: 'C53S — short-shank caddis/sedge dry hook.', popularity: 6 });

// =============================================================================
// PARTRIDGE — UK heritage hooks
// =============================================================================
add({ name: 'Patriot Czech Nymph', brand: 'Partridge', category: 'hook', subcategory: 'czech', sizes: ['8','10','12','14','16'], finish: 'black nickel', description: 'Partridge Patriot — Czech nymph standard, heavy gauge, ideal for tungsten Euro nymphs.', popularity: 8 });
add({ name: 'Patriot Klinkhamer Long Body', brand: 'Partridge', category: 'hook', subcategory: 'emerger', sizes: ['10','12','14','16','18','20'], finish: 'black', description: 'Partridge Klinkhamer — original parachute emerger hook with extended body.', popularity: 9 });
add({ name: 'Patriot Streamer', brand: 'Partridge', category: 'hook', subcategory: 'streamer', sizes: ['4','6','8','10'], finish: 'black nickel', description: 'Partridge Patriot streamer — long shank, strong wire.', popularity: 7 });
add({ name: 'CS10/3 Code 2 Single Hook (Salar)', brand: 'Partridge', category: 'hook', subcategory: 'salmon', sizes: ['1/0','2','4','6','8','10'], finish: 'black', description: 'CS10/3 Bartleet single salmon hook — classic spey/intruder pattern hook.', popularity: 6 });
add({ name: 'SUD2 Ideal Standard Dry', brand: 'Partridge', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20','22'], finish: 'bronze', description: 'SUD2 — Partridge’s standard dry fly hook, 1X fine.', popularity: 6 });
add({ name: 'GRS3A Captain Hamilton Wet', brand: 'Partridge', category: 'hook', subcategory: 'wet', sizes: ['8','10','12','14','16'], finish: 'bronze', description: 'GRS3A — soft hackle / wet fly hook in classic styling.', popularity: 6 });
add({ name: 'CZ1 Czech Mate', brand: 'Partridge', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16'], finish: 'black nickel', description: 'CZ1 — Czech-style competition nymph hook with heavy bend.', popularity: 7 });
add({ name: 'GRS12ST-BL Barbless Stalker', brand: 'Partridge', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'black nickel', finish: 'barbless', description: 'GRS12ST-BL — barbless stalker / nymph hook for spring creek work.', popularity: 6 });
add({ name: 'SLD2 Living Larva', brand: 'Partridge', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'bronze', description: 'SLD2 — curved shank for caddis larva and shrimp.', popularity: 6 });
add({ name: 'Z3 Hooligan Heritage Streamer', brand: 'Partridge', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8'], finish: 'black', description: 'Z3 — heavy streamer hook for jig-style sculpins and big browns.', popularity: 6 });

// =============================================================================
// OWNER (saltwater + premium freshwater)
// =============================================================================
add({ name: 'Mosquito (5377)', brand: 'Owner', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'black chrome', description: 'Owner Mosquito — strong, fine-wire octopus-style hook for stinger/trailer use.', popularity: 6 });
add({ name: 'AKI Twist Hook', brand: 'Owner', category: 'hook', subcategory: 'saltwater', sizes: ['2/0','3/0','4/0','5/0','6/0'], finish: 'tin', description: 'Owner AKI — premium offset point saltwater hook for big game flies.', popularity: 5 });
add({ name: 'SSW Cutting Point', brand: 'Owner', category: 'hook', subcategory: 'saltwater', sizes: ['1','1/0','2/0','3/0','4/0','5/0'], finish: 'tin', description: 'Owner SSW — cutting point saltwater hook for stripers, redfish, bonefish flies.', popularity: 7 });
add({ name: 'Stinger 36', brand: 'Owner', category: 'hook', subcategory: 'streamer', sizes: ['1','1/0','2/0','3/0'], finish: 'black chrome', description: 'Owner Stinger 36 — articulated stinger / trailer hook for big streamers.', popularity: 7 });

// =============================================================================
// UMPQUA — XS series + classics
// =============================================================================
add({ name: 'XS400 Standard Dry', brand: 'Umpqua', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20','22'], finish: 'bronze', description: 'Umpqua XS400 — standard dry fly hook, 1X fine, down eye.', popularity: 7 });
add({ name: 'XS406BL Klinkhamer Barbless', brand: 'Umpqua', category: 'hook', subcategory: 'emerger', sizes: ['12','14','16','18','20'], finish: 'black nickel barbless', description: 'XS406BL — barbless Klinkhamer / emerger hook.', popularity: 8 });
add({ name: 'XS410BL Standard Nymph Barbless', brand: 'Umpqua', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'black nickel barbless', description: 'XS410BL — barbless nymph hook, 1XL, perfect for Pheasant Tails.', popularity: 7 });
add({ name: 'XS420BL Curved Caddis/Scud Barbless', brand: 'Umpqua', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18','20'], finish: 'black nickel barbless', description: 'XS420BL — curved barbless scud/caddis/emerger hook.', popularity: 7 });
add({ name: 'XS500 Streamer 4X Long', brand: 'Umpqua', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'bronze', description: 'XS500 — 4XL streamer hook, the Wooly Bugger / Bunny Leech standard.', popularity: 8 });
add({ name: 'XS505 Articulated Shank Hook', brand: 'Umpqua', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6'], finish: 'black', description: 'XS505 — strong articulated rear-hook for double-hook streamers.', popularity: 7 });
add({ name: 'XS510 Salmon Single', brand: 'Umpqua', category: 'hook', subcategory: 'salmon', sizes: ['2','4','6','8'], finish: 'black', description: 'XS510 — single salmon/steelhead hook for Spey-style swung flies.', popularity: 6 });
add({ name: 'X-Series Jig 60-Degree Barbless', brand: 'Umpqua', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'black nickel barbless', description: 'Umpqua jig hook — 60-degree, barbless, perfect for Euro nymphing patterns.', popularity: 9 });
add({ name: 'C400BL Curved Barbless Nymph', brand: 'Umpqua', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18','20'], finish: 'black nickel barbless', description: 'C400BL — competition curved nymph hook.', popularity: 7 });

// =============================================================================
// ALLEN
// =============================================================================
add({ name: 'N201 BL Standard Nymph Barbless', brand: 'Allen', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'black nickel barbless', description: 'Allen N201 — value-priced barbless nymph hook, 1XL.', popularity: 6 });
add({ name: 'N204 BL Curved Caddis/Scud', brand: 'Allen', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18','20'], finish: 'black nickel barbless', description: 'Allen N204 — curved scud/caddis emerger barbless.', popularity: 6 });
add({ name: 'D102 BL Standard Dry Barbless', brand: 'Allen', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'bronze barbless', description: 'Allen D102 — standard dry fly hook, value priced.', popularity: 5 });
add({ name: 'S402 BL Streamer 4X Long', brand: 'Allen', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'black nickel barbless', description: 'Allen S402 — 4XL streamer barbless.', popularity: 6 });
add({ name: 'J100 BL Jig 60-Degree', brand: 'Allen', category: 'hook', subcategory: 'jig', sizes: ['10','12','14','16','18'], finish: 'black nickel barbless', description: 'Allen J100 — value jig hook for Euro nymphing.', popularity: 7 });
add({ name: 'I400 BL Intruder/Salmon Shank', brand: 'Allen', category: 'hook', subcategory: 'salmon', sizes: ['1.5','2.5','40mm'], finish: 'black nickel', description: 'Allen Intruder shank — for tube/shank-style steelhead and salmon flies.', popularity: 5 });

// =============================================================================
// Dedupe + report + upsert (same template)
// =============================================================================
const bySlug = {};
for (const r of records) bySlug[r.slug] = r;
const deduped = Object.values(bySlug);

const byBrand = {};
for (const r of deduped) byBrand[r.brand] = (byBrand[r.brand] || 0) + 1;

console.log(`\n=== v5 HOOKS SEED ===`);
console.log(`Total records: ${deduped.length} (after dedupe from ${records.length})`);
console.log(`\nBY BRAND:`);
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(15)} ${v}`);

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
