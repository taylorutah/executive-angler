/**
 * /flies — authenticated fly management hub.
 *
 * Five tabs: Boxes · Patterns · Workbench · Tie Next · Shared. Replaces
 * the previous separate top-nav items (My Boxes, My Flies, Workbench).
 *
 * Logged-out visitors are sent to /flies/library — the public canonical fly
 * library that previously lived at /flies (renamed here so the hub URL
 * matches the new top-nav label).
 */
import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { listMyBoxes, listBoxStats } from "@/lib/db/fly-v2";
import { listMyPatternsHub, listMyConfigurationsWithFly } from "@/lib/db/fly-model";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import type { FlyPattern } from "@/types/fishing-log";
import type { VariantRow } from "@/types/fly-v2";
import FliesHubClient from "./FliesHubClient";
import { resolveTierDefinitions } from "@/lib/flies/tier-definitions";

export const metadata: Metadata = {
  title: "Flies",
  description:
    "Your fly boxes, personal patterns, tying workbench, tie-next queue, and shared flies — one place.",
};

export const dynamic = "force-dynamic";

type SearchParams = { tab?: string };

export default async function FliesHubPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) permanentRedirect("/flies/library");

  // Phase 6 cutover: the workspace replaces the old "Patterns" tab as the
  // default landing for /flies. The other tabs (Boxes, Workbench, Tie Next,
  // Shared) continue to render via the legacy FliesHubClient until their
  // own dedicated routes are migrated. Hand off the workspace's URL params
  // verbatim so `?clone=...`, `?view=...`, etc. keep working.
  const sp = await searchParams;
  const tab = sp.tab ?? "patterns";
  if (tab === "patterns") {
    // Preserve any non-tab params (clone, view, source, …) when redirecting.
    const carry = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "tab" || v === undefined) continue;
      carry.set(k, v);
    }
    const qs = carry.toString();
    permanentRedirect(qs ? `/flies/workspace?${qs}` : "/flies/workspace");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("ties_own_flies, display_name, username, tier_descriptions, tier_definitions")
    .eq("user_id", user.id)
    .maybeSingle();
  const tiesOwnFlies = profile?.ties_own_flies !== false;
  const tierDefinitions = resolveTierDefinitions(
    profile?.tier_definitions,
    profile?.tier_descriptions as Record<string, string> | null,
  );

  const boxes = await listMyBoxes();
  // Post-Phase-C: legacy queries (getMyPatterns, getMyFlyBox,
  // getMyV2PersonalVariants, getTieNextQueue, getSharedWithMe,
  // getMyFliesCounts) target dropped tables. Their results were only
  // consumed by the legacy <PatternsTab /> + <TieNextKanban />, which
  // have been replaced by <PatternsHub /> + <TieNextHub /> (both read
  // from `flies` + `user_fly_configurations`). Skip them entirely.
  const [boxStats, patternsHubRows] = await Promise.all([
    listBoxStats(boxes.map((b) => b.id)),
    listMyPatternsHub(),
  ]);
  const tieNextConfigurations = await listMyConfigurationsWithFly({ tieNextOnly: true });

  // Empty stubs for the legacy props FliesHubClient still expects.
  // PatternsHub + TieNextHub ignore them; deleting the props would touch
  // every legacy component import. Cheaper to pass [] here.
  const myPatterns: FlyPattern[] = [];
  const flyBoxEntries: FlyBoxEntry[] = [];
  const tieNext = { patterns: [] as FlyPattern[], boxEntries: [] as FlyBoxEntry[] };
  const shared: FlyPattern[] = [];
  const derivedShortages: VariantRow[] = [];
  const counts = { box: 0, favorites: 0, tieNext: 0, sharedWithMe: 0 };
  const sharedOwnerUsernames: Map<string, string> = new Map();

  // Recompute counts from the new schema. The legacy getMyFliesCounts()
  // still queries dropped tables — its results are 0s post-Phase-C.
  // "Patterns" = distinct flies the user has any version of (= hub rows).
  // "Favorites" / "Tie Next" = configurations with the matching flag.
  // "Shared with me" stays on the legacy `counts.sharedWithMe` field since
  // shared-fly model isn't migrated yet.
  const activeTieNext = tieNextConfigurations.filter(
    (c) => c.tie_next_status === "wanted" || c.tie_next_status === "at_vise",
  ).length;
  const favoritesCount = patternsHubRows.filter((r) => r.favorite_any).length;
  const finalCounts = {
    ...counts,
    box: patternsHubRows.length,
    favorites: favoritesCount,
    tieNext: activeTieNext,
  };

  const { data: canonicalNamesData } = await supabase
    .from("canonical_flies")
    .select("name");
  const canonicalNames = (canonicalNamesData ?? []).map((f: { name: string }) =>
    f.name.toLowerCase().trim(),
  );

  return (
    <FliesHubClient
      initialTab={tab}
      tiesOwnFlies={tiesOwnFlies}
      boxes={boxes}
      boxStats={boxStats}
      myPatterns={myPatterns}
      flyBoxEntries={flyBoxEntries}
      patternsHubRows={patternsHubRows}
      tieNextConfigurations={tieNextConfigurations}
      tieNextPatterns={tieNext.patterns}
      tieNextBoxEntries={tieNext.boxEntries}
      tieNextDerivedVariants={derivedShortages}
      shared={shared}
      sharedOwnerUsernames={Object.fromEntries(sharedOwnerUsernames)}
      counts={finalCounts}
      canonicalNames={canonicalNames}
      viewerUserId={user.id}
      viewerUsername={(profile?.username as string | undefined) ?? null}
      viewerIsAdmin={isAdmin(user.email)}
      tierDefinitions={tierDefinitions}
    />
  );
}
