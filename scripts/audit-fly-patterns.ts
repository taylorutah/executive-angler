import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key);

async function main() {
  const { data: patterns, error: pErr } = await sb
    .from("fly_patterns")
    .select("id, name, type, size, source, visibility, parent_canonical_id, has_structured_recipe, image_url, slug, user_id, created_at")
    .order("created_at", { ascending: true });
  if (pErr) throw pErr;

  const { data: canonical, error: cErr } = await sb
    .from("canonical_flies")
    .select("slug, name");
  if (cErr) throw cErr;

  const canonicalNames = new Set(canonical?.map((c) => c.name.toLowerCase()) ?? []);
  const canonicalSlugs = new Set(canonical?.map((c) => c.slug) ?? []);

  console.log(`\n=== Canonical library: ${canonical?.length ?? 0} flies ===`);
  console.log(`\n=== Personal fly_patterns: ${patterns?.length ?? 0} rows ===\n`);

  if (!patterns) return;

  for (const p of patterns) {
    const dupName = canonicalNames.has((p.name ?? "").toLowerCase());
    const dupSlug = p.slug && canonicalSlugs.has(p.slug);
    const overlap = dupName || dupSlug;
    const fork = !!p.parent_canonical_id;
    const hasImage = !!p.image_url;
    const hasRecipe = !!p.has_structured_recipe;

    console.log(
      [
        `• ${p.name}`,
        `  type=${p.type ?? "?"} size=${p.size ?? "?"} source=${p.source ?? "?"} visibility=${p.visibility ?? "?"}`,
        `  fork=${fork ? "YES (canonical_id=" + p.parent_canonical_id + ")" : "no"}  recipe=${hasRecipe ? "structured" : "text/none"}  image=${hasImage ? "yes" : "no"}`,
        `  overlap_with_library=${overlap ? "YES (already in canonical)" : "no"}`,
        `  created=${p.created_at}`,
      ].join("\n")
    );
    console.log("");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
