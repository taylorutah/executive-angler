// One-off migration applier — applies 20260420_fly_workbench_foundation.sql to Supabase.
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
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/supabase/migrations/20260420_fly_workbench_foundation.sql",
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
  console.log("[OK] Migration applied. Statements returned:", Array.isArray(res) ? res.length : 1);

  // Verify key new columns exist
  const check = await client.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'fly_patterns' AND column_name IN ('parent_pattern_id', 'visibility', 'tie_next_status', 'my_tied_fly_photo_url', 'vise_time_minutes', 'provenance_credit'))
        OR (table_name = 'user_fly_box' AND column_name IN ('tie_next_status', 'quantity_by_size'))
        OR (table_name = 'profiles' AND column_name = 'ties_own_flies')
      )
    ORDER BY table_name, column_name
  `);
  console.log("[VERIFY] New columns present:");
  for (const row of check.rows) console.log(`  ${row.table_name}.${row.column_name}`);

  const enumCheck = await client.query(`
    SELECT typname FROM pg_type WHERE typname IN ('fly_visibility', 'tie_next_status')
  `);
  console.log("[VERIFY] Enums present:", enumCheck.rows.map((r) => r.typname).join(", "));

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
