import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { Lock, Globe2, ArrowLeft } from "lucide-react";
import { toYouTubeEmbedUrl } from "@/lib/video-embed";
import SubmitToLibraryButton from "@/components/flies/SubmitToLibraryButton";
import FlyBoxAddButton from "@/components/flies/FlyBoxAddButton";
import VariantTable from "@/components/flies-v2/VariantTable";
import PatternHeaderActions from "@/components/flies-v2/PatternHeaderActions";
import {
  getPatternById,
  getPatternForEdit,
  listVariantRowsForPattern,
  listMyBoxes,
} from "@/lib/db/fly-v2";
import { canEditPattern } from "@/lib/flies/permissions";
import { resolveVariantAxes } from "@/lib/flies/variant-axes";
import { parseBeadFromBaseMaterials } from "@/lib/flies/parseBeadSpec";

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

  // Personal patterns live in `fly_patterns` (v1) but their variants are in the
  // v2 model (`fly_patterns_v2` / `fly_variants`). The v1 and v2 ids match
  // after the Phase 2 backfill, so we can fetch the v2 row by the same id.
  let v2Pattern = await getPatternById(fly.id);

  // Lazy backfill: if no v2 row exists (legacy fork created pre-Phase 2 mirror),
  // create one now so the Configurations table can render. Owner-only, since
  // RLS only allows the pattern owner to insert. Also seed variants by cloning
  // the parent canonical's curated specs so the user lands on a populated
  // table matching what they branched from.
  if (!v2Pattern && isOwner) {
    const { data: upserted } = await supabase
      .from("fly_patterns_v2")
      .upsert(
        {
          id: fly.id,
          name: fly.name,
          category: typeof fly.type === "string" ? mapTypeToV2Category(fly.type) : null,
          owner_user_id: profile.user_id,
          visibility: fly.visibility ?? "private",
          description: fly.description ?? null,
          hero_image_url: fly.image_url ?? null,
          video_url: fly.video_url ?? null,
          forked_from_pattern_id: fly.parent_canonical_id ?? null,
          contributed_by_user_id: profile.user_id,
        },
        { onConflict: "id" },
      )
      .select()
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    v2Pattern = (upserted as any) ?? (await getPatternById(fly.id));

    if (v2Pattern && fly.parent_canonical_id) {
      const { count: existingVariantCount } = await supabase
        .from("fly_variants")
        .select("id", { count: "exact", head: true })
        .eq("pattern_id", fly.id);
      if ((existingVariantCount ?? 0) === 0) {
        const { data: curated } = await supabase
          .from("fly_variants")
          .select(
            "size, hook_style, hook_brand, bead_material, bead_weight_mm, bead_color, body_color, rib_color, tail_color, wing_color, thorax_color, collar_color, materials_override, sort_order, display_name, notes",
          )
          .eq("pattern_id", fly.parent_canonical_id)
          .is("created_by_user_id", null)
          .is("deleted_at", null)
          .order("sort_order");
        if (curated && curated.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clones = (curated as any[]).map((v) => ({
            pattern_id: fly.id,
            created_by_user_id: profile.user_id,
            size: v.size,
            hook_style: v.hook_style,
            hook_brand: v.hook_brand,
            bead_material: v.bead_material,
            bead_weight_mm: v.bead_weight_mm,
            bead_color: v.bead_color,
            body_color: v.body_color,
            rib_color: v.rib_color,
            tail_color: v.tail_color,
            wing_color: v.wing_color,
            thorax_color: v.thorax_color,
            collar_color: v.collar_color,
            materials_override: v.materials_override ?? {},
            sort_order: v.sort_order ?? 0,
            display_name: v.display_name,
            notes: v.notes,
          }));
          await supabase.from("fly_variants").insert(clones);
        }
      }
    }
  }

  const [variants, userBoxes, editablePattern] = await Promise.all([
    v2Pattern ? listVariantRowsForPattern(v2Pattern.id) : Promise.resolve([]),
    isOwner ? listMyBoxes() : Promise.resolve([]),
    v2Pattern && isOwner
      ? Promise.resolve(
          canEditPattern(v2Pattern, viewer ? { id: viewer.id, email: viewer.email } : null)
            ? getPatternForEdit(v2Pattern.id)
            : null,
        )
      : Promise.resolve(null),
  ]);
  const resolvedEditable = editablePattern ? await editablePattern : null;

  const videoEmbed = toYouTubeEmbedUrl(fly.video_url);
  const sizes = parseList(fly.size);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Link
          href={`/anglers/${profile.username}/flies`}
          className="inline-flex items-center gap-1 text-xs text-[#A8B2BD] hover:text-[#E8923A] mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {profile.display_name || `@${profile.username}`}&apos;s flies
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

            <div className="mt-4 flex gap-2 flex-wrap items-center">
              <FlyBoxAddButton
                fly={{ id: fly.id, name: fly.name, kind: "personal" }}
                variant="pill"
              />
              {isOwner && (
                <SubmitToLibraryButton
                  patternId={fly.id}
                  pendingSubmission={pendingSubmission}
                  isAdminUser={viewerIsAdmin}
                />
              )}
            </div>
          </div>
        </header>

        {/* Configurations — same component / layout the canonical page uses. */}
        {v2Pattern && (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-[#F0F6FC] font-semibold text-sm">Configurations</h2>
                <p className="text-[#6E7681] text-xs">
                  every way this fly is tied · {variants.length}{" "}
                  {variants.length === 1 ? "spec" : "specs"}
                  {isOwner ? " · tap any cell to edit your numbers · multi-select for bulk actions" : ""}
                </p>
              </div>
              {isOwner && (
                <PatternHeaderActions
                  patternId={v2Pattern.id}
                  patternSlug={slug}
                  editablePattern={resolvedEditable}
                  userBoxes={userBoxes}
                  isAdmin={viewerIsAdmin}
                  isCanonical={false}
                  personalEditHref={`/journal/flies/${fly.id}/edit`}
                  defaultBeadSpec={parseBeadFromBaseMaterials(v2Pattern.base_materials)}
                />
              )}
            </div>
            <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
              <VariantTable
                variants={variants}
                patternSlug={slug}
                userBoxes={userBoxes}
                viewerUserId={viewer?.id ?? null}
                viewerIsAdmin={viewerIsAdmin}
                activeAxes={resolveVariantAxes({
                  category: v2Pattern.category,
                  active_variant_axes: v2Pattern.active_variant_axes ?? null,
                })}
              />
            </div>
            {variants.length === 0 && isOwner && (
              <p className="mt-2 text-xs text-[#6E7681]">
                No configurations yet — tap <span className="text-[#E8923A]">+ My configuration</span>{" "}
                to add a size.
              </p>
            )}
          </section>
        )}

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

const TYPE_LABEL_TO_V2_CATEGORY: Record<string, string> = {
  "Nymph": "nymph",
  "Dry Fly": "dry",
  "Streamer": "streamer",
  "Emerger": "emerger",
  "Wet Fly": "wet",
  "Terrestrial": "terrestrial",
  "Egg": "egg",
  "Midge": "midge",
};
function mapTypeToV2Category(type: string): string | null {
  return TYPE_LABEL_TO_V2_CATEGORY[type] ?? type.toLowerCase() ?? null;
}
