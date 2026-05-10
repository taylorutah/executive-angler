// Second-pass consolidation: rows like "Ultra Wire Small" / "Ultra Wire Brassie"
// where a parent "Ultra Wire" already exists with all sizes/colors merged.
// Heuristic: child.name = `${parent.name} ${size}` where size ∈ parent.sizes[]
// and they share (brand, category).
//
// Usage:
//   node scripts/consolidate-size-suffixes.mjs            (dry-run)
//   node scripts/consolidate-size-suffixes.mjs --commit

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const COMMIT = process.argv.includes('--commit');
console.log(COMMIT ? '⚠ COMMIT MODE' : 'DRY RUN (use --commit to execute)');

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const materials = [];
for (let offset = 0; ; offset += 1000) {
  const { data, error } = await s
    .from('tying_materials')
    .select('id, name, brand, category, sizes, colors, weight')
    .order('id')
    .range(offset, offset + 999);
  if (error) throw error;
  if (!data?.length) break;
  materials.push(...data);
  if (data.length < 1000) break;
}

// Index parent rows by (brand, category, name lowercase)
const byKey = new Map();
for (const m of materials) {
  if (!m.brand || !m.sizes || m.sizes.length < 2) continue; // parents must have ≥2 sizes
  byKey.set(`${m.brand.toLowerCase()}||${m.category}||${m.name.toLowerCase()}`, m);
}

const duplicates = []; // {child, parent, sizeToken}

for (const child of materials) {
  if (!child.brand || !Array.isArray(child.sizes) || child.sizes.length !== 1) continue;
  // Try to find a parent whose name + " " + sizeToken matches the child's name
  for (const sizeToken of child.sizes) {
    const stem = child.name.replace(new RegExp(`\\s+${sizeToken}\\s*$`, 'i'), '').trim();
    if (stem === child.name) continue; // size token isn't in the trailing position
    const key = `${child.brand.toLowerCase()}||${child.category}||${stem.toLowerCase()}`;
    const parent = byKey.get(key);
    if (parent && parent.id !== child.id && parent.sizes.some(s => s.toLowerCase() === sizeToken.toLowerCase())) {
      duplicates.push({ child, parent, sizeToken });
      break;
    }
  }
}

console.log(`Found ${duplicates.length} size-suffix duplicates`);
for (const d of duplicates.slice(0, 20)) {
  console.log(`  ${d.child.brand} | ${d.child.name} (id ${d.child.id.slice(0,8)}) → parent "${d.parent.name}" (size ${d.sizeToken})`);
}
if (duplicates.length > 20) console.log(`  …and ${duplicates.length - 20} more`);

if (!COMMIT) {
  console.log('\nDry run only. Add --commit to execute.');
  process.exit(0);
}

let updated = 0;
let deleted = 0;
for (const { child, parent } of duplicates) {
  // Union colors into parent (defensive — most should already be there)
  const cMap = new Map();
  for (const c of parent.colors || []) cMap.set(c.toLowerCase(), c);
  for (const c of child.colors || []) if (!cMap.has(c.toLowerCase())) cMap.set(c.toLowerCase(), c);
  const unionColors = [...cMap.values()];
  if (unionColors.length !== (parent.colors?.length || 0)) {
    await s.from('tying_materials').update({ colors: unionColors }).eq('id', parent.id);
    updated += 1;
  }
  // Re-point refs (currently zero)
  await s.from('fly_recipe_ingredients').update({ material_id: parent.id }).eq('material_id', child.id);
  await s.from('user_materials_inventory').update({ material_id: parent.id }).eq('material_id', child.id);
  await s.from('tying_materials').delete().eq('id', child.id);
  deleted += 1;
}

console.log(`\nDone. Parents updated: ${updated}. Children deleted: ${deleted}.`);
const { count } = await s.from('tying_materials').select('*', { count: 'exact', head: true });
console.log(`Final row count: ${count}`);
