import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
try {
  const c = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const l of c.split("\n")) {
    const t = l.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
(async () => {
  // Check all canonical_flies and fly_patterns_v2 rows mentioning fluorescent or perdigon
  const cf = await sb
    .from("canonical_flies")
    .select("id, slug, name, created_at")
    .or("name.ilike.%fluorescent%,name.ilike.%surprise%,slug.ilike.%fluorescent%");
  console.log("canonical_flies matches:", JSON.stringify(cf.data, null, 2));

  const pv2 = await sb
    .from("fly_patterns_v2")
    .select("id, slug, name, owner_user_id, created_at")
    .or("name.ilike.%fluorescent%,name.ilike.%surprise%,slug.ilike.%fluorescent%");
  console.log("fly_patterns_v2 matches:", JSON.stringify(pv2.data, null, 2));

  // Original source pattern
  const src = await sb
    .from("fly_patterns")
    .select("id, name, slug, promoted_to_canonical_id")
    .eq("id", "6c99ffb4-ce3f-4fe6-b1cf-f072b9758e96")
    .maybeSingle();
  console.log("source personal pattern:", JSON.stringify(src.data, null, 2));
})();
