import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb.from('canonical_flies').select('*').ilike('name', '%walt%');
for (const r of data || []) {
  console.log('=== ', r.slug, ' ===');
  for (const [k,v] of Object.entries(r)) {
    const sval = JSON.stringify(v);
    if (sval && sval !== 'null' && sval !== '""' && sval !== '[]' && sval.length < 300) {
      console.log(`  ${k}: ${Array.isArray(v) ? 'ARR' : typeof v} = ${sval}`);
    }
  }
  console.log();
}
