/**
 * Flatten fly forks into standalone canonicals.
 *
 * Run AFTER applying supabase/migrations/flatten-fly-architecture.sql, which
 * adds the status / submitted_by / approved_* / inspired_by_fly_id columns.
 *
 * What this script does (per the locked-in plan):
 *   1. Promote every fork (forked_from_pattern_id was set) to a standalone
 *      canonical: null out inspired_by_fly_id (we don't want even attribution
 *      inheritance), confirm status='approved'.
 *   2. Verify every catch stays linked. Counts catches that flow through each
 *      promoted fork's variants and reports the totals — no FK is mutated.
 *   3. Refresh catches.fly_name snapshots. Old catches stamped their fly_name
 *      column at save time, so they retain "— Yours" / "— copper" strings
 *      even after a rename. Re-stamp them from the live pattern.name via
 *      variant_id → fly_variants.pattern_id → fly_patterns_v2.name so the
 *      journal feed never lags behind a rename.
 *   4. Null out fly_variants.display_name. The merge scripts left these alone
 *      and they're the only stale-name source left in the readers.
 *
 * Linkage preservation: zero FK columns are touched on catches or
 * fly_variants. Promoted forks keep the same id, so every variant + catch
 * stays bound to the same fly. Verify-counts section proves this before/after.
 *
 * Dry-run by default. Pass --apply to commit.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const APPLY = process.argv.includes("--apply");

const log: string[] = [];
function say(msg: string) {
  const line = `${new Date().toISOString()}  ${msg}`;
  console.log(line);
  log.push(line);
}

function writeLog() {
  if (!existsSync("scripts/logs")) mkdirSync("scripts/logs", { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = APPLY ? "apply" : "dryrun";
  const path = `scripts/logs/flatten-fly-forks-${ts}-${suffix}.log`;
  writeFileSync(path, log.join("\n") + "\n");
  console.log(`\nLog: ${path}`);
}

async function main() {
  say(`Mode: ${APPLY ? "APPLY (committing changes)" : "DRY-RUN (no writes)"}`);

  // ───── 0. Sanity: new columns exist (migration applied?)
  {
    const { error } = await sb
      .from("fly_patterns_v2")
      .select("id, status, inspired_by_fly_id, submitted_by_user_id")
      .limit(1);
    if (error) {
      throw new Error(
        `Migration not applied yet — fly_patterns_v2 is missing the new columns. ` +
        `Apply supabase/migrations/flatten-fly-architecture.sql first. (${error.message})`
      );
    }
  }

  // ───── 1. Identify forks to promote
  type Pat = {
    id: string;
    name: string;
    slug: string | null;
    owner_user_id: string | null;
    inspired_by_fly_id: string | null;
    status: string;
  };
  const { data: forks, error: forksErr } = await sb
    .from("fly_patterns_v2")
    .select("id, name, slug, owner_user_id, inspired_by_fly_id, status")
    .not("inspired_by_fly_id", "is", null);
  if (forksErr) throw new Error(`list forks: ${forksErr.message}`);
  const forkList = (forks ?? []) as Pat[];
  say(`Found ${forkList.length} fork(s) to flatten.`);

  if (forkList.length === 0) {
    say("Nothing to do at the fork level. Continuing to catch-snapshot refresh + variant display_name cleanup.");
  }

  // Map each fork to its variant ids + catch count, BEFORE we mutate.
  const forkIds = forkList.map((f) => f.id);
  const variantsByFork = new Map<string, string[]>();
  if (forkIds.length > 0) {
    const { data: variants } = await sb
      .from("fly_variants")
      .select("id, pattern_id")
      .in("pattern_id", forkIds);
    for (const v of (variants ?? []) as { id: string; pattern_id: string }[]) {
      const list = variantsByFork.get(v.pattern_id) ?? [];
      list.push(v.id);
      variantsByFork.set(v.pattern_id, list);
    }
  }

  // Pre-state catch counts per fork (linked via any variant of the fork).
  const preCatchCount = new Map<string, number>();
  for (const fork of forkList) {
    const vIds = variantsByFork.get(fork.id) ?? [];
    if (vIds.length === 0) {
      preCatchCount.set(fork.id, 0);
      continue;
    }
    const { count } = await sb
      .from("catches")
      .select("*", { count: "exact", head: true })
      .in("variant_id", vIds);
    preCatchCount.set(fork.id, count ?? 0);
  }

  for (const fork of forkList) {
    const vIds = variantsByFork.get(fork.id) ?? [];
    const owner = fork.owner_user_id ? fork.owner_user_id.slice(0, 8) : "canonical";
    say(`  • ${fork.id.slice(0, 8)} "${fork.name}" — owner=${owner}, variants=${vIds.length}, catches=${preCatchCount.get(fork.id) ?? 0}, inspired_by=${fork.inspired_by_fly_id?.slice(0, 8) ?? "—"}`);
  }

  // ───── 2. Promote forks: null out inspired_by_fly_id, confirm status='approved'
  if (APPLY && forkIds.length > 0) {
    const { error } = await sb
      .from("fly_patterns_v2")
      .update({ inspired_by_fly_id: null, status: "approved" })
      .in("id", forkIds);
    if (error) throw new Error(`promote forks: ${error.message}`);
    say(`Promoted ${forkIds.length} fork(s) to standalone canonicals.`);
  } else if (forkIds.length > 0) {
    say(`(dry-run: would clear inspired_by_fly_id and set status='approved' on ${forkIds.length} row(s))`);
  }

  // ───── 3. Verify linkage post-promotion
  if (APPLY && forkIds.length > 0) {
    for (const fork of forkList) {
      const vIds = variantsByFork.get(fork.id) ?? [];
      const { count: vAfter } = await sb
        .from("fly_variants")
        .select("*", { count: "exact", head: true })
        .eq("pattern_id", fork.id);
      const { count: cAfter } = vIds.length > 0
        ? await sb.from("catches").select("*", { count: "exact", head: true }).in("variant_id", vIds)
        : { count: 0 };
      const expected = preCatchCount.get(fork.id) ?? 0;
      if ((vAfter ?? 0) !== vIds.length || (cAfter ?? 0) !== expected) {
        throw new Error(
          `LINKAGE DRIFT on fork ${fork.id}: variants ${vAfter}/${vIds.length}, catches ${cAfter}/${expected}`
        );
      }
    }
    say(`Linkage verified — every variant + catch still bound.`);
  }

  // ───── 4. Refresh denormalized catches.fly_name from the live pattern name
  //         via variant_id → fly_variants.pattern_id → fly_patterns_v2.name
  //
  // Old catches were stamped at save time; if a fly was renamed since, the
  // catch row's fly_name column still has the old string. After this refresh,
  // journal feeds + analytics + iOS catch summaries all read what the fly is
  // called *today*.
  const { data: allPatterns } = await sb
    .from("fly_patterns_v2")
    .select("id, name");
  const nameByPattern = new Map<string, string>();
  for (const p of (allPatterns ?? []) as { id: string; name: string }[]) {
    nameByPattern.set(p.id, p.name);
  }

  const { data: allVariants } = await sb
    .from("fly_variants")
    .select("id, pattern_id");
  const patternByVariant = new Map<string, string>();
  for (const v of (allVariants ?? []) as { id: string; pattern_id: string }[]) {
    patternByVariant.set(v.id, v.pattern_id);
  }

  // Catches with a variant_id where the live name differs from the snapshot.
  const { data: catchesNeedingRefresh, error: catchErr } = await sb
    .from("catches")
    .select("id, fly_name, variant_id")
    .not("variant_id", "is", null);
  if (catchErr) throw new Error(`scan catches: ${catchErr.message}`);

  type CR = { id: string; fly_name: string | null; variant_id: string | null };
  const drifted: { id: string; from: string | null; to: string }[] = [];
  for (const c of (catchesNeedingRefresh ?? []) as CR[]) {
    if (!c.variant_id) continue;
    const pid = patternByVariant.get(c.variant_id);
    if (!pid) continue;
    const liveName = nameByPattern.get(pid);
    if (!liveName) continue;
    if (c.fly_name !== liveName) {
      drifted.push({ id: c.id, from: c.fly_name, to: liveName });
    }
  }

  say(`\nCatches with stale fly_name snapshot: ${drifted.length}`);
  for (const d of drifted.slice(0, 20)) {
    say(`  ${d.id.slice(0, 8)} "${d.from ?? "(null)"}" → "${d.to}"`);
  }
  if (drifted.length > 20) say(`  …and ${drifted.length - 20} more.`);

  if (APPLY && drifted.length > 0) {
    // Group by target name to minimize round-trips.
    const byTarget = new Map<string, string[]>();
    for (const d of drifted) {
      const list = byTarget.get(d.to) ?? [];
      list.push(d.id);
      byTarget.set(d.to, list);
    }
    let written = 0;
    for (const [name, ids] of byTarget) {
      const { error } = await sb
        .from("catches")
        .update({ fly_name: name })
        .in("id", ids);
      if (error) throw new Error(`refresh fly_name for "${name}": ${error.message}`);
      written += ids.length;
    }
    say(`Refreshed fly_name on ${written} catch(es).`);
  } else if (drifted.length > 0) {
    say(`(dry-run: would refresh fly_name on ${drifted.length} catch(es))`);
  }

  // ───── 5. Null out fly_variants.display_name across the board
  //
  // The merge scripts intentionally left this column alone, which is why
  // iOS kept seeing "Lite Bright Perdigon #16" with the pre-rename spelling.
  // After this null-out, readers fall back to fly_patterns_v2.name (the only
  // source of truth) and renames take effect immediately.
  const { count: dnCount } = await sb
    .from("fly_variants")
    .select("*", { count: "exact", head: true })
    .not("display_name", "is", null);
  say(`\nfly_variants rows with display_name set: ${dnCount ?? 0}`);
  if (APPLY && (dnCount ?? 0) > 0) {
    const { error } = await sb
      .from("fly_variants")
      .update({ display_name: null })
      .not("display_name", "is", null);
    if (error) throw new Error(`null display_name: ${error.message}`);
    say(`Nulled display_name on ${dnCount} variant(s).`);
  } else if ((dnCount ?? 0) > 0) {
    say(`(dry-run: would null display_name on ${dnCount} variant(s))`);
  }

  // ───── 6. Post-state report
  const { data: postForks } = await sb
    .from("fly_patterns_v2")
    .select("id")
    .not("inspired_by_fly_id", "is", null);
  const { data: pendingApproval } = await sb
    .from("fly_patterns_v2")
    .select("id")
    .neq("status", "approved");
  say(`\nPost-state:`);
  say(`  fly_patterns_v2 with inspired_by_fly_id still set: ${postForks?.length ?? 0}`);
  say(`  fly_patterns_v2 with status != 'approved': ${pendingApproval?.length ?? 0}`);
  say(`\nDone (${APPLY ? "APPLIED" : "dry-run"}).`);
}

main()
  .catch((e) => {
    say(`ERROR: ${(e as Error).message}`);
    writeLog();
    process.exit(1);
  })
  .then(writeLog);
