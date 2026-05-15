/**
 * /anglers/[username]/flies/[slug] — DEPRECATED, redirect-only handler.
 *
 * After the 2026-05-15 fly model reset, personal-fork detail pages no
 * longer exist. Every fly has one canonical URL at /flies/[slug].
 *
 * This handler exists solely to keep old bookmarks and external links
 * working. It looks up the personal v2 pattern that used to live at
 * this URL and redirects to the best canonical match:
 *
 *   1. fly_slug_redirects     — explicit Phase B dedup decision.
 *   2. inspired_by_fly_id     — pattern was forked from a canonical.
 *   3. exact name match       — same fly name in `flies` (approved).
 *   4. otherwise              — /flies (library) with a notice.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata() {
  return { robots: { index: false, follow: false } };
}

export default async function AnglerFlyRedirect({ params }: Props) {
  const { username, slug } = await params;
  const supabase = await createClient();

  // 1. Slug-redirect table override (Phase B dedup outputs land here).
  const personalKey = `anglers/${username.toLowerCase()}/flies/${slug}`;
  const { data: explicit } = await supabase
    .from("fly_slug_redirects")
    .select("to_slug")
    .eq("from_slug", personalKey)
    .maybeSingle();
  if (explicit?.to_slug) redirect(`/flies/${explicit.to_slug as string}`);

  // 2. Resolve profile + the personal v2 fly that lived at this URL.
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!profile?.user_id) redirect("/flies");

  // Post-Phase-C: the personal v2 table is gone. Look up the corresponding
  // private fly (imported during Phase A as "fly-private-<short-id>") and
  // follow its inspired_by_fly_id or name to a canonical match.
  // The submitter is the original owner.
  const { data: pv } = await supabase
    .from("flies")
    .select("id, name, inspired_by_fly_id")
    .eq("submitted_by_user_id", profile.user_id)
    .or(`slug.eq.${slug},slug.ilike.fly-private-%`)
    .ilike("name", slug.replace(/-/g, " "))
    .maybeSingle();
  if (!pv) redirect("/flies");

  // 3. inspired_by_fly_id → canonical slug.
  if (pv.inspired_by_fly_id) {
    const { data: parent } = await supabase
      .from("flies")
      .select("slug, status")
      .eq("id", pv.inspired_by_fly_id as string)
      .maybeSingle();
    if (parent?.slug && parent.status === "approved") {
      redirect(`/flies/${parent.slug as string}`);
    }
  }

  // 4. Exact-name match in approved canonicals.
  if (pv.name) {
    const { data: match } = await supabase
      .from("flies")
      .select("slug")
      .ilike("name", pv.name as string)
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();
    if (match?.slug) redirect(`/flies/${match.slug as string}`);
  }

  // 5. Last resort: send to the library with a notice param the page can
  //    use to show a small banner ("the fly you linked to no longer has
  //    its own page — search for it here").
  redirect("/flies?moved=1");
}
