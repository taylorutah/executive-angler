import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Inspect the columns actually on fly_patterns via a sample row
const { data: sample } = await sb.from('fly_patterns').select('*').limit(1);
console.log('fly_patterns columns:', Object.keys(sample?.[0] || {}).sort().join(', '));
console.log();
console.log('Sample row sample values (first row):');
if (sample?.[0]) {
  for (const [k, v] of Object.entries(sample[0])) {
    const type = Array.isArray(v) ? 'array' : typeof v;
    console.log(`  ${k}: ${type} = ${JSON.stringify(v)?.slice(0,60)}`);
  }
}

console.log('\n=== Walt\'s Worm canonical row ===');
const { data: walt } = await sb.from('canonical_flies').select('id, slug, name, colors, sizes, bead_options, tags, imitates, water_types, hook_styles').eq('slug', 'walt-s-worm').maybeSingle();
console.log(walt);
