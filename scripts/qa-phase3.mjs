import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const confidenceSlugs = [
  'rainbow-warrior', 'egans-tungsten-surveyor', 'egans-rainbow-warrior-perdigon',
  'frenchie', 'egans-thread-frenchie', 'silver-bullet-baetis', 'egans-red-dart',
  'egans-gti-caddis', 'egans-iron-lotus', 'egans-bionic-ant-2', 'egans-corn-fed-caddis',
  'egans-poacher-olive', 'blowtorch', 'olsen-quilldigon', 'pheasant-tail-nymph',
  'soft-hackle-carrot', 'walt-s-worm', 'sexy-walts-worm', 'lite-brite-perdigon',
  'mop-fly', 'front-end-loader-caddis', 'monster-dry', 'monster-midge', 'backflop-jig',
  'lickety-split', 'mayday-mayfly', 'rowley-stone', 'zebragon', 'pliva-perdigon',
  'rowleys-pw-nymph', 'squirmy-wormy', 'olsens-cdc-midge',
];

console.log('=== Phase 3 QA ===\n');

const { count: matCount } = await sb.from('tying_materials').select('*', { count: 'exact', head: true });
console.log(`Total materials: ${matCount}`);

const { count: flyCount } = await sb.from('canonical_flies').select('*', { count: 'exact', head: true });
console.log(`Total canonical flies: ${flyCount}`);

const { count: ingCount } = await sb.from('fly_recipe_ingredients').select('*', { count: 'exact', head: true });
console.log(`Total recipe ingredients: ${ingCount}\n`);

console.log('=== Spot-check 5 flies ===\n');
const spotCheck = ['egans-tungsten-surveyor', 'silver-bullet-baetis', 'olsen-quilldigon', 'lickety-split', 'monster-dry'];
for (const slug of spotCheck) {
  const { data: fly } = await sb.from('canonical_flies').select('id, slug, name, tagline, video_url, affiliate_links, origin_credit').eq('slug', slug).maybeSingle();
  if (!fly) { console.log(`❌ ${slug} NOT FOUND`); continue; }
  const { data: ings, count } = await sb.from('fly_recipe_ingredients').select('role, material_name, material_id', { count: 'exact' }).eq('canonical_fly_id', fly.id);
  const linked = (ings || []).filter(i => i.material_id).length;
  console.log(`${fly.name} (${slug})`);
  console.log(`  Tagline: ${(fly.tagline || '').slice(0,70)}`);
  console.log(`  Video: ${fly.video_url || '—'}`);
  console.log(`  Links: ${(fly.affiliate_links || []).length}`);
  console.log(`  Origin: ${fly.origin_credit || '—'}`);
  console.log(`  Ingredients: ${count} total, ${linked} linked to materials (${Math.round(linked/count*100)}%)`);
  console.log('');
}

console.log('=== Overlap flies — verify metadata patched ===\n');
const overlaps = ['rainbow-warrior', 'frenchie', 'blowtorch', 'mop-fly', 'squirmy-wormy', 'walt-s-worm', 'sexy-walts-worm', 'pheasant-tail-nymph'];
for (const slug of overlaps) {
  const { data: fly } = await sb.from('canonical_flies').select('slug, tagline, video_url, affiliate_links, origin_credit').eq('slug', slug).maybeSingle();
  if (!fly) { console.log(`❌ ${slug} MISSING`); continue; }
  const hasVideo = !!fly.video_url;
  const hasLinks = (fly.affiliate_links || []).length > 0;
  const hasOrigin = !!fly.origin_credit;
  console.log(`${slug}: video=${hasVideo} links=${hasLinks} origin=${hasOrigin}`);
}

console.log('\n=== Match rate across all 32 Confidence flies ===\n');
let totalIng = 0, totalLinked = 0;
for (const slug of confidenceSlugs) {
  const { data: fly } = await sb.from('canonical_flies').select('id').eq('slug', slug).maybeSingle();
  if (!fly) continue;
  const { data: ings } = await sb.from('fly_recipe_ingredients').select('material_id').eq('canonical_fly_id', fly.id);
  totalIng += (ings || []).length;
  totalLinked += (ings || []).filter(i => i.material_id).length;
}
console.log(`Total Confidence ingredients: ${totalIng}`);
console.log(`Linked to materials: ${totalLinked} (${Math.round(totalLinked/totalIng*100)}%)`);

console.log('\n=== Unmatched ingredients ===\n');
const { data: unmatched } = await sb.from('fly_recipe_ingredients').select('canonical_fly_id, role, material_name').is('material_id', null).in('canonical_fly_id',
  (await sb.from('canonical_flies').select('id').in('slug', confidenceSlugs)).data.map(f => f.id)
);
(unmatched || []).forEach(u => console.log(`  [${u.role}] ${u.material_name}`));
