import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { Feather, Lock, Globe2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}'s flies`,
    description: `Personal fly patterns by @${username}.`,
    robots: { index: false, follow: false },
  };
}

export default async function AnglerFliesPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url, profile_visibility")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!profile) notFound();

  const { data: { user: viewer } } = await supabase.auth.getUser();
  const isOwner = viewer?.id === profile.user_id;
  const viewerIsAdmin = isAdmin(viewer?.email);

  // Visibility filter: owner sees everything; admins see everything; others
  // only see public patterns. Promoted-to-canonical patterns are excluded
  // from the index (they redirect to the canonical) but kept around for
  // lineage.
  // Visibility on the unified schema:
  //   - owner / admin sees private + pending + approved
  //   - everyone else sees approved only
  const allowedStatuses = isOwner || viewerIsAdmin
    ? ["private", "pending", "approved"]
    : ["approved"];
  const { data: rawFlies } = await supabase
    .from("flies")
    .select("id, slug, name, category, hero_image_url, status")
    .eq("submitted_by_user_id", profile.user_id)
    .in("status", allowedStatuses)
    .is("deleted_at", null)
    .not("slug", "is", null)
    .order("updated_at", { ascending: false });
  // Map to the legacy shape the rest of this page expects.
  const list = (rawFlies ?? []).map((f) => ({
    id: f.id as string,
    slug: f.slug as string,
    name: f.name as string,
    type: (f.category as string | null) ?? null,
    image_url: (f.hero_image_url as string | null) ?? null,
    fly_color: null as string | null,
    size: null as string | null,
    visibility: (f.status === "approved" ? "public" : "private") as "public" | "private",
    parent_canonical_id: null as string | null,
    promoted_to_canonical_id: null as string | null,
  }));

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <Link href={`/anglers/${profile.username}`} className="text-xs text-[#A8B2BD] hover:text-[#E8923A]">
              ← @{profile.username}
            </Link>
            <h1 className="font-heading text-3xl font-bold text-[#F0F6FC] mt-1">
              {profile.display_name ? `${profile.display_name}'s flies` : `@${profile.username}'s flies`}
            </h1>
            <p className="text-sm text-[#6E7681] mt-1">
              {list.length} pattern{list.length === 1 ? "" : "s"}
              {!isOwner && !viewerIsAdmin && " (public only)"}
            </p>
          </div>
          {isOwner && (
            <Link
              href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors"
            >
              <Plus className="h-4 w-4" /> New pattern
            </Link>
          )}
        </header>

        {list.length === 0 ? (
          <EmptyState isOwner={isOwner} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {list.map((fly) => (
              <Link
                key={fly.id}
                href={`/anglers/${profile.username}/flies/${fly.slug}`}
                className="group flex flex-col rounded-xl border border-[#21262D] bg-[#161B22] overflow-hidden hover:border-[#E8923A]/40 transition-all"
              >
                <div className="aspect-square bg-[#0D1117] relative overflow-hidden">
                  {fly.image_url ? (
                    <Image
                      src={fly.image_url}
                      alt={fly.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="180px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#6E7681]">
                      <Feather className="h-8 w-8" />
                    </div>
                  )}
                  {isOwner && fly.visibility !== "public" && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {fly.visibility === "private" ? <Lock className="h-2.5 w-2.5" /> : <Globe2 className="h-2.5 w-2.5" />}
                      {fly.visibility}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-[#F0F6FC] truncate group-hover:text-[#E8923A] transition-colors">
                    {fly.name}
                  </p>
                  <p className="text-[10px] text-[#6E7681] truncate mt-0.5">
                    {[fly.type, fly.size].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-[#21262D] bg-[#161B22] px-6 py-14 text-center">
      <Feather className="mx-auto h-10 w-10 text-[#6E7681]" />
      <h2 className="mt-4 font-heading text-lg font-bold text-[#F0F6FC]">
        {isOwner ? "You haven't created any patterns yet" : "No public patterns to show"}
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#6E7681]">
        {isOwner
          ? "Design your own fly from scratch in the Workbench, or save canonical patterns to your fly box."
          : "Patterns appear here when this angler chooses to share them publicly."}
      </p>
      {isOwner && (
        <Link
          href="/journal/flies/new"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A]"
        >
          <Plus className="h-4 w-4" /> New pattern
        </Link>
      )}
    </div>
  );
}
