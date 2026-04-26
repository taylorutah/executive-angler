import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Check, Smartphone, Activity, BarChart3, Bug, Droplets,
  BookOpen, Map, Wrench, Search as SearchIcon, Sparkles
} from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import PhoneHeroMockup from "@/components/marketing/PhoneHeroMockup";
import { getFeaturedArticles } from "@/lib/db";
import { SITE_NAME, SITE_URL, APP_STORE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Fly Fishing Intelligence: Journal, Flies, Rivers`,
  description: "Log every session, build structured fly recipes, track 200+ rivers with live USGS conditions, and see the patterns in your fishing. Free fly fishing app — now on the App Store.",
  openGraph: {
    title: `${SITE_NAME} — Log Catches, Tie Better Flies, Fish Smarter`,
    description: "The fly fishing intelligence platform. Journal your sessions, build fly recipes, track river conditions, and analyze patterns. Free on iPhone and web.",
    url: SITE_URL,
    images: [
      {
        url: "/images/madison-river-three-dollar-bridge.jpg",
        width: 1920,
        height: 1036,
        alt: "The Madison River in Montana — Executive Angler",
      },
    ],
  },
  alternates: { canonical: SITE_URL },
};

export const revalidate = 3600;

const RIVERS = [
  { name: "Green River", location: "UTAH", fish: 34, ago: "2h ago", href: "/rivers/green-river" },
  { name: "Madison River", location: "MONTANA", fish: 142, ago: "45m ago", href: "/rivers/madison-river" },
  { name: "Henry's Fork", location: "IDAHO", fish: 67, ago: "1h ago", href: "/rivers/henrys-fork" },
  { name: "Yellowstone River", location: "WYOMING", fish: 28, ago: "3h ago", href: "/rivers/yellowstone-river" },
];

const PILLAR_FEATURES = [
  { icon: Activity, text: "Log sessions with GPS, weather, and gear — automatically" },
  { icon: Bug, text: "Build fly recipes, browse 500+ materials, track your tying" },
  { icon: BarChart3, text: "Insights from your catch history — best flies, peak hours, conditions" },
];

export default async function HomePage() {
  const featuredArticles = await getFeaturedArticles().then((a) => a.slice(0, 3));

  return (
    <>
      {/* ── 1. HERO — FOUR PILLARS ───────────────────────────────────── */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#0D1117] flex items-center justify-center">
        {/* Subtle river background — Taylor's Madison River photo */}
        <Image
          src="/images/madison-river-three-dollar-bridge.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.09] pointer-events-none"
          sizes="100vw"
        />
        {/* Dark gradient overlay to blend edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117] via-transparent to-[#0D1117] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0BA5C7] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E8923A] opacity-10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-16 items-center">
            {/* LEFT — Copy + CTAs */}
            <div className="text-center lg:text-left">
              <ScrollAnimation>
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8923A] animate-pulse" />
                  <span className="font-['IBM_Plex_Mono'] text-[#E8923A] text-xs uppercase tracking-[0.2em]">
                    Now on the App Store
                  </span>
                </div>
              </ScrollAnimation>
              <ScrollAnimation delay={0.1}>
                <h1
                  className="text-[#F0F6FC] font-['DM_Serif_Display'] font-normal leading-[1.05] mb-6"
                  style={{ fontSize: "clamp(2.75rem, 7vw, 4.75rem)", letterSpacing: "-0.02em" }}
                >
                  Better data.<br />Better days on the water.
                </h1>
              </ScrollAnimation>
              <ScrollAnimation delay={0.2}>
                <p className="text-[#A8B2BD] text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
                  The fly fishing intelligence platform. Journal every session, build fly recipes, track river conditions, and let your data show you what works.
                </p>
              </ScrollAnimation>

              {/* CTA buttons */}
              <ScrollAnimation delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg text-base"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    Download for iPhone
                  </a>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-semibold rounded-xl hover:border-[#6E7681] transition-colors text-base"
                  >
                    Open Web App
                  </Link>
                </div>
              </ScrollAnimation>

              {/* Feature bullets */}
              <ScrollAnimation delay={0.35}>
                <ul className="flex flex-col gap-2.5 mt-2 max-w-lg mx-auto lg:mx-0">
                  {PILLAR_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-[#A8B2BD]">
                      <f.icon className="h-4 w-4 text-[#E8923A] flex-shrink-0" strokeWidth={1.75} />
                      <span className="text-left leading-snug">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </ScrollAnimation>
            </div>

            {/* RIGHT — Phone mockup */}
            <ScrollAnimation delay={0.2}>
              <div className="flex justify-center lg:justify-end">
                <PhoneHeroMockup />
              </div>
            </ScrollAnimation>
          </div>

          {/* Four pillar nav cards (full-width below the split) */}
          <ScrollAnimation delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-16">
              {[
                { label: "Journal", desc: "Log sessions", href: "/journal", icon: Smartphone, color: "#E8923A" },
                { label: "Flies", desc: "Patterns & recipes", href: "/flies", icon: Bug, color: "#E8923A" },
                { label: "Rivers", desc: "Live conditions", href: "/rivers", icon: Droplets, color: "#0BA5C7" },
                { label: "Feed", desc: "Community", href: "/feed", icon: Activity, color: "#0BA5C7" },
              ].map((p) => (
                <Link key={p.label} href={p.href} className="group bg-[#161B22] border border-[#21262D] rounded-xl p-4 hover:border-[#E8923A]/40 transition-colors text-left">
                  <p.icon className="h-5 w-5 mb-2" style={{ color: p.color }} strokeWidth={1.5} />
                  <p className="text-[#F0F6FC] text-sm font-semibold group-hover:text-[#E8923A] transition-colors">{p.label}</p>
                  <p className="text-[#6E7681] text-xs">{p.desc}</p>
                </Link>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 2. JOURNAL — Session card showcase ───────────────────────── */}
      <section className="bg-[#161B22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Session card mockup */}
            <ScrollAnimation>
              <div className="bg-[#1F2937] border border-[#21262D] rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto lg:mx-0">
                <h3 className="font-['DM_Serif_Display'] text-[#F0F6FC] text-2xl mb-1">Green River, Utah</h3>
                <p className="font-['IBM_Plex_Mono'] text-[#A8B2BD] text-xs mb-6">March 8, 2026 &bull; 7:42 AM</p>
                <div className="flex items-baseline justify-between mb-6">
                  <div className="text-center">
                    <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-4xl font-normal leading-none">14</div>
                    <div className="text-[#A8B2BD] text-[11px] mt-1.5 uppercase tracking-wider">Fish</div>
                  </div>
                  <div className="h-8 w-px bg-[#21262D]" />
                  <div className="text-center">
                    <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-4xl font-normal leading-none whitespace-nowrap">3<span className="text-2xl">h</span> 12<span className="text-2xl">m</span></div>
                    <div className="text-[#A8B2BD] text-[11px] mt-1.5 uppercase tracking-wider">Duration</div>
                  </div>
                  <div className="h-8 w-px bg-[#21262D]" />
                  <div className="text-center">
                    <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-4xl font-normal leading-none">18<span className="text-2xl">&quot;</span></div>
                    <div className="text-[#A8B2BD] text-[11px] mt-1.5 uppercase tracking-wider">Best</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["54\u00B0F", "#18 RS2", "Clear", "1,240 cfs"].map((tag) => (
                    <span key={tag} className="font-['IBM_Plex_Mono'] text-xs bg-[rgba(0,180,216,0.1)] border border-[rgba(0,180,216,0.2)] text-[#0BA5C7] rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            {/* Copy */}
            <ScrollAnimation delay={0.2}>
              <p className="font-['IBM_Plex_Mono'] text-[#E8923A] text-xs uppercase tracking-[0.15em] mb-4">JOURNAL</p>
              <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl mb-4">
                Every session.<br />Every detail.<br />Always yours.
              </h2>
              <p className="text-[#A8B2BD] text-lg leading-relaxed mb-6">
                One-tap session start with auto-detected river, weather, and GPS. Log catches with species, length, fly, and photo. Your data builds a personal fishing intelligence engine.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "GPS-tracked sessions with weather and water conditions",
                  "Insights from your data: best fly, peak hour, optimal conditions",
                  "Trophy wall, river stats, and year-over-year trends",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[#2EA44F] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-[#A8B2BD] text-sm">{line}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg">
                Start Logging Free
              </Link>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── 3. FLIES — Tying Workbench + Library ─────────────────────── */}
      <section className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <p className="font-['IBM_Plex_Mono'] text-[#E8923A] text-xs uppercase tracking-[0.15em] mb-4 text-center">FLIES</p>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              Your Digital Fly Box &amp; Tying Workbench
            </h2>
            <p className="text-[#A8B2BD] text-center mb-12 max-w-xl mx-auto">
              120+ catalog patterns with structured recipes, 500+ tying materials, and a personal fly box that tracks what works.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Bug, title: "Fly Library", desc: "120+ patterns with photos, tying steps, materials, and fishing tips. Nymphs, dries, streamers, emergers, and more.", href: "/flies", cta: "Browse Library", color: "#E8923A" },
              { icon: Wrench, title: "Tying Workbench", desc: "Structured recipes with real materials from our database. Track your inventory. See what you can tie with what you own.", href: "/my-flies?tab=workbench", cta: "Open Workbench", color: "#E8923A" },
              { icon: SearchIcon, title: "Materials Database", desc: "500+ hooks, beads, threads, dubbing, and feathers from brands like Tiemco, Semperfli, and Fulling Mill.", href: "/flies/materials", cta: "Browse Materials", color: "#0BA5C7" },
            ].map((item, i) => (
              <ScrollAnimation key={item.title} delay={i * 0.1}>
                <Link href={item.href} className="group block bg-[#161B22] border border-[#21262D] rounded-2xl p-6 hover:border-[#E8923A]/40 transition-colors h-full">
                  <item.icon className="h-7 w-7 mb-4" style={{ color: item.color }} strokeWidth={1.5} />
                  <h3 className="text-[#F0F6FC] font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-[#A8B2BD] text-sm leading-relaxed mb-4">{item.desc}</p>
                  <span className="font-['IBM_Plex_Mono'] text-xs text-[#0BA5C7] group-hover:text-[#E8923A] transition-colors">
                    {item.cta} &rarr;
                  </span>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. RIVERS — Live conditions ──────────────────────────────── */}
      <section className="bg-[#161B22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <p className="font-['IBM_Plex_Mono'] text-[#0BA5C7] text-xs uppercase tracking-[0.15em] mb-4 text-center">RIVERS</p>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              What&apos;s Happening on the Water
            </h2>
            <p className="text-[#A8B2BD] text-center mb-12 max-w-xl mx-auto">
              Live USGS flow data, hatch charts, and catch reports across 200+ rivers.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {RIVERS.map((r, i) => (
              <ScrollAnimation key={r.name} delay={i * 0.08}>
                <Link href={r.href} className="block bg-[#1F2937] border border-[#21262D] rounded-2xl p-6 hover:border-[#E8923A] transition-colors group">
                  <p className="font-['IBM_Plex_Mono'] text-[#A8B2BD] text-xs uppercase tracking-wider mb-1">{r.location}</p>
                  <h3 className="font-['DM_Serif_Display'] text-[#F0F6FC] text-xl mb-4">{r.name}</h3>
                  <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-4xl font-normal mb-0.5">{r.fish}</div>
                  <div className="font-['IBM_Plex_Mono'] text-[#A8B2BD] text-xs mb-3">fish this week</div>
                  <div className="font-['IBM_Plex_Mono'] text-[#0BA5C7] text-xs mb-4">{"\u25CF"} {r.ago}</div>
                  <span className="font-['IBM_Plex_Mono'] text-xs text-[#A8B2BD] group-hover:text-[#E8923A] transition-colors">
                    View River &rarr;
                  </span>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
          <ScrollAnimation delay={0.3}>
            <div className="text-center">
              <Link href="/rivers" className="text-[#0BA5C7] hover:text-[#E8923A] font-medium transition-colors">
                Explore all 200+ tracked rivers &rarr;
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 5. PRO — Intelligence layer ──────────────────────────────── */}
      <section className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollAnimation>
              <div className="inline-flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-[#E8923A]" />
                <span className="font-['IBM_Plex_Mono'] text-[#E8923A] text-xs uppercase tracking-[0.2em]">
                  Pro &mdash; $2.99/mo
                </span>
              </div>
              <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl mb-4">
                See the Patterns
              </h2>
              <p className="text-[#A8B2BD] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                Your own analytics engine: which flies work where, your best rivers, per-river Awards, live leaderboards, and the flow ranges where you actually catch fish.
              </p>
            </ScrollAnimation>
            <ScrollAnimation delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  { title: "Insights Dashboard", desc: "Fly effectiveness, best rivers, time-of-day and weather correlations &mdash; straight from your sessions" },
                  { title: "Awards & Leaderboards", desc: "Per-river progression from Regular to Master Angler, plus where you rank on your home water" },
                  { title: "Best Window Calculator", desc: "Your personal catch history overlaid on live USGS flow &mdash; know when to drop everything and go" },
                ].map((f) => (
                  <div key={f.title} className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 text-left">
                    <h4 className="text-[#F0F6FC] font-semibold text-sm mb-1">{f.title}</h4>
                    <p className="text-[#6E7681] text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.25}>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg"
              >
                See Plans &amp; Pricing
              </Link>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── 6. DISCOVER — Directory ──────────────────────────────────── */}
      <section className="bg-[#161B22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              Discover
            </h2>
            <p className="text-[#A8B2BD] text-center mb-12 max-w-xl mx-auto">
              Destinations, lodges, guides, fly shops, species, and expert resources.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Map, label: "Destinations", count: "30", href: "/destinations" },
              { icon: Droplets, label: "Rivers", count: "200+", href: "/rivers" },
              { icon: Bug, label: "Species", count: "35", href: "/species" },
              { icon: "🏨", label: "Lodges", count: "32", href: "/lodges" },
              { icon: "🎣", label: "Guides", count: "31", href: "/guides" },
              { icon: "🏪", label: "Fly Shops", count: "27", href: "/fly-shops" },
            ].map((item, i) => (
              <ScrollAnimation key={item.label} delay={i * 0.05}>
                <Link href={item.href} className="group block bg-[#1F2937] border border-[#21262D] rounded-xl p-4 hover:border-[#6E7681] transition-colors text-center">
                  {typeof item.icon === "string" ? (
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                  ) : (
                    <item.icon className="h-6 w-6 mx-auto mb-2 text-[#0BA5C7]" strokeWidth={1.5} />
                  )}
                  <p className="text-[#F0F6FC] text-sm font-semibold group-hover:text-[#E8923A] transition-colors">{item.label}</p>
                  <p className="font-['IBM_Plex_Mono'] text-[#6E7681] text-xs">{item.count}</p>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. ARTICLES ──────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              From the Water
            </h2>
            <p className="text-[#A8B2BD] text-center mb-12 max-w-2xl mx-auto">
              Dispatches, technique, and destination guides from serious anglers.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article, i) => (
              <ScrollAnimation key={article.id} delay={i * 0.1}>
                <Link href={`/articles/${article.slug}`} className="group block bg-[#161B22] border border-[#21262D] rounded-2xl overflow-hidden hover:border-[#6E7681] transition-colors">
                  <div className="p-6">
                    <div className="text-[#0BA5C7] text-xs uppercase tracking-wider mb-3 font-['IBM_Plex_Mono']">{article.category}</div>
                    <h3 className="font-['DM_Serif_Display'] text-xl text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors mb-2 leading-tight">{article.title}</h3>
                    <p className="text-[#A8B2BD] text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                    <p className="font-['IBM_Plex_Mono'] text-[#6E7681] text-xs">{article.readingTimeMinutes} min &bull; {article.author}</p>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
          <ScrollAnimation delay={0.3}>
            <div className="mt-10 text-center">
              <Link href="/articles" className="inline-flex items-center gap-2 text-[#0BA5C7] hover:text-[#E8923A] font-medium transition-colors">
                Read all articles &rarr;
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 8. FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative bg-[#0D1117] border-t border-[#21262D] py-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#E8923A] opacity-[0.09] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-5xl mb-4">
              Start fishing smarter.
            </h2>
            <p className="text-[#A8B2BD] text-lg mb-10 max-w-xl mx-auto">
              Free to start. Log unlimited sessions. Upgrade when your data demands it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download for iPhone
              </a>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-semibold rounded-xl hover:border-[#6E7681] transition-colors"
              >
                Open Web App
              </Link>
            </div>
            <p className="mt-6 font-['IBM_Plex_Mono'] text-[#6E7681] text-xs">
              Available on iPhone &bull; Android coming soon
            </p>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}
