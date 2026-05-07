import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import JsonLd from "@/components/seo/JsonLd";
import AddToGearButton from "@/components/ui/AddToGearButton";
import { SITE_URL } from "@/lib/constants";
import {
  getAllGearBrands,
  getAllGearProducts,
  getGearBrandBySlug,
  getGearBrandById,
  getGearProductBySlug,
  getGearProductsByBrand,
} from "@/lib/db";

interface Props {
  params: Promise<{ brandSlug: string; productSlug: string }>;
}

export const revalidate = 3600;

const CATEGORY_LABELS = {
  rod: "Fly Rod",
  reel: "Fly Reel",
  waders: "Waders",
  "wading-boots": "Wading Boots",
  line: "Fly Line",
  leader: "Leader",
  tippet: "Tippet",
  pack: "Pack / Vest",
  net: "Landing Net",
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, productSlug } = await params;
  const product = await getGearProductBySlug(productSlug);
  if (!product) return { title: "Product Not Found" };
  const brand = await getGearBrandById(product.brandId);

  const fallbackTitle = `${product.name} — ${CATEGORY_LABELS[product.category]} | Executive Angler`;
  const fallbackDesc =
    product.description.slice(0, 160) ||
    `${product.name} — ${CATEGORY_LABELS[product.category]}${brand ? ` by ${brand.name}` : ""}.`;

  return {
    title: { absolute: product.metaTitle || fallbackTitle },
    description: product.metaDescription || fallbackDesc,
    alternates: { canonical: `${SITE_URL}/gear/${brandSlug}/${productSlug}` },
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || fallbackDesc,
      images: [
        product.heroImageUrl ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(product.name)}&subtitle=${encodeURIComponent(CATEGORY_LABELS[product.category])}&type=default`,
      ],
    },
  };
}

export async function generateStaticParams() {
  const [brands, products] = await Promise.all([
    getAllGearBrands(),
    getAllGearProducts(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b.slug]));
  return products
    .map((p) => {
      const brandSlug = brandById.get(p.brandId);
      return brandSlug ? { brandSlug, productSlug: p.slug } : null;
    })
    .filter((v): v is { brandSlug: string; productSlug: string } => v !== null);
}

export default async function ProductPage({ params }: Props) {
  const { brandSlug, productSlug } = await params;
  const [brand, product] = await Promise.all([
    getGearBrandBySlug(brandSlug),
    getGearProductBySlug(productSlug),
  ]);
  if (!brand || !product || product.brandId !== brand.id) notFound();

  const relatedProducts = (await getGearProductsByBrand(brand.id)).filter(
    (p) => p.id !== product.id
  );

  const specEntries = Object.entries(product.specs as Record<string, unknown>).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          url: `${SITE_URL}/gear/${brandSlug}/${productSlug}`,
          category: CATEGORY_LABELS[product.category],
          brand: {
            "@type": "Brand",
            name: brand.name,
            ...(brand.websiteUrl ? { url: brand.websiteUrl } : {}),
          },
          ...(product.heroImageUrl ? { image: product.heroImageUrl } : {}),
          ...(product.msrpUsd
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: "USD",
                  price: product.msrpUsd,
                  availability: "https://schema.org/InStock",
                  ...(product.productUrl ? { url: product.productUrl } : {}),
                },
              }
            : {}),
        }}
      />

      <HeroSection
        imageUrl={
          product.heroImageUrl ||
          "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1920&q=80"
        }
        imageAlt={product.heroImageAlt || product.name}
        title={product.name}
        subtitle={`${brand.name} · ${CATEGORY_LABELS[product.category]}`}
        height="h-[45vh]"
      />

      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Breadcrumbs
              items={[
                { label: "Gear", href: "/gear" },
                { label: brand.name, href: `/gear/${brand.slug}` },
                { label: product.name },
              ]}
            />
            <AddToGearButton
              productId={product.id}
              productName={product.name}
              brandName={brand.name}
              category={product.category}
            />
          </div>
        </div>
      </div>

      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  About the {product.name}
                </h2>
                {product.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[#A8B2BD] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              {product.useCases.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Use Cases
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.useCases.map((u) => (
                      <Badge key={u} variant="forest" size="md">
                        {u}
                      </Badge>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {specEntries.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Specs
                  </h2>
                  <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                    <dl className="divide-y divide-[#21262D]">
                      {specEntries.map(([key, value]) => (
                        <div key={key} className="flex justify-between px-4 py-3 text-sm">
                          <dt className="text-[#A8B2BD] capitalize">
                            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                          </dt>
                          <dd className="font-medium text-[#E8923A]">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </ScrollAnimation>
              )}

              {relatedProducts.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    More from {brand.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedProducts.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/gear/${brand.slug}/${p.slug}`}
                        className="block p-4 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A]/40 transition-colors"
                      >
                        <p className="text-xs uppercase tracking-wider text-[#6E7681]">
                          {CATEGORY_LABELS[p.category]}
                        </p>
                        <h3 className="mt-1 font-heading text-base font-semibold text-[#E8923A]">
                          {p.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-[#6E7681]">Brand</p>
                <Link
                  href={`/gear/${brand.slug}`}
                  className="mt-1 block font-heading text-xl font-bold text-[#E8923A] hover:underline"
                >
                  {brand.name}
                </Link>
                {brand.tagline && (
                  <p className="mt-2 text-sm text-[#A8B2BD]">{brand.tagline}</p>
                )}
              </div>

              {product.msrpUsd && (
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-[#6E7681]">MSRP</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-[#E8923A]">
                    ${product.msrpUsd.toFixed(2)}
                  </p>
                </div>
              )}

              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#E8923A] text-[#0D1117] font-semibold rounded-lg hover:bg-[#E8923A]/90 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on {brand.name} website
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
