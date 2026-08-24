/**
 * /rivers/mine — the signed-in user's saved rivers.
 *
 * Replaces /favorites as the canonical "my rivers" URL. Lists
 * user_favorites rows where entity_type is river; hydrates names via
 * getRiversByIds. Private — not in the sitemap.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRiversByIds } from "@/lib/db";

export const metadata: Metadata = {
  title: "My Rivers",
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
    <div className="min-h-screen bg-[var(--color-bg)] pt-6 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)] mb-8">
          My Rivers
        </h1>

        {ordered.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-surface)] rounded-xl">
            <h2 className="font-heading text-xl font-semibold text-[var(--color-text-secondary)] mb-2">
              No saved rivers yet
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              Save a river from its page to see it here.
            </p>
            <Link
              href="/rivers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-medium rounded-lg"
            >
              Browse rivers
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {ordered.map((river) => (
              <li key={river.id}>
                <Link
                  href={`/rivers/${river.slug}`}
                  className="block p-4 bg-[var(--color-surface)] rounded-xl font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {river.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
