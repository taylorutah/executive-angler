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
import {
  getMyPatterns,
  getMyFlyBox,
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
  const [myPatterns, flyBoxEntries, tieNext, shared, counts, boxStats, derivedShortages] = await Promise.all([
    getMyPatterns(user.id),
    getMyFlyBox(user.id),
    getTieNextQueue(user.id),
    getSharedWithMe(user.id),
    getMyFliesCounts(user.id),
    listBoxStats(boxes.map((b) => b.id)),
    listDerivedTieNextShortages(),
  ]);

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
      tieNextPatterns={tieNext.patterns}
      tieNextBoxEntries={tieNext.boxEntries}
      tieNextDerivedVariants={derivedShortages}
      shared={shared}
      sharedOwnerUsernames={Object.fromEntries(sharedOwnerUsernames)}
      counts={counts}
      canonicalNames={canonicalNames}
      viewerUsername={(profile?.username as string | undefined) ?? null}
    />
  );
}
