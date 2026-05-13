import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

async function main() {
  const { data: cf } = await sb
    .from("canonical_flies")
    .select("id, slug, name, category, origin_credit, description, history, materials_list, hero_image_url, contributed_by_user_id, created_at")
    .eq("slug", "soft-hackle-hares-ear")
    .single();
  console.log("=== canonical_flies row ===");
  console.log(JSON.stringify(cf, null, 2));

  if (cf?.id) {
    const { data: pv } = await sb
      .from("fly_patterns_v2")
      .select("id, slug, name, category, origin_credit, base_materials, owner_user_id")
      .eq("id", cf.id)
      .maybeSingle();
    console.log("\n=== fly_patterns_v2 row ===");
    console.log(JSON.stringify(pv, null, 2));

    const { data: variants } = await sb
      .from("fly_variants")
      .select("id, size, bead_material, bead_weight_mm, bead_color, hook_style, is_default_for_pattern, created_by_user_id")
      .eq("pattern_id", cf.id);
    console.log("\n=== fly_variants ===");
    console.log(JSON.stringify(variants, null, 2));
  }
}
main();
