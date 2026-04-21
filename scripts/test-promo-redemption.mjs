// End-to-end smoke test for the REDDIT30 promo flow.
//
// Creates 3 throwaway test users via service role, impersonates each, calls the
// redeem_promo_code RPC, and reports status. Cleans up the users + redemptions
// and subscription rows at the end so REDDIT30 remains at 250/250.
//
// Run: node scripts/test-promo-redemption.mjs
//
// Env: reads .env.local for NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const CODE = "REDDIT30";
const now = Date.now();
const testUsers = [
  { email: `promo-test-1-${now}@executiveangler.test`, password: "Test1234!!!" },
  { email: `promo-test-2-${now}@executiveangler.test`, password: "Test1234!!!" },
  { email: `promo-test-3-${now}@executiveangler.test`, password: "Test1234!!!" },
];

function log(...args) { console.log(...args); }

async function createUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);
  const uid = data.user.id;
  // Real signup flow inserts a profiles row; mirror that here so the
  // subscriptions trigger has a row to flip is_premium on.
  await admin.from("profiles").upsert(
    { user_id: uid, display_name: email.split("@")[0] },
    { onConflict: "user_id" }
  );
  return uid;
}

async function deleteUser(userId) {
  await admin.from("promo_redemptions").delete().eq("user_id", userId);
  await admin.from("subscriptions").delete().eq("user_id", userId);
  await admin.from("profiles").delete().eq("user_id", userId);
  await admin.auth.admin.deleteUser(userId);
}

async function redeem(userId) {
  const { data, error } = await admin.rpc("redeem_promo_code", {
    p_user_id: userId,
    p_code: CODE,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, rows: data };
}

async function getPremiumFlag(userId) {
  const { data } = await admin
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data?.is_premium;
}

async function getRemaining() {
  const { data } = await admin
    .from("promo_code_availability")
    .select("remaining, redeemed, total")
    .eq("code", CODE)
    .maybeSingle();
  return data;
}

(async () => {
  log(`\n=== Promo redemption smoke test — code ${CODE} ===\n`);

  const before = await getRemaining();
  log("Before:", before);

  const createdIds = [];
  const results = [];

  try {
    for (let i = 0; i < testUsers.length; i++) {
      const u = testUsers[i];
      const id = await createUser(u.email, u.password);
      createdIds.push(id);
      log(`\n[${i + 1}] Created ${u.email} → ${id}`);

      // First redemption
      const r1 = await redeem(id);
      log(`  1st redeem → ${JSON.stringify(r1)}`);
      const premium1 = await getPremiumFlag(id);
      log(`  profiles.is_premium = ${premium1}`);

      // Second redemption (expected: already_redeemed)
      const r2 = await redeem(id);
      log(`  2nd redeem (should be already_redeemed) → ${JSON.stringify(r2)}`);

      results.push({ email: u.email, r1, r2, premium: premium1 });
    }

    const mid = await getRemaining();
    log("\nAfter 3 redemptions:", mid);

    // Summary
    log("\n=== Summary ===");
    const ok = results.filter((r) => r.r1.rows?.[0]?.status === "ok");
    const already = results.filter((r) => r.r2.rows?.[0]?.status === "already_redeemed");
    const allPro = results.every((r) => r.premium);
    log(`First redemptions ok:        ${ok.length}/3`);
    log(`Idempotent on second call:   ${already.length}/3`);
    log(`is_premium flipped true:     ${allPro ? "yes" : "NO — problem"}`);
    log(`Counter: ${before?.remaining} → ${mid?.remaining} (expected -3)`);

    const pass =
      ok.length === 3 &&
      already.length === 3 &&
      allPro &&
      before && mid && before.remaining - mid.remaining === 3;
    log(`\nRESULT: ${pass ? "PASS ✅" : "FAIL ❌"}`);
  } catch (e) {
    log("ERROR:", e.message);
  } finally {
    log("\n=== Cleanup ===");
    for (const id of createdIds) {
      try {
        await deleteUser(id);
        log(`  Deleted ${id}`);
      } catch (e) {
        log(`  Cleanup failed for ${id}: ${e.message}`);
      }
    }
    const after = await getRemaining();
    log("After cleanup:", after);
  }
})();
