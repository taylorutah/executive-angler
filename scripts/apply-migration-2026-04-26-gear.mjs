// One-off migration applier — applies 20260426_gear_catalog_full_categories.sql to Supabase.
// Reads SUPABASE_SERVICE_ROLE_KEY from env, uses it as the db password
// against the Supabase connection pooler.
import { readFileSync } from "node:fs";
import pg from "pg";

// Minimal .env.local parser — avoids a dotenv dep in a one-off script.
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

const { Client } = pg;
const sql = readFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/supabase/migrations/20260426_gear_catalog_full_categories.sql",
  "utf8"
);

const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!password) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const candidateHosts = [
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-0-us-west-2.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-us-east-2.pooler.supabase.com",
  "aws-0-ca-central-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-eu-west-2.pooler.supabase.com",
  "aws-0-eu-north-1.pooler.supabase.com",
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-ap-southeast-2.pooler.supabase.com",
  "aws-0-ap-northeast-1.pooler.supabase.com",
  "aws-0-ap-northeast-2.pooler.supabase.com",
  "aws-0-ap-south-1.pooler.supabase.com",
  "aws-0-sa-east-1.pooler.supabase.com",
];

async function tryApply(host) {
  const client = new Client({
    host,
    port: 6543,
    database: "postgres",
    user: "postgres.qlasxtfbodyxbcuchvxz",
    password,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`[OK] Connected to ${host}`);
  const res = await client.query(sql);
  console.log(
    "[OK] Migration applied. Statements returned:",
    Array.isArray(res) ? res.length : 1,
  );

  const check = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gear_products'
      AND column_name = 'variant_summary'
  `);
  console.log("[VERIFY] gear_products.variant_summary:", check.rows[0] || "(missing)");

  const constraintCheck = await client.query(`
    SELECT pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conname = 'gear_products_category_check'
  `);
  console.log("[VERIFY] category check:", constraintCheck.rows[0]?.pg_get_constraintdef);

  await client.end();
}

let applied = false;
for (const host of candidateHosts) {
  try {
    await tryApply(host);
    applied = true;
    break;
  } catch (err) {
    console.warn(`[SKIP] ${host} → code=${err.code} msg="${err.message}"`);
  }
}

if (!applied) {
  console.error("[FAIL] Could not apply migration via any pooler host");
  process.exit(2);
}
