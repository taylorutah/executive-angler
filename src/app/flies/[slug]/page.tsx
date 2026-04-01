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
import AddToFlyBoxButton from "@/components/flies/AddToFlyBoxButton";
import { RecipeCard } from "@/components/flies/RecipeCard";
import HashScroller from "@/components/ui/HashScroller";
import { ExternalLink, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

type Props = { params: Promise<{ slug: string }> };

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

export default async function FlyDetailPage({ params }: Props) {
  const { slug } = await params;
  const fly = await getCanonicalFlyBySlug(slug);
  if (!fly) notFound();

  const categoryLabel = CATEGORY_LABELS[fly.category] || fly.category;
  const categoryIcon = CATEGORY_ICONS[fly.category] || CATEGORY_ICONS.dry;
  const sizeRange =
    fly.sizes.length > 1
      ? `${fly.sizes[0]}–${fly.sizes[fly.sizes.length - 1]}`
      : fly.sizes[0];

  // Check premium status for gating tying steps 4+
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  let isPremium = false;
  if (currentUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", currentUser.id)
      .single();
    isPremium = profile?.is_premium ?? false;
  }

  // Fetch structured recipe ingredients if they exist
  const { data: recipeIngredients } = await supabase
    .from('fly_recipe_ingredients')
    .select('*, material:tying_materials(*)')
    .eq('canonical_fly_id', fly.id)
    .order('step_position', { ascending: true });

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

  if (fly.videoUrl) {
    schemaGraph.push({
      "@type": "VideoObject",
      name: `How to Tie a ${fly.name}`,
      description: fly.tyingOverview || `Learn to tie the ${fly.name}.`,
      contentUrl: fly.videoUrl,
      embedUrl: fly.videoUrl.replace("watch?v=", "embed/"),
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
      <div className="bg-[#0D1117] pt-6 pb-4">
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

      {/* Hero section */}
      <section className="bg-[#0D1117] pb-20 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            {/* Left: content */}
            <div className="lg:col-span-2">
              {/* Title block */}
              <div className="mb-6">
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] rounded-full mb-3">
                  {categoryLabel}
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F0F6FC]">
                  {fly.name}
                </h1>
                {fly.tagline && (
                  <p className="mt-2 text-lg text-[#A8B2BD]">
                    {fly.tagline}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <p className="text-[#D8DEE4] text-lg leading-relaxed">
                  {fly.description}
                </p>
              </div>

              {/* Fly Hero Image */}
              {fly.heroImageUrl && (
                <div className="mt-8 mb-2 rounded-2xl overflow-hidden" style={{height: '320px'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fly.heroImageUrl}
                    alt={`${fly.name} fly pattern`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* History (expandable) */}
              {fly.history && (
                <ScrollAnimation delay={0.1}>
                  <details className="mt-6 bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
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

              {/* Variations */}
              {fly.keyVariations && fly.keyVariations.length > 0 && (
                <ScrollAnimation delay={0.2}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-6">
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

              {/* How to Fish It */}
              {fly.fishingTips && (
                <ScrollAnimation delay={0.3}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                      How to Fish It
                    </h2>
                    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
                      <p className="text-[#D8DEE4] leading-relaxed">
                        {fly.fishingTips}
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* When to Use */}
              {fly.whenToUse && (
                <ScrollAnimation delay={0.35}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                      When to Use
                    </h2>
                    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
                      <p className="text-[#D8DEE4] leading-relaxed">
                        {fly.whenToUse}
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* Structured Recipe (from fly_recipe_ingredients table) */}
              {recipeIngredients && recipeIngredients.length > 0 && (
                <ScrollAnimation delay={0.38}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                      Tying Recipe
                    </h2>
                    <RecipeCard
                      flyName={fly.name}
                      flyType={categoryLabel}
                      flySize={sizeRange}
                      ingredients={recipeIngredients.map(ing => ({
                        ...ing,
                        material: ing.material || undefined,
                      }))}
                    />
                  </div>
                </ScrollAnimation>
              )}

              {/* Materials List */}
              {fly.materialsList && fly.materialsList.length > 0 && (
                <ScrollAnimation delay={0.4}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                      Materials
                    </h2>
                    <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                      <dl className="divide-y divide-[#21262D]">
                        {fly.materialsList.map((m) => (
                          <div
                            key={m.material}
                            className="flex justify-between items-start gap-4 px-6 py-3"
                          >
                            <dt className="text-sm font-medium text-[#A8B2BD] shrink-0 w-24">
                              {m.material}
                            </dt>
                            <dd className="text-sm text-[#F0F6FC] text-right font-mono">
                              {m.description}
                              {m.substitute && (
                                <span className="block text-xs text-[#6E7681] mt-0.5">
                                  Alt: {m.substitute}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* Tying Video */}
              {fly.videoUrl && (
                <ScrollAnimation delay={0.45}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                      Tying Video
                    </h2>
                    <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                      <div className="relative w-full aspect-video">
                        <iframe
                          src={fly.videoUrl.replace("watch?v=", "embed/")}
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

              {/* Tying Steps — steps 4+ gated behind premium */}
              {fly.tyingSteps && fly.tyingSteps.length > 0 && (
                <ScrollAnimation delay={0.5}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
                      Tying Steps
                    </h2>
                    <div className="space-y-3">
                      {fly.tyingSteps
                        .filter((step) => isPremium || step.step <= 3)
                        .map((step) => (
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
                                  💡 {step.tip}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {!isPremium && fly.tyingSteps.length > 3 && (
                        <div className="bg-[#161B22] rounded-xl border border-[#E8923A]/30 p-6 text-center">
                          <Lock className="h-6 w-6 text-[#E8923A] mx-auto mb-3" />
                          <p className="text-sm font-semibold text-[#F0F6FC] mb-1">
                            Premium Required
                          </p>
                          <p className="text-xs text-[#A8B2BD] mb-4">
                            Steps 4–{fly.tyingSteps.length} are available to Pro members.
                          </p>
                          <Link
                            href="/pricing"
                            className="inline-block px-5 py-2 bg-[#E8923A] text-white text-sm font-semibold rounded-lg hover:bg-[#D4801F] transition-colors"
                          >
                            Upgrade to Pro
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollAnimation>
              )}

              {/* FAQ Section */}
              {faqEntries.length > 0 && (
                <ScrollAnimation delay={0.55}>
                  <div className="mt-10">
                    <h2 className="font-heading text-sm uppercase tracking-wider text-[#A8B2BD] mb-4">
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

              {/* Community Photos */}
              <div className="mt-10">
                <CommunityPhotos entityType="fly" entityId={fly.id} />
              </div>

              {/* Photo Submission */}
              <div className="mt-10">
                <PhotoSubmissionForm entityType="fly" entityId={fly.id} entityName={fly.name} />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="hidden lg:block lg:col-span-1 space-y-6 mt-8 lg:mt-0">
              {/* Quick Facts */}
              <QuickFacts title="Pattern Details" facts={quickFacts} />

              {/* Add to Fly Box */}
              <AddToFlyBoxButton
                canonicalFlyId={fly.id}
                flyName={fly.name}
              />

              {/* Buy This Fly */}
              {fly.affiliateLinks && fly.affiliateLinks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading uppercase tracking-wider text-xs text-slate-400">
                    Buy This Fly
                  </h3>
                  {fly.affiliateLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Community Stats */}
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 text-center">
                <p className="text-2xl font-heading font-bold text-[#F0F6FC]">&mdash;</p>
                <p className="text-xs text-[#6E7681] mt-1">catches logged by anglers</p>
              </div>

              {/* Effective Species */}
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

              {/* Fly Shops that carry it */}
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

          {/* Mobile: Quick Facts + Species (shown below content on small screens) */}
          <div className="lg:hidden mt-8 space-y-6">
            <QuickFacts title="Pattern Details" facts={quickFacts} />

            <AddToFlyBoxButton
              canonicalFlyId={fly.id}
              flyName={fly.name}
            />

            {/* Buy This Fly */}
            {fly.affiliateLinks && fly.affiliateLinks.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-heading uppercase tracking-wider text-xs text-slate-400">
                  Buy This Fly
                </h3>
                {fly.affiliateLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Community Stats */}
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 text-center">
              <p className="text-2xl font-heading font-bold text-[#F0F6FC]">&mdash;</p>
              <p className="text-xs text-[#6E7681] mt-1">catches logged by anglers</p>
            </div>

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

            {/* Mobile: Related Rivers */}
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

            {/* Mobile: Similar Patterns */}
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

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D1117]/95 backdrop-blur-sm border-t border-[#21262D] px-4 py-3 safe-area-bottom">
        <AddToFlyBoxButton canonicalFlyId={fly.id} flyName={fly.name} />
      </div>
    </>
  );
}
