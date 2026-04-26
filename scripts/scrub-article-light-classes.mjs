// One-off: replace baked-in light-theme Tailwind classes inside articles.content
// with dark-mode arbitrary-value classes. Mirrors the find/replace already
// applied to src/data/articles.ts so live Supabase content matches.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envText = readFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/.env.local",
  "utf8"
);
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const replacements = [
  ["bg-slate-50",      "bg-[#161B22] border border-[#21262D]"],
  ["bg-amber-50",      "bg-[#1F1610]"],
  ["bg-red-100",       "bg-[#1F1115]"],
  ["border-slate-100", "border-[#21262D]"],
  ["border-amber-400", "border-[#E8923A]"],
  ["text-slate-600",   "text-[#D8DEE4]"],
  ["text-slate-700",   "text-[#D8DEE4]"],
  ["text-slate-800",   "text-[#F0F6FC]"],
  ["text-amber-700",   "text-[#F4B26B]"],
  ["text-amber-800",   "text-[#F8D7A8]"],
  ["text-red-600",     "text-[#FCA5A5]"],
];

const offendingPattern = /(bg-slate-50|bg-amber-50|bg-red-100|text-slate-[678]00|text-amber-[78]00|text-red-600|border-slate-100|border-amber-400)/g;

const { data: articles, error } = await supabase
  .from("articles")
  .select("id, slug, content")
  .order("slug");

if (error) {
  console.error("Fetch failed:", error);
  process.exit(1);
}

let totalArticlesUpdated = 0;
let totalHitsBefore = 0;
let totalHitsAfter = 0;
const perArticleSummary = [];

for (const a of articles) {
  if (!a.content) continue;
  const beforeHits = (a.content.match(offendingPattern) ?? []).length;
  totalHitsBefore += beforeHits;
  if (beforeHits === 0) {
    perArticleSummary.push({ slug: a.slug, before: 0, after: 0, changed: false });
    continue;
  }
  let next = a.content;
  for (const [oldCls, newCls] of replacements) {
    next = next.split(oldCls).join(newCls);
  }
  const afterHits = (next.match(offendingPattern) ?? []).length;
  totalHitsAfter += afterHits;

  const { error: updErr } = await supabase
    .from("articles")
    .update({ content: next })
    .eq("id", a.id);

  if (updErr) {
    console.error(`UPDATE failed for ${a.slug}:`, updErr);
    process.exit(1);
  }
  totalArticlesUpdated += 1;
  perArticleSummary.push({ slug: a.slug, before: beforeHits, after: afterHits, changed: true });
}

console.log(`\nProcessed ${articles.length} articles. Updated ${totalArticlesUpdated}.`);
console.log(`Total offending-class occurrences: ${totalHitsBefore} → ${totalHitsAfter}\n`);
for (const s of perArticleSummary) {
  if (s.changed) console.log(`  ${s.slug.padEnd(55)} ${String(s.before).padStart(4)} → ${s.after}`);
}
