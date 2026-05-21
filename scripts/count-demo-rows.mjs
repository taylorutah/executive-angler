// READ-ONLY: count is_demo rows + show what river_fly_pulse('provo-river')
// currently returns. Does not modify the database.
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

async function tryRun(host) {
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

  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM public.fishing_sessions WHERE is_demo = true) AS demo_sessions,
      (SELECT COUNT(*) FROM public.catches          WHERE is_demo = true) AS demo_catches,
      (SELECT COUNT(DISTINCT user_id) FROM public.fishing_sessions WHERE is_demo = true) AS users_with_demo,
      (SELECT COUNT(*) FROM public.fishing_sessions WHERE is_demo IS NOT TRUE) AS real_sessions,
      (SELECT COUNT(*) FROM public.catches          WHERE is_demo IS NOT TRUE) AS real_catches
  `);
  console.log("[COUNTS]", counts.rows[0]);

  const provoBreakdown = await client.query(`
    SELECT fs.is_demo, COUNT(*) AS sessions
    FROM public.fishing_sessions fs
    WHERE fs.river_id = 'provo-river'
    GROUP BY fs.is_demo
    ORDER BY fs.is_demo
  `);
  console.log("[PROVO SESSIONS BY is_demo]");
  for (const row of provoBreakdown.rows) {
    console.log(`  is_demo=${row.is_demo} → ${row.sessions} sessions`);
  }

  const pulse = await client.query(
    `SELECT * FROM public.river_fly_pulse('provo-river')`,
  );
  console.log(
    `[CURRENT river_fly_pulse('provo-river')] → ${pulse.rows.length} rows`,
  );
  for (const row of pulse.rows) {
    console.log(
      `  - ${row.fly_name} (sizes: ${(row.sizes || []).join(", ") || "—"})`,
    );
  }

  await client.end();
}

let ran = false;
for (const host of candidateHosts) {
  try {
    await tryRun(host);
    ran = true;
    break;
  } catch (err) {
    console.warn(`[SKIP] ${host} → code=${err.code} msg="${err.message}"`);
  }
}
if (!ran) {
  console.error("[FAIL] Could not connect via any pooler host");
  process.exit(2);
}
