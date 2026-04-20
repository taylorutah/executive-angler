import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const names = [
  "Egan's Rainbow Warrior", "Rainbow Warrior",
  "Egan's Tungsten Surveyor", "Tungsten Surveyor",
  "Egan's Rainbow Warrior Perdigon",
  "Egan's Frenchie", "Frenchie",
  "Egan's Thread Frenchie",
  "Silver Bullet Baetis",
  "Egan's Red Dart",
  "Egan's GTi Caddis",
  "Egan's Iron Lotus",
  "Egan's Bionic Ant 2.0", "Bionic Ant",
  "Egan's Corn-Fed Caddis", "Corn-Fed Caddis",
  "Egan's Poacher",
  "Blowtorch",
  "Quilldigon",
  "Simple Pheasant Tail", "Pheasant Tail Nymph",
  "Soft Hackle Carrot",
  "Walt's Worm", "Sexy Walt's",
  "Lite Brite Perdigon",
  "The Mop", "Mop Fly",
  "Front End Loader Caddis",
  "Monster Dry",
  "Monster Midge",
  "Backflop Jig",
  "Lickety Split",
  "Mayday Mayfly",
  "Rowley Stone",
  "ZebraGon",
  "Pliva Perdigon",
  "Rowley's PW Nymph",
  "Squirmy Wormy", "Squirmy",
  "Olsen's CDC Midge",
];

console.log('=== Checking canonical_flies for existing patterns ===');
for (const name of names) {
  const { data } = await sb.from('canonical_flies').select('id, slug, name').ilike('name', `%${name}%`).limit(3);
  if (data && data.length > 0) {
    console.log(`"${name}" → MATCH: ${data.map(d => `${d.name} (${d.slug})`).join(', ')}`);
  } else {
    console.log(`"${name}" → NEW`);
  }
}

console.log('\n=== Material keyword search ===');
const materialKeywords = [
  'coq de leon', 'polish quill', 'veevus', 'semperfli', 'nano silk',
  'glo brite', 'sulky tinsel', 'sow scud', 'ice dub',
  'hare-tron', 'arizona synthetic', 'simi seal', 'mega simi',
  'ripple ice dub', 'flashback tinsel', 'trigger point',
  'foam ant', 'uni flex', 'mop', 'squirmy',
  'krystal flash', 'holographic tinsel', 'net back',
  'ultra wire', 'dohiku', 'hanak', 'umpqua xc400',
  'tmc 2457', 'tmc 2499', 'tmc 100',
  'scud back', 'polar chenille', 'zonker', 'squirrel zonker',
  'mink zonker', 'solarez', 'loon uv', 'embroidery floss',
  'body quill', 'whiting brahma', 'sow-scud', 'super fine',
  'danville', 'wapsi antron', 'sulky metallic',
  'slf squirrel', 'pheasant tail', 'peacock herl',
  'cdc', 'hen cape', 'grizzly hackle', 'elk hair',
];

for (const kw of materialKeywords) {
  const { data } = await sb.from('tying_materials').select('id, name, brand, category').ilike('name', `%${kw}%`).limit(3);
  if (data && data.length > 0) {
    console.log(`"${kw}" (${data.length}+) → ${data.map(d => `${d.brand || '?'} ${d.name}`).slice(0,2).join(' | ')}`);
  } else {
    console.log(`"${kw}" → ❌ NO MATCH`);
  }
}
