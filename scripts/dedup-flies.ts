/**
 * Interactive dedup CLI for the May 13 personal-fork survivors.
 *
 * Usage:
 *   tsx scripts/dedup-flies.ts
 *
 * Reads `_fly_dedup_candidates` where decision = 'pending'. For each
 * candidate, prints child + parent fly info side-by-side and prompts:
 *
 *   k = keep both with attribution (set child.inspired_by_fly_id =
 *       parent.id, promote child to status='approved')
 *   m = merge child into parent (move every configuration's fly_id
 *       from child → parent, soft-delete child via status='rejected',
 *       insert slug redirect, dedup queue entry decision='merge')
 *   s = skip — leave child as status='private', decision='skip'
 *   q = quit
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import * as readline from "node:readline";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createSupabaseClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Candidate = {
  id: string;
  child_fly_id: string | null;
  parent_fly_id: string | null;
  similarity_score: number | null;
  reason: string | null;
  decision: string | null;
};

type FlyRow = {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  description: string | null;
  status: string;
  materials_list: unknown;
  submitted_by_user_id: string | null;
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function prompt(q: string): Promise<string> {
  return new Promise((res) => rl.question(q, (ans) => res(ans.trim())));
}

async function fetchFly(id: string | null): Promise<FlyRow | null> {
  if (!id) return null;
  const { data } = await sb.from("flies").select("*").eq("id", id).maybeSingle();
  return (data as FlyRow | null) ?? null;
}

function renderFly(label: string, fly: FlyRow | null) {
  console.log(`\n┌── ${label} ──────────────────────────────────────────`);
  if (!fly) { console.log("│ (not found)"); console.log("└──────────────────────────────────────────────────────────"); return; }
  console.log(`│  id:       ${fly.id}`);
  console.log(`│  name:     ${fly.name}`);
  console.log(`│  slug:     ${fly.slug ?? "—"}`);
  console.log(`│  category: ${fly.category ?? "—"}`);
  console.log(`│  status:   ${fly.status}`);
  if (fly.description) {
    const desc = fly.description.replace(/\s+/g, " ").slice(0, 220);
    console.log(`│  about:    ${desc}${fly.description.length > 220 ? "…" : ""}`);
  }
  const ml = Array.isArray(fly.materials_list) ? fly.materials_list : [];
  if (ml.length) {
    console.log(`│  recipe (${ml.length} slot${ml.length === 1 ? "" : "s"}):`);
    for (const m of ml.slice(0, 6)) {
      const rec = m as { slot?: string; label?: string; default?: Record<string, unknown> };
      const det = rec.default
        ? [rec.default.material, rec.default.color, rec.default.size_mm ? `${rec.default.size_mm}mm` : null]
            .filter(Boolean).join(" · ")
        : "";
      console.log(`│    • ${rec.label ?? rec.slot ?? "?"}: ${det || "—"}`);
    }
    if (ml.length > 6) console.log(`│    … and ${ml.length - 6} more`);
  }
  console.log("└──────────────────────────────────────────────────────────");
}

async function mergeChildIntoParent(candidateId: string, childId: string, parentId: string) {
  // Re-point user_fly_configurations to the parent.
  const { error: cfgErr } = await sb
    .from("user_fly_configurations")
    .update({ fly_id: parentId })
    .eq("fly_id", childId);
  if (cfgErr) { console.error("configuration repoint failed:", cfgErr); return false; }

  // Add a slug redirect (best-effort — only useful if the child has a slug).
  const child = await fetchFly(childId);
  if (child?.slug) {
    const parent = await fetchFly(parentId);
    if (parent?.slug) {
      await sb.from("fly_slug_redirects").upsert({
        from_slug: child.slug,
        to_slug: parent.slug,
        reason: "merged_dup",
      }, { onConflict: "from_slug" });
    }
  }

  // Soft-delete the child (status='rejected' so it stays out of every view).
  const { error: rejErr } = await sb
    .from("flies")
    .update({ status: "rejected", reject_reason: "Merged into a canonical via dedup CLI" })
    .eq("id", childId);
  if (rejErr) { console.error("child soft-delete failed:", rejErr); return false; }

  await sb
    .from("_fly_dedup_candidates")
    .update({ decision: "merge", decided_at: new Date().toISOString() })
    .eq("id", candidateId);
  return true;
}

async function keepBothWithAttribution(candidateId: string, childId: string, parentId: string) {
  const { error: attErr } = await sb
    .from("flies")
    .update({ inspired_by_fly_id: parentId, status: "approved", approved_at: new Date().toISOString() })
    .eq("id", childId);
  if (attErr) { console.error("attribution update failed:", attErr); return false; }
  await sb
    .from("_fly_dedup_candidates")
    .update({ decision: "keep_both", decided_at: new Date().toISOString() })
    .eq("id", candidateId);
  return true;
}

async function skipCandidate(candidateId: string) {
  await sb
    .from("_fly_dedup_candidates")
    .update({ decision: "skip", decided_at: new Date().toISOString() })
    .eq("id", candidateId);
}

async function main() {
  const { data: pending, error } = await sb
    .from("_fly_dedup_candidates")
    .select("id, child_fly_id, parent_fly_id, similarity_score, reason, decision")
    .eq("decision", "pending")
    .order("similarity_score", { ascending: false, nullsFirst: false });
  if (error) { console.error("query failed:", error); process.exit(1); }
  const cands = (pending ?? []) as Candidate[];
  if (cands.length === 0) {
    console.log("No pending dedup candidates. All done.");
    rl.close();
    return;
  }
  console.log(`\n${cands.length} pending candidates.\n`);

  let i = 0;
  for (const c of cands) {
    i++;
    console.log(`\n══════════ ${i}/${cands.length} ══════════`);
    console.log(`reason: ${c.reason ?? "—"}   similarity: ${c.similarity_score ?? "—"}`);
    const [child, parent] = await Promise.all([
      fetchFly(c.child_fly_id),
      fetchFly(c.parent_fly_id),
    ]);
    renderFly("CHILD (personal fork)", child);
    renderFly("PARENT (canonical match)", parent);

    if (!child) {
      console.log("Child missing — skipping.");
      await skipCandidate(c.id);
      continue;
    }

    let ans = "";
    while (!["k", "m", "s", "q"].includes(ans)) {
      ans = (await prompt("\n[k]eep both / [m]erge / [s]kip / [q]uit  > ")).toLowerCase();
    }
    if (ans === "q") break;
    if (ans === "k" && parent) {
      const ok = await keepBothWithAttribution(c.id, child.id, parent.id);
      console.log(ok ? "  → kept both, attributed to parent." : "  → failed.");
    } else if (ans === "k" && !parent) {
      console.log("  → no parent — promoting standalone.");
      await sb.from("flies").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", child.id);
      await skipCandidate(c.id);
    } else if (ans === "m" && parent) {
      const ok = await mergeChildIntoParent(c.id, child.id, parent.id);
      console.log(ok ? "  → merged into parent." : "  → failed.");
    } else if (ans === "m" && !parent) {
      console.log("  → no parent to merge into. Skipping.");
      await skipCandidate(c.id);
    } else {
      await skipCandidate(c.id);
      console.log("  → skipped.");
    }
  }

  // Summary.
  const { data: after } = await sb
    .from("_fly_dedup_candidates")
    .select("decision");
  const counts: Record<string, number> = {};
  for (const r of (after ?? [])) counts[(r as { decision: string }).decision] = (counts[(r as { decision: string }).decision] ?? 0) + 1;
  console.log("\nFinal queue state:");
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
  rl.close();
}

main().catch((e) => { console.error(e); rl.close(); process.exit(1); });
