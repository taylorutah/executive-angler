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

function lev(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

async function main() {
  const PROPOSED = "Soft Hackle Hare's Ear";
  const slug = PROPOSED.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

  console.log("=== SLUG CHECK ===");
  const { data: slugHit } = await sb
    .from("canonical_flies")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();
  console.log("slug:", slug, "→", slugHit ? `EXISTS (${slugHit.id})` : "available");

  console.log("\n=== NEAR-DUP CHECK ===");
  const { data: all } = await sb.from("canonical_flies").select("slug, name");
  const ranked = (all ?? [])
    .map((r) => ({ ...r, d: lev(r.name.toLowerCase(), PROPOSED.toLowerCase()) }))
    .filter((r) => r.d <= 8)
    .sort((a, b) => a.d - b.d)
    .slice(0, 10);
  for (const r of ranked) console.log(`  d=${r.d}  ${r.name}  (${r.slug})`);

  console.log("\n=== MATERIAL CHECK ===");
  const matQueries = [
    { label: "Hanak 450", q: "Hanak" },
    { label: "Uni-thread 8/0 rusty dun", q: "Uni-thread" },
    { label: "Troutline Mad Rabbit Dubbing", q: "Mad Rabbit" },
    { label: "Troutline (brand)", q: "Troutline" },
    { label: "Hends Spectra Dubbing", q: "Spectra" },
    { label: "Hends (brand)", q: "Hends" },
    { label: "copper wire", q: "copper wire" },
    { label: "CDC", q: "CDC" },
    { label: "Bead pink tungsten", q: "Pink" },
  ];
  for (const m of matQueries) {
    const { data } = await sb
      .from("tying_materials")
      .select("name, brand, category, sizes, colors, material_type")
      .ilike("name", `%${m.q}%`)
      .limit(5);
    console.log(`\n  ${m.label}:`);
    if (!data || data.length === 0) console.log("    ❌ none");
    else for (const r of data) console.log(`    ✓ ${r.brand ?? ""} ${r.name} [${r.category}] sizes=${JSON.stringify(r.sizes)} colors=${JSON.stringify(r.colors)}`);
  }
}
main();
