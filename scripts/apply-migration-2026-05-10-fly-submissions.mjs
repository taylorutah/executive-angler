// Apply migration: fly_pattern_submissions + submission_rate_limits.
import { readFileSync } from "node:fs";
import pg from "pg";

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
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/supabase/migrations/20260510_fly_pattern_submissions.sql",
  "utf8"
);

const password = process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const candidateHosts = [
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-0-us-west-2.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-us-east-2.pooler.supabase.com",
  "aws-0-ca-central-1.pooler.supabase.com",
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
  await client.query(sql);
  console.log("[OK] Migration applied.");

  const check = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('fly_pattern_submissions', 'submission_rate_limits')
  `);
  console.log("[VERIFY] new tables present:");
  for (const r of check.rows) console.log(`  - ${r.table_name}`);

  const col = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fly_patterns'
      AND column_name = 'promoted_to_canonical_id'
  `);
  console.log("[VERIFY] fly_patterns.promoted_to_canonical_id:");
  for (const r of col.rows) console.log(`  - ${r.column_name}`);

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
  console.error(
    "[FAIL] Could not apply migration via any pooler host. " +
      "Apply manually: paste supabase/migrations/20260510_fly_pattern_submissions.sql into the Supabase SQL editor."
  );
  process.exit(2);
}
