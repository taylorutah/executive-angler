// Quick audit of tying_materials table — counts by category and brand
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local manually
try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const s = createClient(url, key);

const { count: total } = await s.from('tying_materials').select('*', { count: 'exact', head: true });
console.log(`TOTAL MATERIALS: ${total}\n`);

const { data: all } = await s.from('tying_materials').select('category, brand');

const byCat = {};
const byBrand = {};
for (const m of all || []) {
  byCat[m.category] = (byCat[m.category] || 0) + 1;
  const b = m.brand || '(none)';
  byBrand[b] = (byBrand[b] || 0) + 1;
}

console.log('BY CATEGORY:');
for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(15)} ${v}`);
}

console.log('\nBY BRAND:');
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(30)} ${v}`);
}
