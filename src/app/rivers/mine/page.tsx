import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyFavoriteSections, listMyFavoritedRiversMissingSections } from "@/lib/db/favorite-sections";

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
    <article className="min-h-[70vh] bg-[var(--surface-page)]">
      <div className="mx-auto max-w-[780px] px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--action)]">
          Watchlist
        </p>
        <h1 className="mt-2 font-heading text-4xl text-[var(--text-primary)]">Your rivers</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--text-body)]">
          The sections you watch. Flow shows up on Today. Nothing here is public.
        </p>

        {sections.length === 0 ? (
          <p className="mt-10 text-[17px] text-[var(--text-body)]">
            No rivers watched yet.{" "}
            <Link href="/rivers" className="text-[var(--action)] hover:underline">
              Open the river index
            </Link>{" "}
            and pin a section.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/rivers/${s.river_slug}`}
                  className="flex items-baseline justify-between gap-4 py-4 hover:text-[var(--action)]"
                >
                  <span className="text-[17px] text-[var(--text-primary)]">
                    {s.river_name}
                    {s.section_name ? (
                      <span className="ml-2 text-[13px] text-[var(--text-meta)]">
                        {s.section_name}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[var(--action)]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
