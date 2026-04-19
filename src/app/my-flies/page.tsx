import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMyPatterns,
  getMyFlyBox,
  getTieNextQueue,
  getSharedWithMe,
  getMyFliesCounts,
} from "@/lib/db/fly-patterns";
import MyFliesClient from "./MyFliesClient";

export const metadata = {
  title: "My Flies | Executive Angler",
  description:
    "Your personal fly box, tying workbench, tie-next queue, and flies shared with you.",
};

export const dynamic = "force-dynamic";

type SearchParams = { tab?: string };

export default async function MyFliesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/my-flies");

  const { data: profile } = await supabase
    .from("profiles")
    .select("ties_own_flies, display_name, username")
    .eq("user_id", user.id)
    .maybeSingle();
  const tiesOwnFlies = profile?.ties_own_flies !== false; // default true when column missing

  const { tab } = await searchParams;

  const [myPatterns, flyBoxEntries, tieNext, shared, counts] = await Promise.all([
    getMyPatterns(user.id),
    getMyFlyBox(user.id),
    getTieNextQueue(user.id),
    getSharedWithMe(user.id),
    getMyFliesCounts(user.id),
  ]);

  // Canonical name lookup for "Submit to library" CTA on personal cards
  const { data: canonicalNamesData } = await supabase
    .from("canonical_flies")
    .select("name");
  const canonicalNames = (canonicalNamesData ?? []).map((f: { name: string }) =>
    f.name.toLowerCase().trim()
  );

  return (
    <MyFliesClient
      initialTab={tab}
      tiesOwnFlies={tiesOwnFlies}
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
