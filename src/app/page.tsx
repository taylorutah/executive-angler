import type { Metadata } from "next";
import Link from "next/link";
import {
  Check, Smartphone, Activity, BarChart3, Bug, Droplets,
  BookOpen, Map, Wrench, Search as SearchIcon, Sparkles
} from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getFeaturedArticles } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Fly Fishing Intelligence: Journal, Flies, Rivers`,
  description: "Log every session, build structured fly recipes, track 200+ rivers with live USGS conditions, and get AI-powered insights. Free fly fishing app for iOS, Android, and web.",
  openGraph: {
    title: `${SITE_NAME} — Log Catches, Tie Better Flies, Fish Smarter`,
    description: "The fly fishing intelligence platform. Journal your sessions, build fly recipes, track river conditions, and analyze patterns. Free on iOS, Android, and web.",
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
  { icon: BarChart3, text: "AI-powered insights from your catch history and conditions" },
];

export default async function HomePage() {
  const featuredArticles = await getFeaturedArticles().then((a) => a.slice(0, 3));

  return (
    <>
      {/* ── 1. HERO — FOUR PILLARS ───────────────────────────────────── */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#0D1117] flex items-center justify-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0BA5C7] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E8923A] opacity-10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-20">
          <ScrollAnimation>
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8923A] animate-pulse" />
              <span className="font-['IBM_Plex_Mono'] text-[#E8923A] text-xs uppercase tracking-[0.2em]">
                iOS &amp; Android coming soon &bull; Web live now
              </span>
            </div>
          </ScrollAnimation>
          <ScrollAnimation delay={0.1}>
            <h1 className="text-[#F0F6FC] font-['DM_Serif_Display'] font-normal leading-[1.05] mb-6" style={{ fontSize: "clamp(3rem, 8vw, 5rem)", letterSpacing: "-0.02em" }}>
              Log it. Learn from it.<br />Fish better.
            </h1>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2}>
            <p className="text-[#A8B2BD] text-lg max-w-xl mx-auto leading-relaxed mb-10">
              The fly fishing intelligence platform. Journal every session, build fly recipes, track river conditions, and let your data show you what works.
            </p>
          </ScrollAnimation>

          {/* CTA buttons */}
          <ScrollAnimation delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg text-base"
              >
                Start Free
              </Link>
              <Link
                href="/flies"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-semibold rounded-xl hover:border-[#6E7681] transition-colors text-base"
              >
                Browse Fly Library
              </Link>
            </div>
          </ScrollAnimation>

          {/* Pillar feature pills */}
          <ScrollAnimation delay={0.35}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-2xl mx-auto">
              {PILLAR_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2.5 bg-[#161B22] border border-[#21262D] rounded-xl px-4 py-3">
                  <f.icon className="h-4 w-4 text-[#E8923A] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-[#A8B2BD] text-xs text-left leading-snug">{f.text}</span>
                </div>
              ))}
            </div>
          </ScrollAnimation>

          {/* Four pillar nav cards */}
          <ScrollAnimation delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
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
                  "AI-powered insights: best fly, peak hour, optimal conditions",
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
              { icon: Wrench, title: "Tying Workbench", desc: "Structured recipes with real materials from our database. Track your inventory. See what you can tie with what you own.", href: "/journal/flies/workbench", cta: "Open Workbench", color: "#E8923A" },
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
                  Pro &mdash; $4.99/mo
                </span>
              </div>
              <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl mb-4">
                Unlock Intelligence
              </h2>
              <p className="text-[#A8B2BD] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                AI journal analysis, advanced analytics, full history, data export, and the complete tying workbench. Your data, amplified.
              </p>
            </ScrollAnimation>
            <ScrollAnimation delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  { title: "AI Insights", desc: "Natural-language analysis of your catch patterns, conditions, and fly effectiveness" },
                  { title: "Full History", desc: "Unlimited session history with year-over-year trends and personal bests" },
                  { title: "Data Export", desc: "CSV and PDF exports of every session, catch, and fly in your journal" },
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#E8923A] opacity-[0.07] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-5xl mb-4">
              Start fishing smarter.
            </h2>
            <p className="text-[#A8B2BD] text-lg mb-10 max-w-xl mx-auto">
              Free to start. Log unlimited sessions. Upgrade when your data demands it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                href="/flies"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-semibold rounded-xl hover:border-[#6E7681] transition-colors"
              >
                Explore the Fly Library
              </Link>
            </div>
            <p className="mt-6 font-['IBM_Plex_Mono'] text-[#6E7681] text-xs">
              Web app live now &bull; iOS &amp; Android coming soon
            </p>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}
