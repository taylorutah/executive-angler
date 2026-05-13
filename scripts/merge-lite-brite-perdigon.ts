/**
 * Merge duplicate "Lite Bright Perdigon" canonical (loser) into
 * "Lite Brite Perdigon" (winner). Re-parents Taylor's personal fork and
 * migrates 1 catch + 3 fly_variant_stock rows. Dry-run by default; pass
 * --apply to commit. Idempotent: re-running after a clean merge is a no-op.
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

const WINNER_ID = "1f5c47e1-5b37-4992-a6c7-b1c7e92867b7";
const LOSER_ID = "13aee4ea-c434-4d0c-bffc-ec140430dcc8";
const FORK_ID = "20239cb8-5926-449b-b3ff-28871f01eac0";
const LEGACY_TIED = "1946f383-832d-46f2-87c9-57cb72c5079b";
const WINNER_NAME = "Lite Brite Perdigon";

const VARIANT_SPEC_COLS = [
  "slug",
  "display_name",
  "notes",
  "hook_style",
  "hook_brand",
  "bead_material",
  "bead_weight_mm",
  "bead_color",
  "body_color",
  "rib_color",
  "tail_color",
  "wing_color",
  "thorax_color",
  "collar_color",
  "materials_override",
] as const;

const STOCK_MERGE_COLS = [
  "tied_count",
  "bought_count",
  "target_count",
  "times_used",
  "last_used_at",
  "last_loss_at",
  "is_favorite",
  "personal_notes",
  "tie_next_status",
  "tie_next_target_qty",
  "tie_next_notes",
] as const;

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
  const path = `scripts/logs/merge-lite-brite-${ts}-${suffix}.log`;
  writeFileSync(path, log.join("\n") + "\n");
  console.log(`\nLog: ${path}`);
}

async function main() {
  say(`Mode: ${APPLY ? "APPLY (committing changes)" : "DRY-RUN (no writes)"}`);

  // ───── Sanity: confirm winner exists, loser exists (or is already gone)
  const { data: winner } = await sb
    .from("fly_patterns_v2")
    .select("id, slug, name")
    .eq("id", WINNER_ID)
    .maybeSingle();
  if (!winner) throw new Error(`Winner ${WINNER_ID} not found`);
  say(`Winner: ${winner.name} (${winner.slug})`);

  const { data: loser } = await sb
    .from("fly_patterns_v2")
    .select("id, slug, name")
    .eq("id", LOSER_ID)
    .maybeSingle();
  if (!loser) {
    say(`Loser ${LOSER_ID} already gone — nothing to do at canonical level.`);
  } else {
    say(`Loser:  ${loser.name} (${loser.slug})`);
  }

  // ───── Step 1: merge variant specs
  const { data: winnerVariants } = await sb
    .from("fly_variants")
    .select(`id, size, ${VARIANT_SPEC_COLS.join(", ")}`)
    .eq("pattern_id", WINNER_ID);

  const { data: loserVariants } = await sb
    .from("fly_variants")
    .select(`id, size, ${VARIANT_SPEC_COLS.join(", ")}`)
    .eq("pattern_id", LOSER_ID);

  say(`Winner has ${winnerVariants?.length ?? 0} variants; loser has ${loserVariants?.length ?? 0} variants.`);

  const winnerBySize = new Map<string, any>();
  for (const v of winnerVariants ?? []) winnerBySize.set(v.size, v);

  // loserVariantId → winnerVariantId map (built as we go)
  const remap = new Map<string, string>();

  for (const lv of loserVariants ?? []) {
    let wv = winnerBySize.get(lv.size);

    if (!wv) {
      // No winner variant for this size — re-parent the loser variant onto winner
      say(`  Re-parent loser variant ${lv.id} (size ${lv.size}) → winner pattern (no matching size).`);
      if (APPLY) {
        const { error } = await sb
          .from("fly_variants")
          .update({ pattern_id: WINNER_ID })
          .eq("id", lv.id);
        if (error) throw new Error(`re-parent variant ${lv.id}: ${error.message}`);
      }
      remap.set(lv.id, lv.id); // points to itself, now under winner
      winnerBySize.set(lv.size, { ...lv, pattern_id: WINNER_ID });
      continue;
    }

    // Matching size exists on winner — copy non-null spec fields onto winner (winner wins on conflict)
    const patch: Record<string, any> = {};
    for (const col of VARIANT_SPEC_COLS) {
      const winVal = (wv as any)[col];
      const losVal = (lv as any)[col];
      const winEmpty =
        winVal === null ||
        winVal === undefined ||
        (col === "materials_override" && winVal && Object.keys(winVal).length === 0);
      const losNonEmpty =
        losVal !== null &&
        losVal !== undefined &&
        !(col === "materials_override" && losVal && Object.keys(losVal).length === 0);
      if (winEmpty && losNonEmpty) patch[col] = losVal;
    }
    if (Object.keys(patch).length) {
      say(`  Merge specs into winner variant ${wv.id} (size ${wv.size}): ${JSON.stringify(patch)}`);
      if (APPLY) {
        const { error } = await sb.from("fly_variants").update(patch).eq("id", wv.id);
        if (error) throw new Error(`merge specs variant ${wv.id}: ${error.message}`);
      }
    } else {
      say(`  Winner variant ${wv.id} (size ${wv.size}) already as good as or better than loser ${lv.id}; no spec copy.`);
    }
    remap.set(lv.id, wv.id);
  }

  // ───── Step 2: reassign catches
  for (const [loserVid, winnerVid] of remap.entries()) {
    if (loserVid === winnerVid) continue; // re-parented in place
    const { data: rows } = await sb
      .from("catches")
      .select("id")
      .eq("variant_id", loserVid);
    if (rows?.length) {
      say(`  Reassign ${rows.length} catch(es) variant_id ${loserVid} → ${winnerVid}`);
      if (APPLY) {
        const { error } = await sb
          .from("catches")
          .update({ variant_id: winnerVid })
          .eq("variant_id", loserVid);
        if (error) throw new Error(`reassign catches variant ${loserVid}: ${error.message}`);
      }
    }
  }

  // catches.fly_pattern_id FK → legacy fly_patterns. The winner lives in
  // fly_patterns_v2 + canonical_flies, not legacy fly_patterns. So:
  //   - null fly_pattern_id (clear stale legacy ref)
  //   - set canonical_fly_id = WINNER_ID (FK → canonical_flies, where winner exists)
  //   - set fly_name for display fallback
  //   - variant_id already carries the authoritative Phase 2 link
  for (const loserPid of [LOSER_ID, LEGACY_TIED]) {
    const { data: rows } = await sb
      .from("catches")
      .select("id, fly_name, variant_id")
      .eq("fly_pattern_id", loserPid);
    if (rows?.length) {
      say(`  Re-point ${rows.length} catch(es) (was fly_pattern_id=${loserPid}) → canonical_fly_id=${WINNER_ID}, fly_name="${WINNER_NAME}"`);
      if (APPLY) {
        const { error } = await sb
          .from("catches")
          .update({
            fly_pattern_id: null,
            canonical_fly_id: WINNER_ID,
            fly_name: WINNER_NAME,
          })
          .eq("fly_pattern_id", loserPid);
        if (error) throw new Error(`re-point catches ${loserPid}: ${error.message}`);
      }
    }
  }

  // ───── Step 2b: reassign catches.canonical_fly_id pointing at loser
  {
    const { data: rows } = await sb
      .from("catches")
      .select("id")
      .eq("canonical_fly_id", LOSER_ID);
    if (rows?.length) {
      say(`  Reassign ${rows.length} catch(es) canonical_fly_id ${LOSER_ID} → ${WINNER_ID}`);
      if (APPLY) {
        const { error } = await sb
          .from("catches")
          .update({ canonical_fly_id: WINNER_ID, fly_name: WINNER_NAME })
          .eq("canonical_fly_id", LOSER_ID);
        if (error) throw new Error(`reassign canonical_fly_id: ${error.message}`);
      }
    }
  }

  // ───── Step 2c: reassign user_fly_box.canonical_fly_id pointing at loser
  {
    const { data: rows } = await sb
      .from("user_fly_box")
      .select("id, user_id")
      .eq("canonical_fly_id", LOSER_ID);
    if (rows?.length) {
      say(`  Reassign ${rows.length} user_fly_box row(s) canonical_fly_id ${LOSER_ID} → ${WINNER_ID}`);
      if (APPLY) {
        // Check for unique-conflict: a row may already exist for (user_id, WINNER_ID).
        for (const r of rows) {
          const { data: existing } = await sb
            .from("user_fly_box")
            .select("id")
            .eq("user_id", r.user_id)
            .eq("canonical_fly_id", WINNER_ID)
            .maybeSingle();
          if (existing) {
            say(`    user=${r.user_id} already has winner box row; deleting loser row ${r.id}`);
            const { error } = await sb.from("user_fly_box").delete().eq("id", r.id);
            if (error) throw new Error(`delete dup user_fly_box ${r.id}: ${error.message}`);
          } else {
            const { error } = await sb
              .from("user_fly_box")
              .update({ canonical_fly_id: WINNER_ID })
              .eq("id", r.id);
            if (error) throw new Error(`move user_fly_box ${r.id}: ${error.message}`);
          }
        }
      }
    }
  }

  // ───── Step 3: reassign / merge fly_variant_stock
  for (const [loserVid, winnerVid] of remap.entries()) {
    if (loserVid === winnerVid) continue;
    const { data: stockRows } = await sb
      .from("fly_variant_stock")
      .select("*")
      .eq("variant_id", loserVid);
    for (const sr of stockRows ?? []) {
      const { data: existing } = await sb
        .from("fly_variant_stock")
        .select("*")
        .eq("user_id", sr.user_id)
        .eq("variant_id", winnerVid)
        .maybeSingle();
      if (!existing) {
        say(`  Move stock row user=${sr.user_id} ${loserVid} → ${winnerVid} (tied=${sr.tied_count})`);
        if (APPLY) {
          const { error } = await sb
            .from("fly_variant_stock")
            .update({ variant_id: winnerVid })
            .eq("id", sr.id);
          if (error) throw new Error(`move stock ${sr.id}: ${error.message}`);
        }
      } else {
        const merged: Record<string, any> = {
          tied_count: (existing.tied_count ?? 0) + (sr.tied_count ?? 0),
          bought_count: (existing.bought_count ?? 0) + (sr.bought_count ?? 0),
          target_count: Math.max(existing.target_count ?? 0, sr.target_count ?? 0),
          times_used: (existing.times_used ?? 0) + (sr.times_used ?? 0),
          last_used_at:
            !existing.last_used_at || (sr.last_used_at && sr.last_used_at > existing.last_used_at)
              ? sr.last_used_at ?? existing.last_used_at
              : existing.last_used_at,
          last_loss_at:
            !existing.last_loss_at || (sr.last_loss_at && sr.last_loss_at > existing.last_loss_at)
              ? sr.last_loss_at ?? existing.last_loss_at
              : existing.last_loss_at,
          is_favorite: existing.is_favorite || sr.is_favorite,
          personal_notes: existing.personal_notes || sr.personal_notes,
          tie_next_status:
            existing.tie_next_status !== "none" ? existing.tie_next_status : sr.tie_next_status,
          tie_next_target_qty: Math.max(
            existing.tie_next_target_qty ?? 0,
            sr.tie_next_target_qty ?? 0,
          ) || null,
          tie_next_notes: existing.tie_next_notes || sr.tie_next_notes,
        };
        say(`  Merge stock user=${sr.user_id} into existing winner row (${loserVid}+${winnerVid}): ${JSON.stringify({ tied: merged.tied_count, target: merged.target_count, used: merged.times_used })}`);
        if (APPLY) {
          const { error: uerr } = await sb
            .from("fly_variant_stock")
            .update(merged)
            .eq("id", existing.id);
          if (uerr) throw new Error(`merge stock update ${existing.id}: ${uerr.message}`);
          const { error: derr } = await sb.from("fly_variant_stock").delete().eq("id", sr.id);
          if (derr) throw new Error(`merge stock delete ${sr.id}: ${derr.message}`);
        }
      }
    }
  }

  // ───── Step 4: re-parent and rename Taylor's personal fork
  const { data: forkLegacy } = await sb
    .from("fly_patterns")
    .select("id, name, parent_canonical_id")
    .eq("id", FORK_ID)
    .maybeSingle();
  if (forkLegacy) {
    const updates: Record<string, any> = {};
    if (forkLegacy.parent_canonical_id !== WINNER_ID) updates.parent_canonical_id = WINNER_ID;
    if (forkLegacy.name?.includes("Bright")) updates.name = forkLegacy.name.replace(/Bright/g, "Brite");
    if (Object.keys(updates).length) {
      say(`  Update legacy fly_patterns fork: ${JSON.stringify(updates)}`);
      if (APPLY) {
        const { error } = await sb.from("fly_patterns").update(updates).eq("id", FORK_ID);
        if (error) throw new Error(`fork legacy update: ${error.message}`);
      }
    } else {
      say(`  Legacy fork ${FORK_ID} already correct.`);
    }
  }

  const { data: forkV2 } = await sb
    .from("fly_patterns_v2")
    .select("id, name")
    .eq("id", FORK_ID)
    .maybeSingle();
  if (forkV2) {
    if (forkV2.name?.includes("Bright")) {
      const newName = forkV2.name.replace(/Bright/g, "Brite");
      say(`  Rename fly_patterns_v2 fork: "${forkV2.name}" → "${newName}"`);
      if (APPLY) {
        const { error } = await sb.from("fly_patterns_v2").update({ name: newName }).eq("id", FORK_ID);
        if (error) throw new Error(`fork v2 rename: ${error.message}`);
      }
    } else {
      say(`  fly_patterns_v2 fork ${FORK_ID} already correct.`);
    }
  }

  // ───── Step 5: pre-delete safety check + delete loser
  if (loser && !APPLY) {
    say(`  (dry-run: skipping pre-delete guards + delete — they require Step 2/3 to have actually committed)`);
  }
  if (loser && APPLY) {
    const guards = [
      { table: "catches", col: "fly_pattern_id", id: LOSER_ID },
      { table: "catches", col: "fly_pattern_id", id: LEGACY_TIED },
      { table: "user_fly_box", col: "canonical_fly_id", id: LOSER_ID },
      { table: "user_fly_box", col: "fly_pattern_id", id: LOSER_ID },
      { table: "fly_pattern_submissions", col: "pattern_id", id: LOSER_ID },
      { table: "fly_pattern_submissions", col: "canonical_fly_id", id: LOSER_ID },
    ];
    for (const g of guards) {
      const { count, error } = await sb
        .from(g.table)
        .select("*", { count: "exact", head: true })
        .eq(g.col, g.id);
      if (error) {
        // table may not exist in this schema — skip
        say(`  (skip guard ${g.table}.${g.col}=${g.id}: ${error.message})`);
        continue;
      }
      if ((count ?? 0) > 0) {
        throw new Error(
          `Aborting delete: ${g.table}.${g.col} still has ${count} row(s) pointing at ${g.id}`,
        );
      }
    }

    // variant-level guard: any remaining loser variants must have zero refs
    const { data: leftover } = await sb.from("fly_variants").select("id").eq("pattern_id", LOSER_ID);
    for (const v of leftover ?? []) {
      const { count: c1 } = await sb
        .from("catches")
        .select("*", { count: "exact", head: true })
        .eq("variant_id", v.id);
      const { count: c2 } = await sb
        .from("fly_variant_stock")
        .select("*", { count: "exact", head: true })
        .eq("variant_id", v.id);
      if ((c1 ?? 0) + (c2 ?? 0) > 0) {
        throw new Error(`Aborting: loser variant ${v.id} still has ${c1} catch + ${c2} stock`);
      }
    }

    say(`  Delete ${leftover?.length ?? 0} orphan loser variants + loser canonical row.`);
    if (APPLY) {
      const { error: e1 } = await sb.from("fly_variants").delete().eq("pattern_id", LOSER_ID);
      if (e1) throw new Error(`delete variants: ${e1.message}`);
      const { error: e2 } = await sb.from("fly_patterns_v2").delete().eq("id", LOSER_ID);
      if (e2) throw new Error(`delete fly_patterns_v2: ${e2.message}`);
      // canonical_flies row by same id (none expected; safe no-op if missing)
      await sb.from("canonical_flies").delete().eq("id", LOSER_ID);
    }
  }

  // Delete Taylor's legacy "Lite Bright Perdigon" fly_patterns row (catch already migrated)
  const { data: legacyTied } = await sb
    .from("fly_patterns")
    .select("id, name")
    .eq("id", LEGACY_TIED)
    .maybeSingle();
  if (legacyTied && !APPLY) {
    say(`  (dry-run: would delete legacy fly_patterns row ${LEGACY_TIED} after catches migrate)`);
  }
  if (legacyTied && APPLY) {
    const { count: cleft } = await sb
      .from("catches")
      .select("*", { count: "exact", head: true })
      .eq("fly_pattern_id", LEGACY_TIED);
    if ((cleft ?? 0) > 0) {
      throw new Error(`Aborting: ${LEGACY_TIED} still has ${cleft} catches`);
    }
    say(`  Delete legacy fly_patterns row ${LEGACY_TIED} (${legacyTied.name}).`);
    if (APPLY) {
      const { error } = await sb.from("fly_patterns").delete().eq("id", LEGACY_TIED);
      if (error) throw new Error(`delete legacy fly_patterns: ${error.message}`);
    }
  }

  // ───── Step 6: post-condition report
  const { data: remaining } = await sb
    .from("fly_patterns_v2")
    .select("id, slug, name, owner_user_id")
    .or(`name.ilike.%lite br%,slug.ilike.%lite-br%,name.ilike.%bright%`);
  say(`\nPost-state: ${remaining?.length ?? 0} fly_patterns_v2 row(s) match "lite br|bright":`);
  for (const r of remaining ?? []) {
    say(`  - ${r.name} (${r.slug ?? "no-slug"}) owner=${r.owner_user_id ?? "canonical"}`);
  }

  say(`\nDone (${APPLY ? "APPLIED" : "dry-run"}).`);
}

main()
  .catch((e) => {
    say(`ERROR: ${(e as Error).message}`);
    writeLog();
    process.exit(1);
  })
  .then(writeLog);
