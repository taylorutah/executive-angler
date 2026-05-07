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
import { getMyBoxes } from "@/lib/db/fly-boxes";
import {
  getMyPatterns,
  getMyFlyBox,
  getTieNextQueue,
  getSharedWithMe,
  getMyFliesCounts,
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

  const [boxes, myPatterns, flyBoxEntries, tieNext, shared, counts] = await Promise.all([
    getMyBoxes(user.id),
    getMyPatterns(user.id),
    getMyFlyBox(user.id),
    getTieNextQueue(user.id),
    getSharedWithMe(user.id),
    getMyFliesCounts(user.id),
  ]);

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
      myPatterns={myPatterns}
      flyBoxEntries={flyBoxEntries}
      tieNextPatterns={tieNext.patterns}
      tieNextBoxEntries={tieNext.boxEntries}
      shared={shared}
      counts={counts}
      canonicalNames={canonicalNames}
    />
  );
}
