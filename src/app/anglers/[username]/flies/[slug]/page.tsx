import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { Lock, Globe2, Edit3, ArrowLeft } from "lucide-react";
import { toYouTubeEmbedUrl } from "@/lib/video-embed";
import SubmitToLibraryButton from "@/components/flies/SubmitToLibraryButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, username, display_name")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!profile) return { title: "Not Found" };

  const { data: fly } = await supabase
    .from("fly_patterns")
    .select("name, type, description, image_url, visibility")
    .eq("user_id", profile.user_id)
    .eq("slug", slug)
    .maybeSingle();
  if (!fly) return { title: "Not Found" };

  const isPublic = fly.visibility === "public";
  return {
    title: `${fly.name} — by @${profile.username}`,
    description: fly.description?.slice(0, 160) || `${fly.name} fly pattern by @${profile.username}.`,
    openGraph: {
      title: `${fly.name} — by @${profile.username}`,
      description: fly.description?.slice(0, 160),
      images: fly.image_url ? [fly.image_url] : undefined,
    },
    robots: isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function AnglerFlyDetailPage({ params }: Props) {
  const { username, slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!profile) notFound();

  const { data: fly } = await supabase
    .from("fly_patterns")
    .select("*")
    .eq("user_id", profile.user_id)
    .eq("slug", slug)
    .maybeSingle();
  if (!fly) notFound();

  // Promoted-to-canonical: 301 to the canonical so old URLs keep working.
  if (fly.promoted_to_canonical_id) {
    const { data: canonical } = await supabase
      .from("canonical_flies")
      .select("slug")
      .eq("id", fly.promoted_to_canonical_id)
      .maybeSingle();
    if (canonical?.slug) redirect(`/flies/${canonical.slug}`);
  }

  const { data: { user: viewer } } = await supabase.auth.getUser();
  const isOwner = viewer?.id === profile.user_id;
  const viewerIsAdmin = isAdmin(viewer?.email);

  // Visibility gate: non-owners only see public patterns.
  if (!isOwner && !viewerIsAdmin && fly.visibility !== "public") {
    notFound();
  }

  // Surface most recent open submission so the owner sees pending state.
  // Wrapped in try/catch so the page renders even if the submissions table
  // hasn't been migrated yet (graceful for deploys racing the SQL apply).
  let pendingSubmission: { id: string; status: string; admin_notes: string | null } | null = null;
  if (isOwner) {
    try {
      const { data: sub } = await supabase
        .from("fly_pattern_submissions")
        .select("id, status, admin_notes")
        .eq("source_pattern_id", fly.id)
        .in("status", ["pending", "needs_info", "rejected"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      pendingSubmission = sub
        ? { id: sub.id as string, status: sub.status as string, admin_notes: (sub.admin_notes as string | null) ?? null }
        : null;
    } catch {
      pendingSubmission = null;
    }
  }

  // Resolve parent canonical for backlink.
  let parentCanonical: { id: string; slug: string; name: string; category: string } | null = null;
  if (fly.parent_canonical_id) {
    const { data: parent } = await supabase
      .from("canonical_flies")
      .select("id, slug, name, category")
      .eq("id", fly.parent_canonical_id)
      .maybeSingle();
    parentCanonical = parent ?? null;
  }

  const videoEmbed = toYouTubeEmbedUrl(fly.video_url);
  const sizes = parseList(fly.size);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <Link
          href={`/anglers/${profile.username}/flies`}
          className="inline-flex items-center gap-1 text-xs text-[#A8B2BD] hover:text-[#E8923A] mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {profile.display_name || `@${profile.username}`}'s flies
        </Link>

        <header className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          <div className="shrink-0 w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-[#161B22] border border-[#21262D] relative">
            {fly.image_url ? (
              <Image src={fly.image_url} alt={fly.name} fill className="object-cover" sizes="180px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#6E7681] text-3xl">🪶</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {parentCanonical && (
              <Link
                href={`/flies/${parentCanonical.slug}`}
                className="inline-flex items-center gap-1 text-xs text-[#0BA5C7] hover:text-[#5AD3F0] mb-2"
              >
                ← Variant of {parentCanonical.name}
              </Link>
            )}

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {fly.type && (
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full">
                  {fly.type}
                </span>
              )}
              {sizes.length > 0 && <span className="text-xs text-[#6E7681]">Sizes {sizes.join(", ")}</span>}
              {(isOwner || viewerIsAdmin) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#161B22] border border-[#21262D] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A8B2BD]">
                  {fly.visibility === "private" ? <Lock className="h-2.5 w-2.5" /> : <Globe2 className="h-2.5 w-2.5" />}
                  {fly.visibility}
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl font-bold text-[#F0F6FC] mb-2">{fly.name}</h1>

            <Link
              href={`/anglers/${profile.username}`}
              className="inline-flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A]"
            >
              {profile.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              )}
              by <span className="font-semibold text-[#F0F6FC]">{profile.display_name || `@${profile.username}`}</span>
            </Link>

            {fly.description && (
              <p className="mt-3 text-sm text-[#A8B2BD] leading-relaxed">{fly.description}</p>
            )}

            {isOwner && (
              <div className="mt-4 flex gap-2 flex-wrap">
                <Link
                  href={`/journal/flies/${fly.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8923A]/40 bg-[#E8923A]/10 text-[#E8923A] text-xs font-semibold hover:bg-[#E8923A]/20 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit pattern
                </Link>
                <SubmitToLibraryButton
                  patternId={fly.id}
                  pendingSubmission={pendingSubmission}
                  isAdminUser={viewerIsAdmin}
                />
              </div>
            )}
          </div>
        </header>

        {/* Recipe details */}
        <section className="grid sm:grid-cols-2 gap-3">
          <RecipeRow label="Hook" value={fly.hook} />
          <RecipeRow label="Bead" value={[fly.bead_size, fly.bead_color].filter(Boolean).join(" ")} />
          <RecipeRow label="Body color" value={fly.fly_color} />
          <RecipeRow label="Materials" value={fly.materials} fullWidth />
          {fly.notes && <RecipeRow label="Notes" value={fly.notes} fullWidth />}
        </section>

        {videoEmbed && (
          <section className="mt-6">
            <h2 className="font-heading text-xl text-[#E8923A] mb-3">Tying video</h2>
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
              <div className="relative w-full aspect-video">
                <iframe
                  src={videoEmbed}
                  title={`How to tie ${fly.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RecipeRow({ label, value, fullWidth }: { label: string; value?: string | null; fullWidth?: boolean }) {
  if (!value) return null;
  return (
    <div className={`rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E7681]">{label}</p>
      <p className="mt-0.5 text-sm text-[#F0F6FC] whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function parseList(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}
