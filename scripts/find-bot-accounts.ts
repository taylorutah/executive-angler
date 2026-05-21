/**
 * find-bot-accounts.ts
 *
 * Audits the user base for likely bot signups and (optionally) bans them.
 *
 * Heuristics (any TRUE → suspicious):
 *   - Gmail dot-trick pattern: email has ≥3 dots in the local-part AND
 *     the dot-stripped normalized form collides with another account
 *   - Sessions == 3 AND catches == 31 AND fly_box == 0 (matches the demo-seed
 *     fingerprint when seeding was on — these accounts never logged real data)
 *   - Display name and username are both random-looking (matches /^[A-Za-z]{10,}$/
 *     with no vowel-cluster structure i.e. high consonant ratio)
 *
 * Usage:
 *   npx tsx scripts/find-bot-accounts.ts              # dry-run, prints list
 *   npx tsx scripts/find-bot-accounts.ts --ban         # ban suspicious users
 *   npx tsx scripts/find-bot-accounts.ts --delete      # permanently delete
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { normalizeEmail } from "../src/lib/email-validation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

const MODE: "dry" | "ban" | "delete" =
  process.argv.includes("--delete") ? "delete" :
  process.argv.includes("--ban") ? "ban" :
  "dry";

interface AuthUser {
  id: string;
  email: string | null;
  created_at: string;
}

interface Suspect {
  user_id: string;
  email: string | null;
  reasons: string[];
  sessions: number;
  catches: number;
  fly_box: number;
}

function looksGibberish(s: string | null | undefined): boolean {
  if (!s) return false;
  const clean = s.replace(/[^A-Za-z]/g, "");
  if (clean.length < 10) return false;
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  const ratio = vowels / clean.length;
  // Real names hover ~35–45% vowels. Random keysmash drops below ~25%.
  return ratio < 0.25;
}

function dotCount(email: string | null): number {
  if (!email) return 0;
  const at = email.indexOf("@");
  if (at < 0) return 0;
  return (email.slice(0, at).match(/\./g) || []).length;
}

async function main() {
  // 1. Pull all auth users (paginated)
  const users: AuthUser[] = [];
  for (let page = 1; page <= 10; page++) {
    const { data } = await sb.auth.admin.listUsers({ page, perPage: 500 });
    const batch = data?.users ?? [];
    users.push(
      ...batch.map((u) => ({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
      }))
    );
    if (batch.length < 500) break;
  }
  console.log(`[bot-audit] scanned ${users.length} auth users`);

  // 2. Pull profiles (display_name, username, is_banned)
  const { data: profiles } = await sb
    .from("profiles")
    .select("user_id, display_name, username, is_banned");
  const profileById = new Map(
    (profiles ?? []).map((p) => [p.user_id, p as { user_id: string; display_name: string | null; username: string | null; is_banned: boolean | null }])
  );

  // 3. Pull session + catch + fly counts
  const sessionCount = new Map<string, number>();
  const catchCount = new Map<string, number>();
  const flyCount = new Map<string, number>();
  const { data: sessRows } = await sb.from("fishing_sessions").select("user_id").limit(50000);
  (sessRows ?? []).forEach((r: { user_id: string }) => {
    sessionCount.set(r.user_id, (sessionCount.get(r.user_id) || 0) + 1);
  });
  const { data: catchRows } = await sb.from("catches").select("user_id").limit(100000);
  (catchRows ?? []).forEach((r: { user_id: string }) => {
    catchCount.set(r.user_id, (catchCount.get(r.user_id) || 0) + 1);
  });
  const { data: flyRows } = await sb.from("user_fly_box").select("user_id").limit(50000);
  (flyRows ?? []).forEach((r: { user_id: string }) => {
    flyCount.set(r.user_id, (flyCount.get(r.user_id) || 0) + 1);
  });

  // 4. Build normalized-email collision index
  const normIndex = new Map<string, string[]>();
  for (const u of users) {
    if (!u.email) continue;
    const { normalized } = normalizeEmail(u.email);
    const arr = normIndex.get(normalized) || [];
    arr.push(u.id);
    normIndex.set(normalized, arr);
  }

  // 5. Score each user
  const suspects: Suspect[] = [];
  for (const u of users) {
    const profile = profileById.get(u.id);
    if (profile?.is_banned) continue; // already banned
    const reasons: string[] = [];

    if (u.email) {
      const { normalized } = normalizeEmail(u.email);
      const collisions = normIndex.get(normalized) || [];
      if (collisions.length > 1 && dotCount(u.email) >= 3) {
        reasons.push(`gmail_dot_trick (collides with ${collisions.length - 1} other)`);
      }
    }

    const s = sessionCount.get(u.id) || 0;
    const c = catchCount.get(u.id) || 0;
    const f = flyCount.get(u.id) || 0;
    if (s === 3 && c === 31 && f === 0) {
      reasons.push("demo_seed_fingerprint (3/31/0, never logged real data)");
    }

    if (looksGibberish(profile?.display_name) && looksGibberish(profile?.username)) {
      reasons.push("gibberish_name_and_username");
    }

    if (reasons.length > 0) {
      suspects.push({
        user_id: u.id,
        email: u.email,
        reasons,
        sessions: s,
        catches: c,
        fly_box: f,
      });
    }
  }

  // The demo-seed fingerprint alone is weak (real signups could match if they
  // touched the demo and nothing else). Require AT LEAST 2 reasons before
  // we'd ever auto-act — keeps false positives off.
  const confirmedBots = suspects.filter((s) => s.reasons.length >= 2);
  const ambiguous = suspects.filter((s) => s.reasons.length === 1);

  console.log(`\n=== CONFIRMED (≥2 signals) — ${confirmedBots.length} accounts ===`);
  for (const s of confirmedBots) {
    console.log(
      `  ${s.user_id}  ${s.email ?? "(no email)"}  · ${s.sessions}/${s.catches}/${s.fly_box}  · ${s.reasons.join(" + ")}`
    );
  }

  console.log(`\n=== AMBIGUOUS (1 signal — review manually) — ${ambiguous.length} accounts ===`);
  for (const s of ambiguous) {
    console.log(
      `  ${s.user_id}  ${s.email ?? "(no email)"}  · ${s.sessions}/${s.catches}/${s.fly_box}  · ${s.reasons.join(" + ")}`
    );
  }

  if (MODE === "dry") {
    console.log("\n[dry-run] No changes made. Re-run with --ban or --delete to act.");
    return;
  }

  if (confirmedBots.length === 0) {
    console.log("\nNothing to act on.");
    return;
  }

  for (const s of confirmedBots) {
    if (MODE === "ban") {
      const { error } = await sb
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: `auto-ban: ${s.reasons.join("; ")}`,
          banned_at: new Date().toISOString(),
          banned_by: "find-bot-accounts.ts",
        })
        .eq("user_id", s.user_id);
      console.log(`  ban ${s.user_id} ${error ? "FAILED " + error.message : "ok"}`);
    } else if (MODE === "delete") {
      const { error } = await sb.auth.admin.deleteUser(s.user_id);
      console.log(`  delete ${s.user_id} ${error ? "FAILED " + error.message : "ok"}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
