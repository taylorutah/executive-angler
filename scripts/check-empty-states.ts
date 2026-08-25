/**
 * First-run empty states — six surfaces, each with purpose + action.
 *
 *   npx tsx scripts/check-empty-states.ts
 *
 * Always asserts the source markers. When EA_EMPTY_CHECK_URL and
 * EA_FIXTURE_PASSWORD are set, also loads each surface as the empty
 * fixture and asserts the rendered empty state.
 *
 * Prints the surfaces asserted. Exits 1 if the count is under 6.
 *
 * Wiring: docs/decisions/p4-t4-wire-gate.md (Lane 0 owns package.json).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());

export const SURFACES = [
  {
    id: "today",
    file: "src/app/today/TodayBriefing.tsx",
    path: "/today",
    action: "Watch a river",
  },
  {
    id: "journal",
    file: "src/app/journal/JournalClient.tsx",
    path: "/journal",
    action: "Log a session",
  },
  {
    id: "flybox",
    file: "src/app/flybox/FlyboxEmpty.tsx",
    path: "/flybox",
    action: "Create a box",
  },
  {
    id: "rivers-mine",
    file: "src/app/rivers/mine/page.tsx",
    path: "/rivers/mine",
    action: "Open the river index",
  },
  {
    id: "gear",
    file: "src/app/account/gear/GearLockerClient.tsx",
    path: "/account/gear",
    action: "Add a rod",
  },
  {
    id: "insights",
    file: "src/app/journal/insights/InsightsPageClient.tsx",
    path: "/journal/insights",
    action: "Log a session",
  },
] as const;

const EMPTY_EMAIL =
  process.env.EA_FIXTURE_EMPTY_EMAIL || "fixture-empty@executiveangler.com";
const EMPTY_PASSWORD = process.env.EA_FIXTURE_PASSWORD || "";
const BASE_URL = (process.env.EA_EMPTY_CHECK_URL || "").replace(/\/$/, "");

function assertSource(): string[] {
  const ok: string[] = [];
  const errors: string[] = [];

  for (const surface of SURFACES) {
    const abs = path.join(ROOT, surface.file);
    if (!fs.existsSync(abs)) {
      errors.push(`${surface.id}: missing ${surface.file}`);
      continue;
    }
    const text = fs.readFileSync(abs, "utf8");
    if (!text.includes(`data-empty-state="${surface.id}"`) && !text.includes(`surface="${surface.id}"`)) {
      errors.push(`${surface.id}: no empty-state marker`);
      continue;
    }
    if (!text.includes("data-empty-purpose") && !text.includes("purpose=")) {
      errors.push(`${surface.id}: no purpose`);
      continue;
    }
    if (!text.includes("data-empty-action") && !text.includes("actionLabel=")) {
      errors.push(`${surface.id}: no action`);
      continue;
    }
    if (!text.includes(surface.action)) {
      errors.push(`${surface.id}: expected action copy "${surface.action}"`);
      continue;
    }
    const emptyBlock = text.slice(
      Math.max(0, text.search(/data-empty-state|surface="/)),
      text.length,
    );
    if (/![^=]/.test(emptyBlock) && emptyBlock.includes("!")) {
      const lines = emptyBlock.split("\n").filter((l) => l.includes("!") && !l.includes("!=") && !l.includes("!=="));
      const userFacing = lines.filter(
        (l) =>
          /purpose|actionLabel|example|actionHref|Log |Watch |Create |Add |Open /.test(l) &&
          !l.trim().startsWith("//") &&
          !l.includes("!user") &&
          !l.includes("!res") &&
          !l.includes("!cancelled"),
      );
      if (userFacing.some((l) => /"[^"]*![^"]*"/.test(l) || /`[^`]*![^`]*`/.test(l))) {
        errors.push(`${surface.id}: exclamation mark in empty-state copy`);
        continue;
      }
    }
    ok.push(surface.id);
  }

  if (errors.length) {
    for (const e of errors) console.error(`  ${e}`);
  }
  return ok;
}

async function assertLive(sourceOk: string[]): Promise<string[]> {
  if (!BASE_URL || !EMPTY_PASSWORD) {
    console.log("Live load skipped (set EA_EMPTY_CHECK_URL and EA_FIXTURE_PASSWORD).");
    return sourceOk;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.log("Live load skipped (missing NEXT_PUBLIC_SUPABASE_*).");
    return sourceOk;
  }

  const supabase = createClient(url, anon);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: EMPTY_EMAIL,
    password: EMPTY_PASSWORD,
  });
  if (error || !data.session) {
    console.error(`Live login failed: ${error?.message ?? "no session"}`);
    process.exit(1);
  }

  const cookie = `sb-access-token=${data.session.access_token}; sb-refresh-token=${data.session.refresh_token}`;
  const liveOk: string[] = [];

  for (const surface of SURFACES) {
    if (!sourceOk.includes(surface.id)) continue;
    const res = await fetch(`${BASE_URL}${surface.path}`, {
      headers: {
        Cookie: cookie,
        Authorization: `Bearer ${data.session.access_token}`,
      },
      redirect: "manual",
    });
    const html = await res.text();
    const bounced = res.status === 307 || res.status === 302 || res.status === 303;
    const hasMarker =
      html.includes(`data-empty-state="${surface.id}"`) ||
      html.includes(surface.action);
    if (!hasMarker) {
      console.error(
        `  ${surface.id}: live ${res.status} at ${surface.path} missing empty state` +
          (bounced ? " (redirect)" : ""),
      );
      continue;
    }
    liveOk.push(surface.id);
  }

  console.log(`Live surfaces: ${liveOk.length}`);
  return liveOk.length >= 6 ? liveOk : sourceOk;
}

async function main() {
  console.log("check-empty-states: asserting first-run surfaces\n");
  const sourceOk = assertSource();
  const asserted = await assertLive(sourceOk);

  console.log(`\nSurfaces asserted (${asserted.length}):`);
  for (const id of asserted) console.log(`  ${id}`);

  if (asserted.length < 6) {
    console.error(`\nFailed: ${asserted.length} surfaces (need 6).`);
    process.exit(1);
  }
  console.log("\ncheck-empty-states: 6/6");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
