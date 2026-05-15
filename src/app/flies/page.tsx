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
import { listMyBoxes, listBoxStats, listDerivedTieNextShortages } from "@/lib/db/fly-v2";
import { listMyPatternsHub } from "@/lib/db/fly-model";
import {
  getMyPatterns,
  getMyFlyBox,
  getMyV2PersonalVariants,
  getTieNextQueue,
  getSharedWithMe,
  getMyFliesCounts,
  attachPromotedCanonicalSlugs,
  lookupAnglerUsernames,
} from "@/lib/db/fly-patterns";
import FliesHubClient from "./FliesHubClient";

export const metadata: Metadata = {
  title: "Flies — Executive Angler",
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("ties_own_flies, display_name, username")
    .eq("user_id", user.id)
    .maybeSingle();
  const tiesOwnFlies = profile?.ties_own_flies !== false;

  const { tab } = await searchParams;

  const boxes = await listMyBoxes();
  const [myPatternsRaw, flyBoxEntriesLegacy, flyBoxEntriesV2, tieNext, shared, counts, boxStats, derivedShortages, patternsHubRows] = await Promise.all([
    getMyPatterns(user.id),
    getMyFlyBox(user.id),
    getMyV2PersonalVariants(user.id),
    getTieNextQueue(user.id),
    getSharedWithMe(user.id),
    getMyFliesCounts(user.id),
    listBoxStats(boxes.map((b) => b.id)),
    listDerivedTieNextShortages(),
    listMyPatternsHub(),
  ]);

  // After the 2026-05-14 explode migration personal patterns live in v2 as
  // first-class variants. Merge them into flyBoxEntries so they render as
  // library-style rolled-up cards, and drop the matching legacy fly_patterns
  // rows from `myPatterns` so they don't double up alongside the v2 surface.
  const flyBoxEntries = [...flyBoxEntriesLegacy, ...flyBoxEntriesV2];
  const v2PatternIds = new Set(flyBoxEntriesV2.map((e) => e.canonical_fly_id).filter((x): x is string => !!x));
  const myPatterns = myPatternsRaw.filter((p) => !v2PatternIds.has(p.id));

  // Attach promoted canonical slugs so link builders can route directly to
  // /flies/<slug> for any pattern that has been accepted into the library.
  // Also resolve shared-pattern owners' usernames for /anglers/<u>/flies/<slug>.
  await Promise.all([
    attachPromotedCanonicalSlugs(myPatterns),
    attachPromotedCanonicalSlugs(tieNext.patterns),
    attachPromotedCanonicalSlugs(shared),
  ]);
  const sharedOwnerUsernames = await lookupAnglerUsernames(
    shared.map((p) => p.user_id),
  );

  // Badge count must mirror what the kanban renders: manual queue items
  // (excluding "done", which lives in its own transient column) plus the
  // auto-derived shortages that `getMyFliesCounts` doesn't see.
  const activeTieNext =
    tieNext.patterns.filter((p) => p.tie_next_status !== "done").length +
    tieNext.boxEntries.filter((b) => b.tie_next_status !== "done").length +
    derivedShortages.length;
  const finalCounts = { ...counts, tieNext: activeTieNext };

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
      tieNextPatterns={tieNext.patterns}
      tieNextBoxEntries={tieNext.boxEntries}
      tieNextDerivedVariants={derivedShortages}
      shared={shared}
      sharedOwnerUsernames={Object.fromEntries(sharedOwnerUsernames)}
      counts={finalCounts}
      canonicalNames={canonicalNames}
      viewerUsername={(profile?.username as string | undefined) ?? null}
    />
  );
}
