// Apply 20260521e_river_fly_pulse_exclude_demo.sql and
// 20260521f_purge_existing_demo_rows.sql via the Supabase pooler.
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

const migrations = [
  "supabase/migrations/20260521e_river_fly_pulse_exclude_demo.sql",
  "supabase/migrations/20260521f_purge_existing_demo_rows.sql",
];

const root = "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/";

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

  const before = await client.query(
    `SELECT
       (SELECT COUNT(*) FROM public.fishing_sessions WHERE is_demo = true) AS demo_sessions,
       (SELECT COUNT(*) FROM public.catches          WHERE is_demo = true) AS demo_catches`,
  );
  console.log(
    `[BEFORE] demo_sessions=${before.rows[0].demo_sessions} demo_catches=${before.rows[0].demo_catches}`,
  );

  for (const mig of migrations) {
    const sql = readFileSync(root + mig, "utf8");
    await client.query(sql);
    console.log(`[OK] Applied ${mig}`);
  }

  const after = await client.query(
    `SELECT
       (SELECT COUNT(*) FROM public.fishing_sessions WHERE is_demo = true) AS demo_sessions,
       (SELECT COUNT(*) FROM public.catches          WHERE is_demo = true) AS demo_catches`,
  );
  console.log(
    `[AFTER]  demo_sessions=${after.rows[0].demo_sessions} demo_catches=${after.rows[0].demo_catches}`,
  );

  const check = await client.query(
    `SELECT * FROM public.river_fly_pulse('provo-river')`,
  );
  console.log(
    `[VERIFY] river_fly_pulse('provo-river') → ${check.rows.length} rows`,
  );
  for (const row of check.rows) {
    console.log(
      `  - ${row.fly_name} (sizes: ${(row.sizes || []).join(", ") || "—"})`,
    );
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
  console.error("[FAIL] Could not apply migrations via any pooler host");
  process.exit(2);
}
