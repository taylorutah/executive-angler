/**
 * One-shot inspection script: lists everything that could become a
 * canonical via the new approval policy.
 *
 * Outputs:
 *   1. Pending submissions in fly_pattern_submissions
 *   2. Taylor's own personal patterns in fly_patterns (or all users' if --all)
 *
 * Usage:
 *   tsx scripts/sweep-canonical-candidates.ts [--all]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Inline .env.local loader (no dotenv dep — matches scripts/seed-flies.ts)
try {
  const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
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

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const includeAll = process.argv.includes("--all");

  const sb = createClient(url, key, { auth: { persistSession: false } });

  // ── 0. Existing canonicals (for dedup checks) ───────────────────────────
  const { data: existingCanon } = await sb
    .from("canonical_flies")
    .select("slug, name");
  const existingCanonNames = new Set(
    (existingCanon ?? []).map((r) => String(r.name).toLowerCase().trim()),
  );
  console.log(`Loaded ${existingCanonNames.size} existing canonical names for dedup.`);

  // ── 1. Submission queue ──────────────────────────────────────────────────
  const { data: subs, error: subErr } = await sb
    .from("fly_pattern_submissions")
    .select("id, name, category, status, created_at, source_pattern_id, origin_credit, description")
    .order("created_at", { ascending: false })
    .limit(100);

  if (subErr) {
    console.error("submissions query:", subErr.message);
  } else {
    const pending = (subs ?? []).filter((s) => s.status === "pending");
    console.log(`\n=== Pending submissions: ${pending.length} ===`);
    for (const s of pending) {
      const desc = (s.description as string | null)?.slice(0, 60) ?? "";
      console.log(
        `  - ${s.name}  [${s.category}]  by ${s.origin_credit ?? "?"}  — ${desc}`,
      );
    }
    if (pending.length === 0) console.log("  (none)");

    const otherStatuses = (subs ?? []).filter((s) => s.status !== "pending");
    if (otherStatuses.length > 0) {
      console.log(`\nOther submissions (${otherStatuses.length}):`);
      const byStatus: Record<string, number> = {};
      otherStatuses.forEach((s) => {
        const st = String(s.status);
        byStatus[st] = (byStatus[st] ?? 0) + 1;
      });
      Object.entries(byStatus).forEach(([st, n]) =>
        console.log(`  ${st}: ${n}`),
      );
    }
  }

  // ── 2. Personal patterns not yet promoted ────────────────────────────────
  // Find Taylor by admin email; or list all if --all flag.
  let q = sb
    .from("fly_patterns")
    .select(
      "id, name, type, user_id, parent_canonical_id, promoted_to_canonical_id, created_at",
    )
    .is("promoted_to_canonical_id", null);

  if (!includeAll) {
    // Look up Taylor's user_id from the admin email constants
    const { data: adminProfile } = await sb
      .from("auth.users" as never)
      .select("id, email")
      .eq("email", "taylor.warnick@gmail.com")
      .limit(1)
      .maybeSingle();
    const taylorId = (adminProfile as { id?: string } | null)?.id;
    if (taylorId) {
      q = q.eq("user_id", taylorId);
    } else {
      console.log(
        "\n(could not resolve Taylor's user_id from auth.users — listing all patterns. Re-run with --all to suppress this fallback.)",
      );
    }
  }

  const { data: pats, error: patErr } = await q
    .order("created_at", { ascending: false })
    .limit(200);

  if (patErr) {
    console.error("\npatterns query:", patErr.message);
  } else {
    const total = pats?.length ?? 0;
    const named = (pats ?? []).filter((p) => {
      const name = String(p.name ?? "").trim();
      // Heuristic: real names are 2+ words OR have caps OR aren't generic
      return (
        name.length > 0 &&
        !name.toLowerCase().startsWith("untitled") &&
        !name.toLowerCase().includes("draft") &&
        !name.toLowerCase().includes("test")
      );
    });
    // Split named into "would dupe an existing canonical" vs "would be new"
    const wouldDupe: typeof named = [];
    const wouldBeNew: typeof named = [];
    for (const p of named) {
      const norm = String(p.name).toLowerCase().trim();
      if (existingCanonNames.has(norm)) wouldDupe.push(p);
      else wouldBeNew.push(p);
    }

    console.log(
      `\n=== Personal patterns not yet promoted: ${total} (named: ${named.length}) ===`,
    );
    console.log(`\n--- Would CREATE new canonical (${wouldBeNew.length}) ---`);
    for (const p of wouldBeNew) {
      const lineage = p.parent_canonical_id ? " (forked)" : " (original)";
      console.log(`  + ${p.name}  [${p.type ?? "?"}]${lineage}`);
    }
    if (wouldBeNew.length === 0) console.log("  (none)");

    console.log(
      `\n--- Would DUPE existing canonical — skip or rename (${wouldDupe.length}) ---`,
    );
    for (const p of wouldDupe) {
      console.log(`  · ${p.name}  [${p.type ?? "?"}]`);
    }
    if (wouldDupe.length === 0) console.log("  (none)");
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
