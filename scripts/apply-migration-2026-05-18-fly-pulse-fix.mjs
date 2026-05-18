// Apply 20260518_river_fly_pulse_fix.sql via the Supabase pooler.
import { readFileSync } from "node:fs";
import pg from "pg";

const envText = readFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/.env.local",
  "utf8",
);
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const { Client } = pg;
const sql = readFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/supabase/migrations/20260518_river_fly_pulse_fix.sql",
  "utf8",
);

const dbPassword =
  process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dbPassword) {
  console.error("Missing SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY");
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
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`[OK] Connected to ${host}`);
  await client.query(sql);
  console.log("[OK] Migration applied.");

  const check = await client.query(
    `SELECT * FROM public.river_fly_pulse('provo-river')`,
  );
  console.log(`[VERIFY] river_fly_pulse('provo-river') → ${check.rows.length} rows`);
  for (const row of check.rows) {
    console.log(`  - ${row.fly_name} (sizes: ${(row.sizes || []).join(", ") || "—"})`);
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
  console.error(
    "Run manually via the Supabase dashboard SQL editor:",
  );
  console.error(
    "  supabase/migrations/20260518_river_fly_pulse_fix.sql",
  );
  process.exit(2);
}
