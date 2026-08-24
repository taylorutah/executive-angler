/**
 * /rivers/mine — the signed-in user's watched rivers.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRiversByIds } from "@/lib/db";
import { brandedTitle } from "@/lib/seo";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

export const metadata: Metadata = {
  title: brandedTitle("Watchlist"),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MyRiversPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/rivers/mine");

  const { data: favs } = await supabase
    .from("user_favorites")
    .select("entity_id, created_at")
    .eq("user_id", user.id)
    .eq("entity_type", "river")
    .order("created_at", { ascending: false });

  const ids = (favs ?? []).map((f) => f.entity_id as string);
  const rivers = await getRiversByIds(ids);
  const byId = new Map(rivers.map((r) => [r.id, r]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <div className="mx-auto w-full max-w-[780px] px-6 py-10 sm:py-14">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
          Watchlist
        </p>
        <h1 className="mt-3 font-heading text-[clamp(2rem,5vw,2.75rem)] font-semibold text-[var(--text-primary)]">
          Rivers you watch.
        </h1>

        {ordered.length === 0 ? (
          <div className="mt-10">
            <p className="text-[17px] leading-relaxed text-[var(--text-body)]">
              Save a river from its page. Flow relative to the last time you
              fished it shows up on Today.
            </p>
            <p className="mt-6">
              <Link
                href="/rivers"
                className={`inline-flex items-center rounded-md border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] ${FOCUS_VISIBLE}`}
              >
                Browse rivers
              </Link>
            </p>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-[var(--border-rule)]">
            {ordered.map((river) => (
              <li key={river.id}>
                <Link
                  href={`/rivers/${river.slug}`}
                  className={`block py-4 font-heading text-xl text-[var(--text-primary)] hover:text-[var(--action)] ${FOCUS_VISIBLE}`}
                >
                  {river.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
