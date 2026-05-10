// Execute the materials consolidation directly via the Supabase JS client.
// Pulls the live data, computes the consolidation map (matching the SQL
// generator's logic), and runs UPDATE/DELETE operations cluster-by-cluster.
//
// Usage:
//   node scripts/run-consolidate-materials.mjs --dry-run   (default; no writes)
//   node scripts/run-consolidate-materials.mjs --commit    (executes writes)

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
console.log(COMMIT ? '⚠ COMMIT MODE — writes will be executed' : 'DRY RUN (use --commit to execute)');

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Paginate
const materials = [];
for (let offset = 0; ; offset += 1000) {
  const { data, error } = await s
    .from('tying_materials')
    .select('id, name, brand, category, sizes, colors, weight, popularity, created_at')
    .order('id')
    .range(offset, offset + 999);
  if (error) throw error;
  if (!data?.length) break;
  materials.push(...data);
  if (data.length < 1000) break;
}
console.log(`Loaded ${materials.length} materials`);

function stripColorSuffix(name, color) {
  if (!name || !color) return name;
  const lower = name.toLowerCase();
  const c = color.toLowerCase().trim();
  if (lower.endsWith(c)) {
    return name.slice(0, name.length - c.length).trim().replace(/[-,\s]+$/, '');
  }
  return name;
}

function normalizeStem(stem, brand) {
  if (!brand) return stem;
  const b = brand.toLowerCase();
  const s = stem.toLowerCase();
  if (s.startsWith(b + ' ')) return stem.slice(brand.length + 1).trim();
  return stem;
}

const clusters = new Map();
for (const m of materials) {
  const colors = Array.isArray(m.colors) ? m.colors : [];
  const isExploded = colors.length === 1;
  const extractedColor = isExploded ? colors[0] : '';
  let stem = isExploded ? stripColorSuffix(m.name, extractedColor) : m.name;
  stem = normalizeStem(stem, m.brand);
  const key = [
    m.category || '',
    (m.brand || '').toLowerCase(),
    stem.toLowerCase(),
    (m.weight || '').toLowerCase(),
  ].join('||');
  if (!clusters.has(key)) clusters.set(key, []);
  clusters.get(key).push({ ...m, _stem: stem, _isExploded: isExploded });
}

const dupClusters = [...clusters.entries()].filter(([, rows]) => rows.length > 1);
console.log(`Duplicate clusters: ${dupClusters.length}`);

let processedClusters = 0;
let updatedSurvivors = 0;
let deletedLosers = 0;
let errors = 0;

for (const [key, rows] of dupClusters) {
  const sorted = [...rows].sort((a, b) => {
    const aMulti = (a.colors?.length || 0) > 1 ? 1 : 0;
    const bMulti = (b.colors?.length || 0) > 1 ? 1 : 0;
    if (aMulti !== bMulti) return bMulti - aMulti;
    if ((b.popularity || 0) !== (a.popularity || 0)) return (b.popularity || 0) - (a.popularity || 0);
    return (a.created_at || '').localeCompare(b.created_at || '');
  });
  const survivor = sorted[0];
  const losers = sorted.slice(1);

  const colorMap = new Map();
  for (const r of rows) for (const c of r.colors || []) {
    if (!colorMap.has(c.toLowerCase())) colorMap.set(c.toLowerCase(), c);
  }
  const unionColors = [...colorMap.values()];

  const sizeMap = new Map();
  for (const r of rows) for (const sz of r.sizes || []) {
    if (!sizeMap.has(sz.toLowerCase())) sizeMap.set(sz.toLowerCase(), sz);
  }
  const unionSizes = [...sizeMap.values()];

  const cleanName = survivor._isExploded ? survivor._stem : survivor.name;

  if (!COMMIT) {
    processedClusters += 1;
    if (processedClusters <= 3) {
      console.log(`\n  [DRY] ${key}`);
      console.log(`    survivor → name="${cleanName}", ${unionColors.length} colors, ${unionSizes.length} sizes`);
      console.log(`    delete ${losers.length} rows`);
    }
    continue;
  }

  // 1. Update survivor
  const { error: updErr } = await s
    .from('tying_materials')
    .update({
      name: cleanName,
      colors: unionColors,
      sizes: unionSizes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', survivor.id);
  if (updErr) {
    console.error(`  ✗ update survivor ${survivor.id} failed:`, updErr.message);
    errors += 1;
    continue;
  }
  updatedSurvivors += 1;

  if (losers.length > 0) {
    const loserIds = losers.map((l) => l.id);

    // 2. Re-point recipe ingredients (if any)
    const { error: recErr } = await s
      .from('fly_recipe_ingredients')
      .update({ material_id: survivor.id })
      .in('material_id', loserIds);
    if (recErr) console.error(`  ! recipe re-point warning:`, recErr.message);

    // 3. Re-point inventory (if any)
    const { error: invErr } = await s
      .from('user_materials_inventory')
      .update({ material_id: survivor.id })
      .in('material_id', loserIds);
    if (invErr) console.error(`  ! inventory re-point warning:`, invErr.message);

    // 4. Delete losers
    const { error: delErr } = await s
      .from('tying_materials')
      .delete()
      .in('id', loserIds);
    if (delErr) {
      console.error(`  ✗ delete losers failed:`, delErr.message);
      errors += 1;
      continue;
    }
    deletedLosers += losers.length;
  }

  processedClusters += 1;
  if (processedClusters % 25 === 0) {
    console.log(`  …${processedClusters}/${dupClusters.length} clusters processed`);
  }
}

console.log(`\nDone. ${COMMIT ? 'WRITES EXECUTED' : 'DRY RUN'}`);
console.log(`  Clusters processed: ${processedClusters}/${dupClusters.length}`);
console.log(`  Survivors updated:  ${updatedSurvivors}`);
console.log(`  Losers deleted:     ${deletedLosers}`);
if (errors > 0) console.log(`  Errors: ${errors}`);

const { count: finalCount } = await s
  .from('tying_materials')
  .select('*', { count: 'exact', head: true });
console.log(`  Final tying_materials row count: ${finalCount}`);
