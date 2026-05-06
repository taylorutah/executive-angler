import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllCanonicalFlies,
  getCanonicalFlyBySlug,
  getRiversByIds,
  getAllFlyShops,
  getAllArticles,
} from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import Image from "next/image";
import FlyFavoriteButton from "@/components/flies/FlyFavoriteButton";
import InYourBoxStrip from "@/components/flies/InYourBoxStrip";
import VariantTree from "@/components/flies/VariantTree";
import { RecipeCard } from "@/components/flies/RecipeCard";
import { RecipePdfButton } from "@/components/flies/RecipePdfButton";
import HashScroller from "@/components/ui/HashScroller";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, checkPremium } from "@/lib/admin";
import { toYouTubeEmbedUrl } from "@/lib/video-embed";
import {
  resolveFlyForViewer,
  type FlyBoxRow,
  type ViewMode,
} from "@/lib/flies/resolveFlyForViewer";
import CustomFlyImageDropzone from "@/components/flies/CustomFlyImageDropzone";

export const revalidate = 86400;

const CATEGORY_LABELS: Record<string, string> = {
  dry: "Dry Flies",
  nymph: "Nymphs",
  streamer: "Streamers",
  emerger: "Emergers",
  wet: "Wet Flies",
  terrestrial: "Terrestrials",
  egg: "Egg Patterns",
  midge: "Midges",
};

const CATEGORY_ICONS: Record<string, string> = {
  dry: "/images/fly-icons/dry.svg",
  nymph: "/images/fly-icons/nymph.svg",
  streamer: "/images/fly-icons/streamer.svg",
  emerger: "/images/fly-icons/emerger.svg",
  wet: "/images/fly-icons/wet.svg",
  terrestrial: "/images/fly-icons/terrestrial.svg",
  egg: "/images/fly-icons/egg.svg",
  midge: "/images/fly-icons/midge.svg",
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ view?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fly = await getCanonicalFlyBySlug(slug);
  if (!fly) return { title: "Fly Pattern Not Found" };

  const sizeRange =
    fly.sizes.length > 1
      ? `Sizes ${fly.sizes[0]}–${fly.sizes[fly.sizes.length - 1]}`
      : `Size ${fly.sizes[0]}`;
  const categoryLabel = CATEGORY_LABELS[fly.category] || fly.category;
  const fallbackTitle = `${fly.name} — ${sizeRange}, Variations & Tying Guide | Executive Angler`;
  const fallbackDesc = `Complete guide to the ${fly.name}: ${fly.keyVariations?.length || 0} variations, ${sizeRange.toLowerCase()}, materials list, tying video, and where to fish it. ${fly.tagline || ""}`.trim();

  return {
    title: fly.metaTitle || fallbackTitle,
    description: fly.metaDescription || fallbackDesc,
    openGraph: {
      title: fly.metaTitle || `${fly.name} — Trout Fly Pattern Guide`,
      description:
        fly.metaDescription || fly.description.substring(0, 160),
      images: fly.heroImageUrl
        ? [fly.heroImageUrl]
        : [
            `/api/og?title=${encodeURIComponent(fly.name)}&subtitle=${encodeURIComponent(categoryLabel)}&type=fly`,
          ],
    },
    alternates: {
      canonical: `${SITE_URL}/flies/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allFlies = await getAllCanonicalFlies();
  return allFlies.map((f) => ({ slug: f.slug }));
}

export default async function FlyDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const fly = await getCanonicalFlyBySlug(slug);
  if (!fly) notFound();

  const categoryLabel = CATEGORY_LABELS[fly.category] || fly.category;
  const categoryIcon = CATEGORY_ICONS[fly.category] || CATEGORY_ICONS.dry;
  const sizeRangeCanonical =
    fly.sizes.length > 1
      ? `${fly.sizes[0]}–${fly.sizes[fly.sizes.length - 1]}`
      : fly.sizes[0];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const viewerIsAdmin = isAdmin(user?.email);

  // Load viewer's fly box row + Pro status + username (for Card credit).
  let flyBox: FlyBoxRow | null = null;
  let isPro = false;
  let username: string | null = null;
  if (user) {
    const [{ data: boxRow }, premium, { data: profileRow }] = await Promise.all([
      supabase
        .from("user_fly_box")
        .select(
          "id, personalizations, preferred_sizes, personal_notes, custom_image_url, custom_name, is_favorite, is_tie_next",
        )
        .eq("user_id", user.id)
        .eq("canonical_fly_id", fly.id)
        .maybeSingle(),
      checkPremium(supabase, user.id, user.email),
      supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    flyBox = (boxRow as FlyBoxRow | null) ?? null;
    isPro = premium;
    username = (profileRow?.username as string | null) ?? null;
  }

  // Determine view mode. ?view=library forces canonical; ?view=yours forces
  // personalized (only useful when in box). Otherwise default = yours-when-in-box.
  const viewMode: ViewMode = (() => {
    if (sp.view === "library") return "library";
    if (sp.view === "yours") return "yours";
    return flyBox ? "yours" : "library";
  })();

  // Resolve the contributor's profile if this fly was submitted by an angler.
  let contributor: { username?: string; displayName?: string; avatarUrl?: string } | null = null;
  if (fly.contributedByUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("user_id", fly.contributedByUserId)
      .maybeSingle();
    if (profile) {
      contributor = {
        username: profile.username ?? undefined,
        displayName: profile.display_name ?? undefined,
        avatarUrl: profile.avatar_url ?? undefined,
      };
    }
  }

  // Fetch structured recipe ingredients if they exist
  const { data: recipeIngredients } = await supabase
    .from('fly_recipe_ingredients')
    .select('*, material:tying_materials(*)')
    .eq('canonical_fly_id', fly.id)
    .order('step_position', { ascending: true });

  // Build the resolved view — single source of truth for "Yours vs Library"
  // for every component on the page.
  const resolved = resolveFlyForViewer({
    canonical: fly,
    flyBox,
    ingredients: recipeIngredients ?? undefined,
    viewMode,
  });

  // Map resolved recipe rows by lower-snake slot so RecipeCard can swap text +
  // render provenance per row.
  const resolvedBySlot: Record<string, typeof resolved.recipe[number]> = {};
  for (const r of resolved.recipe) resolvedBySlot[r.slot] = r;

  // Display values driven by the resolver — Yours when overridden + in yours view.
  const displayName = resolved.displayName.value;
  const displayImage = resolved.heroImageUrl.value;
  const displaySizes = resolved.sizes.value;
  // When the user has an explicit list of preferred sizes, render them
  // literally ("20, 18, 16") — that's how an angler thinks about their box.
  // Only render as a continuous range ("14–22") when the canonical declares it.
  const sizesAreCustomList = resolved.sizes.source === "yours";
  const sizeRange =
    displaySizes.length > 1
      ? sizesAreCustomList
        ? displaySizes.join(", ")
        : `${displaySizes[0]}–${displaySizes[displaySizes.length - 1]}`
      : (displaySizes[0] ?? sizeRangeCanonical);

  // The whole page reads as Yours when in box + Yours mode — recipe heading,
  // materials heading, etc.
  const ownsView = resolved.viewMode === "yours" && resolved.isInBox;

  // Build substitution map: collect all substitute_ids across ingredients, fetch in one query
  let substitutionMap: Record<string, { id: string; slug: string; name: string; brand?: string; category: string }> = {};
  if (recipeIngredients?.length) {
    const allSubIds = recipeIngredients
      .flatMap((ing: Record<string, unknown>) => (ing.substitute_ids as string[]) || [])
      .filter(Boolean);
    const uniqueSubIds = [...new Set(allSubIds)];
    if (uniqueSubIds.length > 0) {
      const { data: subMaterials } = await supabase
        .from('tying_materials')
        .select('id, slug, name, brand, category')
        .in('id', uniqueSubIds);
      if (subMaterials) {
        for (const m of subMaterials) {
          substitutionMap[m.id] = m;
        }
      }
    }
  }

  // Load related data
  const [relatedRivers, relatedFlies, allFlyShops, allArticles] = await Promise.all([
    fly.relatedRiverIds.length > 0
      ? getRiversByIds(fly.relatedRiverIds)
      : Promise.resolve([]),
    fly.relatedFlyIds.length > 0
      ? getAllCanonicalFlies().then((all) =>
          all.filter((f) => fly.relatedFlyIds.includes(f.id))
        )
      : Promise.resolve([]),
    fly.flyShopIds.length > 0
      ? getAllFlyShops()
      : Promise.resolve([]),
    getAllArticles(),
  ]);

  // Filter fly shops that carry this fly
  const flyShops = fly.flyShopIds.length > 0
    ? allFlyShops.filter((shop) => fly.flyShopIds.includes(shop.id))
    : [];

  // Filter related articles (technique or gear categories)
  const relatedArticles = allArticles.filter(
    (a) => a.category === "technique" || a.category === "gear"
  );

  // Build Quick Facts
  const quickFacts = [
    { label: "Category", value: categoryLabel },
    { label: "Sizes", value: sizeRange },
    ...(fly.colors.length > 0
      ? [{ label: "Colors", value: fly.colors.join(", ") }]
      : []),
    ...(fly.beadOptions.length > 0
      ? [{ label: "Weight", value: fly.beadOptions.join(", ") }]
      : []),
    ...(fly.hookStyles.length > 0
      ? [{ label: "Hook Styles", value: fly.hookStyles.join(", ") }]
      : []),
    ...(fly.imitates.length > 0
      ? [{ label: "Imitates", value: fly.imitates.join(", ") }]
      : []),
    ...(fly.waterTypes.length > 0
      ? [{ label: "Water Types", value: fly.waterTypes.join(", ") }]
      : []),
    ...(fly.originCredit
      ? [{ label: "Origin", value: fly.originCredit }]
      : []),
  ];

  // Build FAQ data for schema
  const faqEntries: { question: string; answer: string }[] = [];
  if (fly.sizes.length > 0) {
    faqEntries.push({
      question: `What size ${fly.name} should I use?`,
      answer: `The ${fly.name} is most commonly tied in sizes ${sizeRange}. ${fly.whenToUse || `Choose smaller sizes for clear water and pressured fish, and larger sizes for faster or off-color water.`}`,
    });
  }
  if (fly.imitates.length > 0) {
    faqEntries.push({
      question: `What does a ${fly.name} imitate?`,
      answer: `The ${fly.name} primarily imitates ${fly.imitates.join(", ")}. ${fly.fishingTips?.substring(0, 150) || ""}`.trim(),
    });
  }
  if (fly.materialsList && fly.materialsList.length > 0) {
    faqEntries.push({
      question: `What materials do I need to tie a ${fly.name}?`,
      answer: `Key materials include: ${fly.materialsList.map((m) => m.material).join(", ")}. ${fly.tyingOverview?.substring(0, 100) || ""}`.trim(),
    });
  }
  if (fly.fishingTips) {
    faqEntries.push({
      question: `How do you fish a ${fly.name}?`,
      answer: fly.fishingTips.substring(0, 300),
    });
  }

  // Schema.org structured data
  const schemaGraph: Record<string, unknown>[] = [
    {
      "@type": "Product",
      name: fly.name,
      description: fly.description,
      ...(fly.heroImageUrl ? { image: fly.heroImageUrl } : {}),
      category: `Fly Fishing > ${categoryLabel}`,
    },
  ];

  const videoEmbedUrl = toYouTubeEmbedUrl(fly.videoUrl);
  if (fly.videoUrl && videoEmbedUrl) {
    schemaGraph.push({
      "@type": "VideoObject",
      name: `How to Tie a ${fly.name}`,
      description: fly.tyingOverview || `Learn to tie the ${fly.name}.`,
      contentUrl: fly.videoUrl,
      embedUrl: videoEmbedUrl,
      uploadDate: "2024-01-01",
    });
  }

  if (fly.materialsList && fly.materialsList.length > 0) {
    schemaGraph.push({
      "@type": "HowTo",
      name: `How to Tie a ${fly.name}`,
      description: fly.tyingOverview || `Step-by-step guide to tying the ${fly.name}.`,
      supply: fly.materialsList.map((m) => ({
        "@type": "HowToSupply",
        name: `${m.material}: ${m.description}`,
      })),
      ...(fly.tyingSteps
        ? {
            step: fly.tyingSteps.map((s) => ({
              "@type": "HowToStep",
              position: s.step,
              text: s.instruction,
            })),
          }
        : {}),
    });
  }

  if (faqEntries.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      mainEntity: faqEntries.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return (
    <>
      <HashScroller />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": schemaGraph,
        }}
      />

      {/* Breadcrumbs */}
      <div className="bg-[#0D1117] pt-6 pb-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies" },
              { label: categoryLabel, href: `/flies?category=${fly.category}` },
              { label: fly.name },
            ]}
          />
        </div>
      </div>

      {/* ─── Product Header: image + title + quick specs ─── */}
      <section className="bg-[#0D1117] pb-6 border-b border-[#21262D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Compact fly image — product card style */}
            <div className="relative shrink-0 w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-[#161B22] border border-[#21262D]">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImage}
                  alt={`${displayName} fly pattern`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image src={categoryIcon} alt={categoryLabel} width={56} height={56} className="opacity-40" />
                </div>
              )}
              {/*
                Image overlay logic:
                  - Yours view + in box → personal photo dropzone (Pro-gated).
                  - Library view + admin → canonical hero edit link.
                The two never collide, fixing the old "Replace image" confusion.
              */}
              {resolved.viewMode === "yours" && resolved.isInBox && (
                <CustomFlyImageDropzone
                  canonicalFlyId={fly.id}
                  isPro={isPro}
                  hasCustomPhoto={!!flyBox?.custom_image_url}
                />
              )}
              {resolved.viewMode === "library" && viewerIsAdmin && (
                <Link
                  href={`/admin/content/flies/${fly.id}#field-heroImageUrl`}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/70 text-white text-[11px] font-semibold py-1.5 hover:bg-[#E8923A] transition-colors"
                  title="Upload or replace the library's hero image"
                >
                  {fly.heroImageUrl ? "Replace library image" : "Upload library image"}
                </Link>
              )}
            </div>

            {/* Title + inline specs */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full">
                  {categoryLabel}
                </span>
                <span className="text-xs text-[#6E7681]">Sizes {sizeRange}</span>
                {fly.originCredit && (
                  <span className="text-xs text-[#6E7681]">by {fly.originCredit}</span>
                )}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F0F6FC] mb-2 flex flex-wrap items-center gap-2">
                <span>{displayName}</span>
                {resolved.displayName.source === "yours" && resolved.viewMode === "yours" && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#E8923A] border border-[#E8923A]/30 bg-[#E8923A]/10 px-1.5 py-0.5 rounded-full">
                    Yours
                  </span>
                )}
              </h1>
              {fly.tagline && (
                <p className="text-base text-[#A8B2BD] mb-3">{fly.tagline}</p>
              )}
              {contributor && (
                <Link
                  href={contributor.username ? `/anglers/${contributor.username}` : "#"}
                  className="inline-flex items-center gap-1.5 mb-3 text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
                >
                  {contributor.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={contributor.avatarUrl}
                      alt=""
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  )}
                  <span>
                    Contributed by{" "}
                    <span className="font-semibold text-[#F0F6FC]">
                      {contributor.displayName || (contributor.username ? `@${contributor.username}` : "an angler")}
                    </span>
                  </span>
                </Link>
              )}

              {/* Inline spec chips */}
              <div className="flex flex-wrap gap-2">
                {fly.imitates.length > 0 && (
                  <span className="px-2.5 py-1 text-xs bg-[#21262D] text-[#A8B2BD] rounded-full">
                    Imitates: {fly.imitates.join(", ")}
                  </span>
                )}
                {fly.waterTypes.length > 0 && (
                  <span className="px-2.5 py-1 text-xs bg-[#21262D] text-[#A8B2BD] rounded-full">
                    {fly.waterTypes.join(", ")}
                  </span>
                )}
                {fly.hookStyles.length > 0 && (
                  <span className="px-2.5 py-1 text-xs bg-[#21262D] text-[#A8B2BD] rounded-full">
                    {fly.hookStyles.join(", ")}
                  </span>
                )}
                {fly.beadOptions.length > 0 && (
                  <span className="px-2.5 py-1 text-xs bg-[#E8923A]/10 text-[#E8923A] rounded-full">
                    {fly.beadOptions.join(", ")}
                  </span>
                )}
              </div>

              {/* Desktop: small favorite icon — main In-Your-Box surface lives below */}
              <div className="hidden sm:flex items-center gap-2 mt-4">
                <FlyFavoriteButton canonicalFlyId={fly.id} compact />
              </div>
            </div>
          </div>

          {/* In Your Box strip — identity strip with view toggle, Card, Edit */}
          <div className="mt-5">
            <InYourBoxStrip
              fly={{
                id: fly.id,
                name: fly.name,
                category: fly.category,
                sizes: fly.sizes,
                colors: fly.colors,
                beadOptions: fly.beadOptions,
                hookStyles: fly.hookStyles,
                materialsList: fly.materialsList,
              }}
              resolved={resolved}
              isPro={isPro}
              username={username}
            />
          </div>
        </div>
      </section>

      {/* ─── Main Content + Sidebar ─── */}
      <section className="bg-[#0D1117] py-10 pb-20 lg:pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            {/* ─── Left: Main Content (tying-first ordering) ─── */}
            <div className="lg:col-span-2 space-y-10">

              {/* 1. Structured Recipe (top billing for tiers) */}
              {recipeIngredients && recipeIngredients.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
                      {ownsView ? "Your Recipe" : "Tying Recipe"}
                    </h2>
                    <RecipePdfButton flyId={fly.id} flyName={displayName} />
                  </div>
                  <RecipeCard
                    flyName={displayName}
                    flyType={categoryLabel}
                    flySize={sizeRange}
                    ingredients={recipeIngredients.map(ing => ({
                      ...ing,
                      material: ing.material || undefined,
                    }))}
                    substitutionMap={substitutionMap}
                    resolvedBySlot={resolvedBySlot}
                  />
                </div>
              )}

              {/* 2. Materials List — only render when there's no structured
                  recipe above. When Yours has overrides on this older list,
                  swap the description text and append a "Yours" badge per row. */}
              {(!recipeIngredients || recipeIngredients.length === 0) &&
                fly.materialsList && fly.materialsList.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    {ownsView ? "Your Materials" : "Materials"}
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                    <dl className="divide-y divide-[#21262D]">
                      {fly.materialsList.map((m) => {
                        const slotKey = m.material.toLowerCase().split(/\s+/)[0];
                        const r = resolvedBySlot[slotKey];
                        const isYours = r?.source === "yours";
                        return (
                          <div
                            key={m.material}
                            className={`flex justify-between items-start gap-4 px-6 py-3 ${isYours ? "bg-[#E8923A]/[0.04]" : ""}`}
                          >
                            <dt className="text-sm font-medium text-[#A8B2BD] shrink-0 w-24 flex items-center gap-1.5">
                              {m.material}
                              {isYours && (
                                <span className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#E8923A] border border-[#E8923A]/30 bg-[#E8923A]/10 px-1 py-px rounded-full">
                                  Yours
                                </span>
                              )}
                            </dt>
                            <dd className={`text-sm text-right font-mono ${isYours ? "text-[#E8923A]" : "text-[#F0F6FC]"}`}>
                              {isYours ? r.text : m.description}
                              {!isYours && m.substitute && (
                                <span className="block text-xs text-[#6E7681] mt-0.5">
                                  Alt: {m.substitute}
                                </span>
                              )}
                              {isYours && r.canonicalText && r.canonicalText !== r.text && (
                                <span className="block text-[10px] text-[#6E7681] mt-0.5 line-through" title="Library default">
                                  {r.canonicalText}
                                </span>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                </div>
              )}

              {/* 3. Tying Video */}
              {videoEmbedUrl && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                      Tying Video
                    </h2>
                    <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                      <div className="relative w-full aspect-video">
                        <iframe
                          src={videoEmbedUrl}
                          title={`How to tie a ${fly.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Additional videos */}
                    {fly.additionalVideos && fly.additionalVideos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6E7681]">
                          More Tying Videos
                        </p>
                        {fly.additionalVideos.map((v) => (
                          <a
                            key={v.url}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#E8923A]/30 transition-colors"
                          >
                            <span className="text-[#E8923A]">▶</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#F0F6FC] truncate">
                                {v.title}
                              </p>
                              <p className="text-xs text-[#6E7681]">
                                {v.channel}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollAnimation>
              )}

              {/* 4. Tying Steps */}
              {fly.tyingSteps && fly.tyingSteps.length > 0 && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                      Tying Steps
                    </h2>
                    <div className="space-y-3">
                      {fly.tyingSteps.map((step) => (
                        <div
                          key={step.step}
                          className="bg-[#161B22] rounded-xl border border-[#21262D] p-5"
                        >
                          <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8923A]/10 text-[#E8923A] flex items-center justify-center text-sm font-bold">
                              {step.step}
                            </span>
                            <div>
                              <p className="text-[#D8DEE4] leading-relaxed">
                                {step.instruction}
                              </p>
                              {step.tip && (
                                <p className="mt-2 text-sm text-[#E8923A] italic">
                                  Tip: {step.tip}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* 5. Description / personal notes — yours when present, library otherwise */}
              <ScrollAnimation>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    {ownsView && resolved.personalNotes ? "Your Notes" : "About This Pattern"}
                  </h2>
                  <p className="text-[#D8DEE4] text-base leading-relaxed whitespace-pre-line">
                    {ownsView && resolved.personalNotes ? resolved.personalNotes : fly.description}
                  </p>
                  {ownsView && resolved.personalNotes && fly.description && (
                    <details className="mt-4 group">
                      <summary className="text-xs text-[#6E7681] hover:text-[#A8B2BD] cursor-pointer inline-flex items-center gap-1.5">
                        <span className="group-open:hidden">View library description</span>
                        <span className="hidden group-open:inline">Hide library description</span>
                      </summary>
                      <p className="mt-3 text-sm text-[#A8B2BD] leading-relaxed">
                        {fly.description}
                      </p>
                    </details>
                  )}
                </div>
              </ScrollAnimation>

              {/* 6. How to Fish It + When to Use — combined */}
              {(fly.fishingTips || fly.whenToUse) && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                      On the Water
                    </h2>
                    <div className="space-y-4">
                      {fly.fishingTips && (
                        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6E7681] mb-3">How to Fish It</h3>
                          <p className="text-[#D8DEE4] leading-relaxed">
                            {fly.fishingTips}
                          </p>
                        </div>
                      )}
                      {fly.whenToUse && (
                        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6E7681] mb-3">When to Use</h3>
                          <p className="text-[#D8DEE4] leading-relaxed">
                            {fly.whenToUse}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* 7. Variations */}
              {fly.keyVariations && fly.keyVariations.length > 0 && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                      Variations
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {fly.keyVariations.map((v) => (
                        <div
                          key={v.slugFragment}
                          id={v.slugFragment}
                          className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 scroll-mt-20"
                        >
                          <h3 className="font-heading text-lg font-semibold text-[#F0F6FC]">
                            {v.name}
                          </h3>
                          {v.description && (
                            <p className="mt-1 text-sm text-[#A8B2BD]">
                              {v.description}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {v.sizes && (
                              <span className="px-2 py-0.5 bg-[#21262D] text-[#A8B2BD] rounded">
                                Sizes {v.sizes.join(", ")}
                              </span>
                            )}
                            {v.bead && (
                              <span className="px-2 py-0.5 bg-[#E8923A]/10 text-[#E8923A] rounded">
                                {v.bead}
                              </span>
                            )}
                            {v.colors &&
                              v.colors.map((c) => (
                                <span
                                  key={c}
                                  className="px-2 py-0.5 bg-[#21262D] text-[#A8B2BD] rounded"
                                >
                                  {c}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* 8. History (expandable) */}
              {fly.history && (
                <ScrollAnimation>
                  <details className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                    <summary className="px-6 py-4 cursor-pointer text-sm font-semibold uppercase tracking-wider text-[#E8923A] hover:bg-[#21262D]/50 transition-colors">
                      History &amp; Lore
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-[#A8B2BD] leading-relaxed">
                        {fly.history}
                      </p>
                    </div>
                  </details>
                </ScrollAnimation>
              )}

              {/* 9. FAQ */}
              {faqEntries.length > 0 && (
                <ScrollAnimation>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                      {faqEntries.map((faq) => (
                        <details
                          key={faq.question}
                          className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden"
                        >
                          <summary className="px-6 py-4 cursor-pointer text-[#F0F6FC] font-medium hover:bg-[#21262D]/50 transition-colors">
                            {faq.question}
                          </summary>
                          <div className="px-6 pb-5">
                            <p className="text-[#A8B2BD] leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* 10. Community Variants */}
              <section>
                <VariantTree canonicalId={fly.id} />
              </section>

              {/* 11. Community Photos */}
              <CommunityPhotos entityType="fly" entityId={fly.id} />
              <PhotoSubmissionForm entityType="fly" entityId={fly.id} entityName={fly.name} />
            </div>

            {/* ─── Right Sidebar ─── */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              {/* Pattern Details */}
              <QuickFacts title="Pattern Details" facts={quickFacts} />

              {/* Target Species */}
              {fly.effectiveSpecies.length > 0 && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
                  <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                    Target Species
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {fly.effectiveSpecies.map((sp) => (
                      <span
                        key={sp}
                        className="px-3 py-1.5 text-sm bg-[#21262D] text-[#F0F6FC] rounded-full"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Stats */}
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 text-center">
                <p className="text-2xl font-heading font-bold text-[#F0F6FC]">&mdash;</p>
                <p className="text-xs text-[#6E7681] mt-1">catches logged by anglers</p>
              </div>

              {/* Related Rivers */}
              {relatedRivers.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                    Effective on These Rivers
                  </h3>
                  <div className="space-y-3">
                    {relatedRivers.slice(0, 5).map((river) => (
                      <EntityCard
                        key={river.id}
                        href={`/rivers/${river.slug}`}
                        imageUrl={
                          river.thumbnailUrl ||
                          river.heroImageUrl ||
                          "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&q=80"
                        }
                        imageAlt={`${river.name} fly fishing`}
                        title={river.name}
                        meta={river.flowType}
                        badges={river.primarySpecies?.slice(0, 2)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Patterns */}
              {relatedFlies.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                    Similar Patterns
                  </h3>
                  <div className="space-y-3">
                    {relatedFlies.slice(0, 4).map((rf) => (
                      <Link
                        key={rf.id}
                        href={`/flies/${rf.slug}`}
                        className="flex items-center gap-3 px-4 py-3 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#E8923A]/30 transition-colors"
                      >
                        <Image src={CATEGORY_ICONS[rf.category] || CATEGORY_ICONS.dry} alt={rf.category} width={32} height={32} className="flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F0F6FC] truncate">
                            {rf.name}
                          </p>
                          <p className="text-xs text-[#6E7681]">
                            {CATEGORY_LABELS[rf.category] || rf.category}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fly Shops */}
              {flyShops.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                    Available At
                  </h3>
                  <div className="space-y-3">
                    {flyShops.slice(0, 4).map((shop) => (
                      <EntityCard
                        key={shop.id}
                        href={`/fly-shops/${shop.slug}`}
                        imageUrl={
                          shop.heroImageUrl ||
                          "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&q=80"
                        }
                        imageAlt={shop.name}
                        title={shop.name}
                        iconOnly
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Related Reading */}
              {relatedArticles.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">Related Reading</h3>
                  <div className="space-y-2">
                    {relatedArticles.slice(0, 3).map((a) => (
                      <Link key={a.id} href={`/articles/${a.slug}`} className="block text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                        {a.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Mobile: sidebar content below main ─── */}
          <div className="lg:hidden mt-8 space-y-6">
            <FlyFavoriteButton canonicalFlyId={fly.id} />
            <QuickFacts title="Pattern Details" facts={quickFacts} />

            {fly.effectiveSpecies.length > 0 && (
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
                <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                  Target Species
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fly.effectiveSpecies.map((sp) => (
                    <span
                      key={sp}
                      className="px-3 py-1.5 text-sm bg-[#21262D] text-[#F0F6FC] rounded-full"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {relatedRivers.length > 0 && (
              <div>
                <h3 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                  Effective on These Rivers
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {relatedRivers.slice(0, 4).map((river) => (
                    <EntityCard
                      key={river.id}
                      href={`/rivers/${river.slug}`}
                      imageUrl={
                        river.thumbnailUrl ||
                        river.heroImageUrl ||
                        "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&q=80"
                      }
                      imageAlt={`${river.name} fly fishing`}
                      title={river.name}
                      meta={river.flowType}
                    />
                  ))}
                </div>
              </div>
            )}

            {relatedFlies.length > 0 && (
              <div>
                <h3 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                  Similar Patterns
                </h3>
                <div className="space-y-2">
                  {relatedFlies.slice(0, 4).map((rf) => (
                    <Link
                      key={rf.id}
                      href={`/flies/${rf.slug}`}
                      className="flex items-center gap-3 px-4 py-3 bg-[#161B22] rounded-lg border border-[#21262D] hover:border-[#E8923A]/30 transition-colors"
                    >
                      <Image src={CATEGORY_ICONS[rf.category] || CATEGORY_ICONS.dry} alt={rf.category} width={32} height={32} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F0F6FC] truncate">
                          {rf.name}
                        </p>
                        <p className="text-xs text-[#6E7681]">
                          {CATEGORY_LABELS[rf.category] || rf.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </>
  );
}
