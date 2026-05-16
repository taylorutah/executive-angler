/**
 * Audit canonical flies with empty `materials_list`. Prints slug / name /
 * category for each so they can be filled in via /admin/flies/<slug>/edit.
 *
 * Run: npx tsx scripts/audit-empty-materials.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in env (same key used by other seed
 * scripts).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Inline .env.local loader (avoids dotenv dep — matches scripts/apply-migration-*.mjs)
try {
  const envText = readFileSync(".env.local", "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* fall through — env may already be set */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("flies")
    .select("slug, name, category, materials_list, status")
    .eq("status", "approved")
    .order("name");
  if (error) {
    console.error("Query failed:", error);
    process.exit(1);
  }
  const rows = data ?? [];
  const empty = rows.filter(
    (r) => !Array.isArray(r.materials_list) || r.materials_list.length === 0,
  );
  console.log(
    `\n${empty.length}/${rows.length} approved flies have empty materials_list:\n`,
  );
  for (const r of empty) {
    const cat = r.category ?? "—";
    console.log(`  ${r.slug.padEnd(40)}  ${cat.padEnd(12)}  ${r.name}`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
