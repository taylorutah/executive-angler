import type { Metadata } from "next";
import Link from "next/link";
import { Timer, Fish, Droplets, BarChart3, Bookmark, Watch } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getFeaturedArticles } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Fly fishing intelligence platform`,
  description: "Track every session, log every catch, learn from your data. Built for serious fly anglers — on iPhone and Apple Watch.",
  openGraph: {
    title: `${SITE_NAME} — Fly fishing intelligence platform`,
    description: "Track every session, log every catch, learn from your data.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Fly fishing intelligence platform`,
    description: "Track every session, log every catch, learn from your data.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const revalidate = 3600;

export default async function HomePage() {
  const featuredArticles = await getFeaturedArticles().then((a) => a.slice(0, 3));

  return (
    <>
      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#0D1117] flex items-center justify-center">
        {/* Gradient glow orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00B4D8] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E8923A] opacity-10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-20">
          <ScrollAnimation>
            <p className="text-[#00B4D8] font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.15em] mb-6">
              FLY FISHING INTELLIGENCE PLATFORM
            </p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.1}>
            <h1 className="text-[#F0F6FC] font-['DM_Serif_Display'] font-normal leading-[1.05] mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '-0.02em' }}>
              Every cast.<br />
              Every fish.<br />
              Every river.
            </h1>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2}>
            <p className="text-[#8B949E] text-lg max-w-lg mx-auto leading-relaxed mb-10">
              Track your sessions. Learn from your data. Fish better. Built for serious fly anglers — on iPhone and Apple Watch.
            </p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg"
              >
                Download on App Store
              </Link>
              <Link
                href="#app"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#00B4D8] text-[#00B4D8] font-medium rounded-xl hover:bg-[#00B4D8]/10 transition-colors"
              >
                See the App →
              </Link>
            </div>
          </ScrollAnimation>

          {/* Stats row */}
          <ScrollAnimation delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-5xl font-normal mb-1">12,400</div>
                <div className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs uppercase tracking-[0.1em]">Fish Logged</div>
              </div>
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-5xl font-normal mb-1">847</div>
                <div className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs uppercase tracking-[0.1em]">Sessions This Month</div>
              </div>
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-5xl font-normal mb-1">204</div>
                <div className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs uppercase tracking-[0.1em]">Rivers Tracked</div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 2. WHAT YOU TRACK (bento grid) ────────────────────────────────── */}
      <section id="app" className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-12">
              The Intelligence Layer
            </h2>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Timer, title: "Session Intel", desc: "Start time, duration, location, weather, water temp, flow — every detail captured." },
              { icon: Fish, title: "Catch Data", desc: "Species, length, fly pattern, exact time. Build a database of what works." },
              { icon: Droplets, title: "River Conditions", desc: "Flow rates, clarity, temperature. See patterns over time and seasons." },
              { icon: BarChart3, title: "History & Trends", desc: "Catch rates by time of day, season, weather. Learn from your own data." },
              { icon: Bookmark, title: "Fly Box", desc: "Catalog your patterns. Tag the flies that actually catch fish." },
              { icon: Watch, title: "Watch Integration", desc: "Log catches from your wrist without breaking rhythm. Full Apple Watch app included." },
            ].map((card, i) => (
              <ScrollAnimation key={card.title} delay={i * 0.08}>
                <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8 hover:border-[#484F58] transition-colors">
                  <card.icon className="h-8 w-8 text-[#00B4D8] mb-4" strokeWidth={1.5} />
                  <h3 className="font-['DM_Sans'] font-semibold text-lg text-[#F0F6FC] mb-2">{card.title}</h3>
                  <p className="text-[#8B949E] text-sm leading-relaxed">{card.desc}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SESSION CARD PREVIEW ───────────────────────────────────────── */}
      <section className="bg-[#161B22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <ScrollAnimation>
              <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl mb-4">
                Sessions that tell the story
              </h2>
              <p className="text-[#8B949E] text-lg leading-relaxed mb-6">
                Every time you hit the water, Executive Angler captures the full picture. Not just what you caught — but when, where, how, and under what conditions.
              </p>
              <p className="text-[#8B949E] leading-relaxed">
                Over time, you build an intelligence database that reveals patterns invisible to the naked eye. The flies that produce in low light. The sections that fire at specific flows. The windows of opportunity you&apos;d otherwise miss.
              </p>
            </ScrollAnimation>

            {/* Right: Session card mockup */}
            <ScrollAnimation delay={0.2}>
              <div className="bg-[#1F2937] border border-[#21262D] rounded-2xl p-6 shadow-2xl">
                <h3 className="font-['DM_Serif_Display'] text-[#F0F6FC] text-2xl mb-1">Green River, Utah</h3>
                <p className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs mb-6">March 8, 2026 • 7:42 AM</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-3xl font-normal">14</div>
                    <div className="text-[#8B949E] text-xs">Fish</div>
                  </div>
                  <div>
                    <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-3xl font-normal">3h 12m</div>
                    <div className="text-[#8B949E] text-xs">Duration</div>
                  </div>
                  <div>
                    <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-3xl font-normal">18&quot;</div>
                    <div className="text-[#8B949E] text-xs">Best</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {["54°F", "#18 RS2", "Clear", "1,240 cfs"].map((tag) => (
                    <span
                      key={tag}
                      className="font-['IBM_Plex_Mono'] text-xs bg-[rgba(0,180,216,0.1)] border border-[rgba(0,180,216,0.2)] text-[#00B4D8] rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── 4. JOURNAL PREVIEW (articles) ──────────────────────────────────── */}
      <section className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-4">
              Journal Entries
            </h2>
            <p className="text-[#8B949E] text-center mb-12 max-w-2xl mx-auto">
              Dispatches from the water. Technique, destinations, and stories from serious anglers.
            </p>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article, i) => (
              <ScrollAnimation key={article.id} delay={i * 0.1}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="group block bg-[#161B22] border border-[#21262D] rounded-2xl overflow-hidden hover:border-[#484F58] transition-colors"
                >
                  <div className="p-6">
                    <div className="text-[#00B4D8] text-xs uppercase tracking-wider mb-3 font-['IBM_Plex_Mono']">
                      {article.category}
                    </div>
                    <h3 className="font-['DM_Serif_Display'] text-xl text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors mb-2 leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-[#8B949E] text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs">
                      {article.readingTimeMinutes} min • {article.author}
                    </p>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation delay={0.3}>
            <div className="mt-10 text-center">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-[#00B4D8] hover:text-[#E8923A] font-medium transition-colors"
              >
                Read all articles →
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 5. DOWNLOAD CTA ────────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] border-t border-[#21262D] py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-5xl mb-4">
              Start your first session today.
            </h2>
            <p className="text-[#8B949E] text-lg mb-10 max-w-xl mx-auto">
              Executive Angler is available now on iPhone and Apple Watch. Track your sessions, learn from your data, fish better.
            </p>
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg text-lg"
            >
              Download on App Store
            </Link>
            <p className="mt-4 font-['IBM_Plex_Mono'] text-[#484F58] text-xs">
              watchOS companion included
            </p>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}
