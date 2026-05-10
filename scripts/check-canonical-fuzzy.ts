import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const queries = [
  "Pheasant",
  "Hare",
  "Sparkle Dun",
  "Purple Haze",
  "Sculpin",
  "Silver Bullet",
  "France Fly",
  "Sexy Walt",
  "Eggstasy",
  "Jack Daniel",
  "Stone Pony",
  "Missing Link",
  "Lite Bright",
  "Fluorescent",
  "CDC Pheasant Tail",
];

async function main() {
  for (const q of queries) {
    const { data } = await sb
      .from("canonical_flies")
      .select("slug, name, category")
      .ilike("name", `%${q}%`);
    console.log(`\n"${q}" → ${data?.length ?? 0} canonical match(es):`);
    for (const r of data ?? []) console.log(`  • ${r.name}  [${r.slug}, ${r.category ?? "?"}]`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
