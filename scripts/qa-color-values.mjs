import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, count } = await sb.from('fly_patterns').select('id, name, fly_color, bead_color', { count: 'exact' }).or('fly_color.not.is.null,bead_color.not.is.null').limit(20);
console.log(`Rows with fly_color or bead_color set (sample 20 of ${count}):`);
for (const r of data || []) {
  console.log(`  ${r.name?.slice(0,40).padEnd(40)} fly_color=${JSON.stringify(r.fly_color)} bead_color=${JSON.stringify(r.bead_color)}`);
}
