import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyFavoriteSections, listMyFavoritedRiversMissingSections } from "@/lib/db/favorite-sections";
import MyRiversTable from "./MyRiversTable";
import FirstRunEmpty from "@/app/today/FirstRunEmpty";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your rivers",
  description: "The water you watch.",
  robots: { index: false, follow: false },
};

export default async function MyRiversPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/rivers/mine");

  const sections = [
    ...(await listMyFavoriteSections()),
    ...(await listMyFavoritedRiversMissingSections()),
  ];

  return (
    <article className="min-h-[70vh] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--prose)] px-4 py-12 sm:px-6 sm:py-16">
        <p className="ea-overline">
          Watchlist
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--text-1)] sm:text-3xl">Your rivers</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-[var(--text-2)]">
          The sections you watch. Flow shows up on Today. Nothing here is public.
        </p>

        {sections.length === 0 ? (
          <FirstRunEmpty
            surface="rivers-mine"
            purpose="This list is the water you watch. Flow from here shows up on Today. Nothing here is public."
            actionHref="/rivers"
            actionLabel="Open the river index"
            example="The Madison page lists Lyons Bridge FAS as public access. Pin a section there. Watching does not turn alerts on."
          />
        ) : (
          <MyRiversTable
            sections={sections.map((s) => ({
              id: s.id,
              river_id: s.river_id,
              river_slug: s.river_slug,
              river_name: s.river_name,
              section_name: s.section_name ?? null,
              position: s.position,
            }))}
          />
        )}
      </div>
    </article>
  );
}
