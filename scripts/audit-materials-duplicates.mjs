// Audit tying_materials for "exploded" duplicate rows that should collapse
// into a single product row with colors[] / sizes[] arrays.
//
// Heuristic: a row is "exploded" when colors[] has exactly one element AND
// that color appears as a trailing token in `name`. We strip it and cluster
// by (category, brand, name-stem, weight). Clusters with >1 row are
// candidates for consolidation.
//
// Output:
//   - stdout summary (clusters per category, top offenders)
//   - CSV at scripts/audit-output/materials-duplicates.csv with the full
//     consolidation map for review.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const s = createClient(url, key);

// Paginate — Supabase defaults to 1000 row cap per request.
const materials = [];
const PAGE = 1000;
for (let offset = 0; ; offset += PAGE) {
  const { data, error } = await s
    .from('tying_materials')
    .select('id, slug, name, brand, category, subcategory, sizes, colors, material_type, weight, finish, popularity, created_at')
    .order('id')
    .range(offset, offset + PAGE - 1);
  if (error) {
    console.error('Query failed:', error);
    process.exit(1);
  }
  if (!data || data.length === 0) break;
  materials.push(...data);
  if (data.length < PAGE) break;
}

console.log(`Loaded ${materials.length} materials\n`);

// Strip a trailing color token from a name. Handles "Ultra Thread 70 Black" →
// "Ultra Thread 70", "Ice Dub Peacock" → "Ice Dub", "Nano Silk 18/0 Fluorescent Pink"
// → "Nano Silk 18/0". The color may be 1-3 tokens to handle compound colors
// like "hot orange" or "fluorescent pink".
function stripColorSuffix(name, color) {
  if (!name || !color) return name;
  const lower = name.toLowerCase();
  const c = color.toLowerCase().trim();
  if (lower.endsWith(c)) {
    return name.slice(0, name.length - c.length).trim().replace(/[-,\s]+$/, '');
  }
  return name;
}

// Bucket key for clustering: category + brand + name-stem + weight.
// Sizes are intentionally NOT in the key — different deniers/weights are
// different products even at the same brand, but different sizes within
// one weight are NOT (e.g. a hook in #14 vs #16 is one product row with
// sizes=['14','16'], not two rows).
function clusterKey(m, stem) {
  return [
    m.category || '',
    (m.brand || '').toLowerCase(),
    stem.toLowerCase(),
    (m.weight || '').toLowerCase(),
  ].join('||');
}

const clusters = new Map();
const passthroughs = []; // rows with multi-color arrays — already consolidated

for (const m of materials) {
  const colors = Array.isArray(m.colors) ? m.colors : [];
  const isExploded = colors.length === 1;

  let stem = m.name;
  let extractedColor = '';
  if (isExploded) {
    extractedColor = colors[0];
    stem = stripColorSuffix(m.name, extractedColor);
  }

  const key = clusterKey(m, stem);
  if (!clusters.has(key)) clusters.set(key, []);
  clusters.get(key).push({ ...m, _stem: stem, _extractedColor: extractedColor, _isExploded: isExploded });

  if (!isExploded) passthroughs.push(m);
}

// Clusters with >1 row are duplicates to consolidate.
const duplicates = [...clusters.entries()]
  .filter(([, rows]) => rows.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Total clusters: ${clusters.size}`);
console.log(`Clusters with duplicates: ${duplicates.length}`);
console.log(`Rows in duplicate clusters: ${duplicates.reduce((sum, [, r]) => sum + r.length, 0)}`);
console.log(`Already-consolidated rows (multi-color arrays): ${passthroughs.length}\n`);

// Top offenders by cluster size
console.log('TOP 20 DUPLICATE CLUSTERS:');
console.log('size | category | brand | stem | weight');
console.log('-----|----------|-------|------|-------');
for (const [key, rows] of duplicates.slice(0, 20)) {
  const r = rows[0];
  console.log(
    `  ${String(rows.length).padStart(2)} | ${(r.category || '').padEnd(8)} | ${(r.brand || '').padEnd(12)} | ${r._stem.padEnd(40)} | ${r.weight || ''}`
  );
}

// Breakdown by category
const byCategory = new Map();
for (const [key, rows] of duplicates) {
  const cat = rows[0].category;
  if (!byCategory.has(cat)) byCategory.set(cat, { clusters: 0, rows: 0 });
  byCategory.get(cat).clusters += 1;
  byCategory.get(cat).rows += rows.length;
}
console.log('\nBY CATEGORY:');
console.log('category | dup-clusters | exploded-rows | → after-consolidation');
console.log('---------|--------------|---------------|----------------------');
for (const [cat, stats] of [...byCategory.entries()].sort((a, b) => b[1].rows - a[1].rows)) {
  console.log(`  ${cat.padEnd(8)} | ${String(stats.clusters).padStart(12)} | ${String(stats.rows).padStart(13)} | ${stats.clusters}`);
}

// Cross-reference: are these rows actually used?
const allOldIds = new Set();
for (const [, rows] of duplicates) for (const r of rows) allOldIds.add(r.id);

const { data: recipeRefs } = await s
  .from('fly_recipe_ingredients')
  .select('id, material_id')
  .in('material_id', [...allOldIds]);
const { data: invRefs } = await s
  .from('user_materials_inventory')
  .select('id, material_id')
  .in('material_id', [...allOldIds]);

const recipeRefCount = new Map();
for (const r of recipeRefs || []) {
  recipeRefCount.set(r.material_id, (recipeRefCount.get(r.material_id) || 0) + 1);
}
const invRefCount = new Map();
for (const r of invRefs || []) {
  invRefCount.set(r.material_id, (invRefCount.get(r.material_id) || 0) + 1);
}

console.log(`\nReferences from fly_recipe_ingredients: ${recipeRefs?.length || 0}`);
console.log(`References from user_materials_inventory: ${invRefs?.length || 0}\n`);

// Write CSV
mkdirSync('scripts/audit-output', { recursive: true });
const rows = [
  'cluster_key,survivor_id,survivor_name,old_id,old_name,brand,category,weight,extracted_color,extracted_sizes,recipe_refs,inventory_refs',
];
for (const [key, rs] of duplicates) {
  // Survivor priority:
  //   1. row that is already consolidated (colors[].length > 1)
  //   2. highest popularity
  //   3. earliest created_at
  const sorted = [...rs].sort((a, b) => {
    const aMulti = (a.colors?.length || 0) > 1 ? 1 : 0;
    const bMulti = (b.colors?.length || 0) > 1 ? 1 : 0;
    if (aMulti !== bMulti) return bMulti - aMulti;
    if ((b.popularity || 0) !== (a.popularity || 0)) return (b.popularity || 0) - (a.popularity || 0);
    return (a.created_at || '').localeCompare(b.created_at || '');
  });
  const survivor = sorted[0];
  for (const r of rs) {
    rows.push(
      [
        JSON.stringify(key),
        survivor.id,
        JSON.stringify(survivor._stem),
        r.id,
        JSON.stringify(r.name),
        r.brand || '',
        r.category || '',
        JSON.stringify(r.weight || ''),
        JSON.stringify(r._extractedColor || ''),
        JSON.stringify((r.sizes || []).join('|')),
        recipeRefCount.get(r.id) || 0,
        invRefCount.get(r.id) || 0,
      ].join(',')
    );
  }
}

const csvPath = 'scripts/audit-output/materials-duplicates.csv';
writeFileSync(csvPath, rows.join('\n'));
console.log(`Wrote ${rows.length - 1} rows to ${csvPath}`);

// Sample dump: 5 clusters in full detail for spot-check
console.log('\nSAMPLE CLUSTERS (first 5):');
for (const [key, rs] of duplicates.slice(0, 5)) {
  console.log(`\n  ${key}`);
  for (const r of rs) {
    console.log(`    ${r.id}  ${r.name.padEnd(40)} colors=${JSON.stringify(r.colors)} sizes=${JSON.stringify(r.sizes)} refs=r${recipeRefCount.get(r.id) || 0}/i${invRefCount.get(r.id) || 0}`);
  }
}
