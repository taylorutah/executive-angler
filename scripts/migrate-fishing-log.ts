/**
 * Executive Angler — Fishing Log Migration
 *
 * Outputs the SQL migration for the fishing log feature.
 * The SQL file can be run in Supabase SQL Editor.
 *
 * Usage:
 *   npm run fishing:migrate
 */

import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🐟 Executive Angler — Fishing Log Migration\n");

  const sqlPath = join(process.cwd(), "supabase/migrations/fishing-log-schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("📄 SQL Migration file location:");
  console.log(`   ${sqlPath}\n`);

  console.log("📋 To run this migration:");
  console.log("   1. Open Supabase Dashboard → SQL Editor");
  console.log("   2. Copy the contents of fishing-log-schema.sql");
  console.log("   3. Paste and run in SQL Editor\n");

  console.log("   OR copy-paste this SQL:\n");
  console.log("=" .repeat(80));
  console.log(sql);
  console.log("=" .repeat(80));

  console.log("\n✅ Migration SQL ready");
  console.log("   Tables to be created:");
  console.log("   - fly_patterns");
  console.log("   - fishing_sessions");
  console.log("   - session_rigs");
  console.log("   - catches");
  console.log("   - fishing_spots");
  console.log("   - angler_profiles");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
