import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb.from('tying_materials').select('*').limit(3);
console.log('Sample row keys:', Object.keys(data?.[0] || {}));
console.log('Sample rows:');
(data || []).forEach((r, i) => console.log(`--- Row ${i+1} ---`, JSON.stringify(r, null, 2)));
const { data: cats } = await sb.from('tying_materials').select('category');
const uniq = [...new Set((cats || []).map(c => c.category))].sort();
console.log('\nDistinct categories:', uniq);
const { data: brands } = await sb.from('tying_materials').select('brand');
const uniqB = [...new Set((brands || []).map(c => c.brand))].sort();
console.log('Distinct brands:', uniqB);
const { count } = await sb.from('tying_materials').select('*', { count: 'exact', head: true });
console.log('Total materials:', count);
