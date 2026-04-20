import { readFileSync } from 'node:fs';
const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Query information_schema to find all array columns on fly_patterns
const { data, error } = await sb.rpc('exec_sql', {
  sql: "select column_name, data_type, udt_name from information_schema.columns where table_name = 'fly_patterns' order by column_name"
}).single();

// Fall back to manual probes since rpc may not exist
if (error) {
  console.log('rpc failed, trying direct probes...');
  // Probe each field by attempting to insert a string and seeing which fails
  const textFields = ['fly_color','bead_color','size','hook','bead_size','bead_material','body_color','body_material','tail_color','thorax_color','collar_color','rib_material','wing_material','materials','description','video_url','image_url','provenance_credit','type','name'];
  for (const f of textFields) {
    const row = { name: 'probe', user_id: '00000000-0000-0000-0000-000000000000', source: 'tied', visibility: 'private', [f]: 'Tan' };
    const { error: e } = await sb.from('fly_patterns').insert(row).select().single();
    if (e) {
      if (e.message?.includes('malformed array literal') || e.code === '22P02') {
        console.log(`❌ ${f}: ${e.message}`);
      } else if (e.message?.includes('violates foreign key')) {
        // fake user_id — normal, means field type was accepted
      } else {
        console.log(`? ${f}: ${e.message?.slice(0,80)} [${e.code}]`);
      }
    }
  }
}
