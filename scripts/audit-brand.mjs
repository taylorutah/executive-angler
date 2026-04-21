// Audit materials for a specific brand (arg) — show name, subcategory, colors count
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const brands = process.argv.slice(2);
if (brands.length === 0) {
  console.log('Usage: node scripts/audit-brand.mjs <brand> [<brand>...]');
  process.exit(1);
}

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
for (const brand of brands) {
  const { data } = await s.from('tying_materials').select('slug,name,category,subcategory,sizes,colors,weight').ilike('brand', `%${brand}%`).order('name');
  console.log(`\n=== ${brand}: ${data?.length || 0} items ===`);
  for (const m of data || []) {
    const sz = m.sizes?.length ? `sz=[${m.sizes.join(',')}]` : '';
    const co = m.colors?.length ? `colors=${m.colors.length}` : 'colors=0';
    console.log(`  ${m.name.padEnd(40)} ${(m.subcategory||'').padEnd(12)} ${m.weight||''} ${sz} ${co}`);
  }
}
