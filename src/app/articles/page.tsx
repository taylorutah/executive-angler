import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroSection from "@/components/ui/HeroSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { articles } from "@/data/articles";

export const metadata: Metadata = {
  title: "Fly Fishing Articles & Instruction",
  description:
    "Expert fly fishing articles — techniques, destinations, gear reviews, conservation, and more. Your comprehensive angling library.",
};

export default function ArticlesPage() {
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80"
        imageAlt="Fly fishing rod and reel close-up"
        title="Articles"
        subtitle="Expert instruction, destination guides, technique deep-dives, and the stories behind the sport."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Featured Article */}
          {featured && (
            <ScrollAnimation>
              <Link
                href={`/articles/${featured.slug}`}
                className="group block card-hover mb-12 rounded-xl overflow-hidden bg-white shadow-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src={featured.heroImageUrl}
                      alt={featured.title}
                      fill
                      className="object-cover card-image-zoom"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-forest text-white text-xs font-medium rounded-full uppercase">
                      Featured
                    </div>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <span className="text-forest text-sm font-medium uppercase tracking-wider">
                      {featured.category}
                    </span>
                    <h2 className="mt-2 font-heading text-2xl md:text-3xl font-bold text-forest-dark group-hover:text-forest transition-colors">
                      {featured.title}
                    </h2>
                    {featured.subtitle && (
                      <p className="mt-2 text-lg text-slate-500 italic">
                        {featured.subtitle}
                      </p>
                    )}
                    <p className="mt-4 text-slate-600 line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <p className="mt-4 text-sm text-slate-400">
                      {featured.readingTimeMinutes} min read · {featured.author}
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>
          )}

          {/* Article Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article, i) => (
              <ScrollAnimation key={article.id} delay={i * 0.05}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={article.heroImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover card-image-zoom"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-forest text-white text-xs font-medium rounded-full uppercase">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-forest-dark group-hover:text-forest transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {article.readingTimeMinutes} min read · {article.author}
                    </p>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
