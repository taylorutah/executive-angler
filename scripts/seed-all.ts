/**
 * Executive Angler — Supabase Seeding Script
 *
 * Reads from src/data/*.ts, transforms camelCase → snake_case,
 * and upserts to Supabase using the service role key.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx npm run seed
 *
 * Environment variables (required):
 *   NEXT_PUBLIC_SUPABASE_URL  — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";
import { destinations } from "../src/data/destinations";
import { rivers } from "../src/data/rivers";
import { lodges } from "../src/data/lodges";
import { guides } from "../src/data/guides";
import { flyShops } from "../src/data/fly-shops";
import { articles } from "../src/data/articles";
import { species } from "../src/data/species";

// ---------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert camelCase key to snake_case */
function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** Deep-transform object keys from camelCase to snake_case */
function keysToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnake(key);
    // Don't recurse into arrays or nested objects that are stored as jsonb
    result[snakeKey] = value;
  }
  return result;
}

/** Upsert a batch of records into a table */
async function upsertTable(
  tableName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  conflictColumn: string = "slug"
) {
  const rows = data.map((item) => keysToSnake(item as Record<string, unknown>));

  console.log(`  → ${tableName}: upserting ${rows.length} records...`);

  // Upsert in batches of 50 to avoid payload limits
  const batchSize = 50;
  let upsertedCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: conflictColumn });

    if (error) {
      console.error(`  ❌ ${tableName} batch ${i / batchSize + 1} error:`, error.message);
      if (error.details) console.error("     Details:", error.details);
      // Continue with next batch
    } else {
      upsertedCount += batch.length;
    }
  }

  console.log(`  ✅ ${tableName}: ${upsertedCount}/${rows.length} upserted`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🐟 Executive Angler — Seeding Supabase\n");
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Tables: destinations, rivers, lodges, guides, fly_shops, articles, species\n`);

  const start = Date.now();

  // Seed in order (respecting foreign key relationships)
  await upsertTable("destinations", destinations);
  await upsertTable("rivers", rivers);
  await upsertTable("lodges", lodges);
  await upsertTable("guides", guides);
  await upsertTable("fly_shops", flyShops);
  await upsertTable("articles", articles);
  await upsertTable("species", species);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🎣 Seeding complete in ${elapsed}s`);
  console.log(
    `   Total: ${destinations.length} destinations, ${rivers.length} rivers, ${lodges.length} lodges, ${guides.length} guides, ${flyShops.length} fly shops, ${articles.length} articles, ${species.length} species`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
