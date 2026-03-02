/**
 * Executive Angler — Supabase Seeding Script (Text IDs)
 *
 * Seeds all content from src/data/*.ts into Supabase with text primary keys.
 * Requires the migration-text-ids.sql to have been run first.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx npm run seed:supabase
 */

import { createClient } from "@supabase/supabase-js";
import { destinations } from "../src/data/destinations";
import { rivers } from "../src/data/rivers";
import { lodges } from "../src/data/lodges";
import { guides } from "../src/data/guides";
import { flyShops } from "../src/data/fly-shops";
import { articles } from "../src/data/articles";
import { species } from "../src/data/species";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Convert camelCase key to snake_case */
function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** Shallow transform object keys from camelCase to snake_case */
function keysToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toSnake(key)] = value;
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
  const start = Date.now();

  console.log(`  ${tableName}: upserting ${rows.length} records...`);

  const batchSize = 50;
  let upsertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: conflictColumn });

    if (error) {
      errorCount += batch.length;
      console.error(
        `    ${tableName} batch ${Math.floor(i / batchSize) + 1} error:`,
        error.message
      );
      if (error.details) console.error("    Details:", error.details);
    } else {
      upsertedCount += batch.length;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  if (errorCount > 0) {
    console.log(
      `    ${tableName}: ${upsertedCount}/${rows.length} upserted, ${errorCount} errors (${elapsed}s)`
    );
  } else {
    console.log(
      `    ${tableName}: ${upsertedCount}/${rows.length} upserted (${elapsed}s)`
    );
  }
}

async function main() {
  console.log("Executive Angler — Seeding Supabase (text IDs)\n");
  console.log(`  URL: ${supabaseUrl}`);
  console.log(
    `  Tables: destinations, rivers, lodges, guides, fly_shops, species, articles\n`
  );

  const start = Date.now();

  // Seed in FK dependency order
  await upsertTable("destinations", destinations);
  await upsertTable("rivers", rivers);
  await upsertTable("lodges", lodges);
  await upsertTable("guides", guides);
  await upsertTable("fly_shops", flyShops);
  await upsertTable("species", species);
  await upsertTable("articles", articles);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nSeeding complete in ${elapsed}s`);
  console.log(
    `  Total: ${destinations.length} destinations, ${rivers.length} rivers, ${lodges.length} lodges, ${guides.length} guides, ${flyShops.length} fly shops, ${species.length} species, ${articles.length} articles`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
