// One-off applier for 20260420_flatten_fly_patterns_colors.sql.
// Mirrors scripts/apply-migration-2026-04-19.mjs pooler-region sweep.
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
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/supabase/migrations/20260420_flatten_fly_patterns_colors.sql",
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
  await client.query(sql);
  console.log("[OK] Migration applied.");

  const check = await client.query(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'fly_patterns' AND column_name IN ('fly_color', 'bead_color')"
  );
  console.log("[VERIFY] column types:");
  for (const r of check.rows) {
    console.log(`  ${r.column_name}: data_type=${r.data_type} udt=${r.udt_name}`);
  }
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
