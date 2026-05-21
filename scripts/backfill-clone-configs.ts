/**
 * Backfill `user_fly_configurations` for orphaned user-created flies.
 *
 * Why: the Clone button on canonical fly pages inserts a new `flies` row
 * with status='private' + submitted_by_user_id, but until 2026-05-21 it did
 * NOT create a matching `user_fly_configurations` row. The Patterns hub
 * joins through configurations, so cloned flies were invisible there.
 *
 * This script finds every `flies` row with status='private' (and pending,
 * for safety) whose submitter has no configuration row for it, and inserts
 * a zeroed minimal config. It prints the angler URL of each fix so Taylor
 * can confirm the missing Pheasant Tail clone is reachable.
 *
 * Idempotent. Safe to run multiple times.
 *
 * Usage:
 *   npx tsx scripts/backfill-clone-configs.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Inline .env.local loader (matches seed-flies-batch.ts pattern).
try {
  const envContent = fs.readFileSync(
    path.resolve(process.cwd(), ".env.local"),
    "utf-8",
  );
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface FlyRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  submitted_by_user_id: string;
  created_at: string;
}

async function main() {
  // 1. Find every user-created fly.
  const { data: flies, error: fliesErr } = await supabase
    .from("flies")
    .select("id, slug, name, status, submitted_by_user_id, created_at")
    .in("status", ["private", "pending", "approved"])
    .not("submitted_by_user_id", "is", null)
    .order("created_at", { ascending: false });
  if (fliesErr) {
    console.error("Failed to query flies:", fliesErr);
    process.exit(1);
  }
  const candidates = (flies ?? []) as FlyRow[];
  console.log(`Found ${candidates.length} user-created flies to inspect.\n`);

  if (candidates.length === 0) {
    console.log("Nothing to backfill.");
    return;
  }

  // 2. Pull existing configurations for those (user_id, fly_id) pairs in one shot.
  const flyIds = candidates.map((f) => f.id);
  const { data: existingCfgs, error: cfgErr } = await supabase
    .from("user_fly_configurations")
    .select("user_id, fly_id")
    .in("fly_id", flyIds);
  if (cfgErr) {
    console.error("Failed to query existing configurations:", cfgErr);
    process.exit(1);
  }
  const haveCfg = new Set(
    (existingCfgs ?? []).map(
      (c: { user_id: string; fly_id: string }) => `${c.user_id}::${c.fly_id}`,
    ),
  );

  // 3. Resolve submitter usernames once for URL printing.
  const submitterIds = Array.from(
    new Set(candidates.map((f) => f.submitted_by_user_id)),
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username")
    .in("user_id", submitterIds);
  const usernameByUser = new Map(
    (profiles ?? []).map(
      (p: { user_id: string; username: string | null }) => [
        p.user_id,
        p.username ?? null,
      ],
    ),
  );

  // 4. For each fly missing a config for its submitter, insert one.
  let fixed = 0;
  let alreadyOk = 0;
  for (const fly of candidates) {
    const key = `${fly.submitted_by_user_id}::${fly.id}`;
    if (haveCfg.has(key)) {
      alreadyOk += 1;
      continue;
    }

    const { error: insertErr } = await supabase
      .from("user_fly_configurations")
      .insert({
        user_id: fly.submitted_by_user_id,
        fly_id: fly.id,
        tied_count: 0,
        bought_count: 0,
        target_count: 0,
        is_favorite: false,
        is_tie_next: false,
      });

    if (insertErr) {
      console.error(
        `  ✗ Failed to insert config for ${fly.name} (${fly.slug}):`,
        insertErr.message,
      );
      continue;
    }
    fixed += 1;
    const username = usernameByUser.get(fly.submitted_by_user_id) ?? null;
    const url = username
      ? `/anglers/${username}/flies/${fly.slug}`
      : `/flies/${fly.slug}`;
    console.log(
      `  ✓ ${fly.name}  [${fly.status}]  →  ${url}  (${fly.created_at})`,
    );
  }

  console.log(`\nDone. fixed=${fixed} already_ok=${alreadyOk} total=${candidates.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
