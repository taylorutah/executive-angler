import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Droplets, Building2, ShoppingBag, Compass, BookOpen, Check } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import WaitlistSection from "@/components/sections/WaitlistSection";
import { getFeaturedArticles } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — World-Class Fly Fishing Resource`,
  description: "The definitive fly fishing resource — rivers, destinations, lodges, guides, fly shops, and expert content. Track every session with the Executive Angler app.",
  openGraph: {
    title: `${SITE_NAME} — World-Class Fly Fishing Resource`,
    description: "Explore rivers, plan trips, track every fish.",
    url: SITE_URL,
  },
  alternates: { canonical: SITE_URL },
};

export const revalidate = 3600;

async function getWaitlistCount(): Promise<number> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return 0;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

const RIVERS = [
  { name: "Green River", location: "UTAH", fish: 34, ago: "2h ago", href: "/rivers/green-river" },
  { name: "Madison River", location: "MONTANA", fish: 142, ago: "45m ago", href: "/rivers/madison-river" },
  { name: "Henry's Fork", location: "IDAHO", fish: 67, ago: "1h ago", href: "/rivers/henrys-fork" },
  { name: "Yellowstone River", location: "WYOMING", fish: 28, ago: "3h ago", href: "/rivers/yellowstone-river" },
];

const EXPLORE = [
  { icon: MapPin, label: "Destinations", desc: "Montana, Idaho, New Zealand and beyond.", href: "/destinations", color: "#00B4D8" },
  { icon: Droplets, label: "Rivers", desc: "204 rivers with conditions, hatches, and access info.", href: "/rivers", color: "#00B4D8" },
  { icon: Building2, label: "Lodges", desc: "World-class lodges and outfitters.", href: "/lodges", color: "#E8923A" },
  { icon: ShoppingBag, label: "Fly Shops", desc: "Find gear and local knowledge near any fishery.", href: "/fly-shops", color: "#E8923A" },
  { icon: Compass, label: "Guides", desc: "Experienced guides across every major fishery.", href: "/guides", color: "#00B4D8" },
  { icon: BookOpen, label: "Resources", desc: "Techniques, gear reviews, and destination guides.", href: "/articles", color: "#E8923A" },
];

export default async function HomePage() {
  const [featuredArticles, waitlistCount] = await Promise.all([
    getFeaturedArticles().then((a) => a.slice(0, 3)),
    getWaitlistCount(),
  ]);

  return (
    <>
      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#0D1117] flex items-center justify-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00B4D8] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E8923A] opacity-10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-20">
          <ScrollAnimation>
            <p className="text-[#00B4D8] font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.15em] mb-6">
              WORLD-CLASS FLY FISHING INTEL
            </p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.1}>
            <h1 className="text-[#F0F6FC] font-['DM_Serif_Display'] font-normal leading-[1.05] mb-6" style={{ fontSize: "clamp(3rem, 8vw, 5rem)", letterSpacing: "-0.02em" }}>
              Every cast.<br />Every fish.<br />Every river.
            </h1>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2}>
            <p className="text-[#8B949E] text-lg max-w-lg mx-auto leading-relaxed mb-10">
              The definitive resource for serious fly anglers. Explore rivers, plan your next trip, and track every fish.
            </p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/rivers" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg">
                Explore Rivers →
              </Link>
              <Link href="/destinations" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#00B4D8] text-[#00B4D8] font-medium rounded-xl hover:bg-[#00B4D8]/10 transition-colors">
                Explore Destinations
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-16">
              {[{ label: "🎣 Fly Shops", href: "/fly-shops" }, { label: "🗺 Guides", href: "/guides" }, { label: "📖 Articles", href: "/articles" }].map((pill) => (
                <Link key={pill.href} href={pill.href} className="font-['IBM_Plex_Mono'] text-xs bg-[#161B22] border border-[#21262D] rounded-full px-4 py-2 text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#484F58] transition-colors">
                  {pill.label}
                </Link>
              ))}
            </div>
          </ScrollAnimation>
          <ScrollAnimation delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { n: "12,400", label: "Fish Logged" },
                { n: "204", label: "Rivers Tracked" },
                { n: "847", label: "Active Anglers" },
              ].map((s) => (
                <div key={s.label} className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                  <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-5xl font-normal mb-1">{s.n}</div>
                  <div className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs uppercase tracking-[0.1em]">{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 2. ON THE WATER ───────────────────────────────────────────────── */}
      <section className="bg-[#161B22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              What&apos;s Happening on the Water
            </h2>
            <p className="text-[#8B949E] text-center mb-12 max-w-xl mx-auto">
              Real catch data from anglers in the field. Public sessions updated daily.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {RIVERS.map((r, i) => (
              <ScrollAnimation key={r.name} delay={i * 0.08}>
                <div className="bg-[#1F2937] border border-[#21262D] rounded-2xl p-6 hover:border-[#E8923A] transition-colors group">
                  <p className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs uppercase tracking-wider mb-1">{r.location}</p>
                  <h3 className="font-['DM_Serif_Display'] text-[#F0F6FC] text-xl mb-4">{r.name}</h3>
                  <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-4xl font-normal mb-0.5">{r.fish}</div>
                  <div className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs mb-3">fish this week</div>
                  <div className="font-['IBM_Plex_Mono'] text-[#00B4D8] text-xs mb-4">● {r.ago}</div>
                  <Link href={r.href} className="font-['IBM_Plex_Mono'] text-xs text-[#8B949E] group-hover:text-[#E8923A] transition-colors">
                    View River →
                  </Link>
                </div>
              </ScrollAnimation>
            ))}
          </div>
          <ScrollAnimation delay={0.3}>
            <div className="text-center">
              <Link href="/rivers" className="text-[#00B4D8] hover:text-[#E8923A] font-medium transition-colors">
                Explore all 204 tracked rivers →
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 3. EXPLORE THE WORLD ──────────────────────────────────────────── */}
      <section className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              Explore the World&apos;s Best Fly Fishing
            </h2>
            <p className="text-[#8B949E] text-center mb-12 max-w-xl mx-auto">
              Hand-curated destinations, rivers, lodges, guides, fly shops, and expert resources.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXPLORE.map((item, i) => (
              <ScrollAnimation key={item.label} delay={i * 0.07}>
                <Link href={item.href} className="group block bg-[#161B22] border border-[#21262D] rounded-2xl p-6 hover:border-[#484F58] transition-colors">
                  <item.icon className="h-7 w-7 mb-3" style={{ color: item.color }} strokeWidth={1.5} />
                  <h3 className="font-['DM_Sans'] font-semibold text-lg text-[#F0F6FC] mb-1">{item.label}</h3>
                  <p className="text-[#8B949E] text-sm leading-relaxed mb-3">{item.desc}</p>
                  <span className="font-['IBM_Plex_Mono'] text-xs text-[#00B4D8] group-hover:text-[#E8923A] transition-colors">Explore →</span>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. APP — LOG EVERY FISH ───────────────────────────────────────── */}
      <section className="bg-[#161B22] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Session card mockup */}
            <ScrollAnimation>
              <div className="bg-[#1F2937] border border-[#21262D] rounded-2xl p-6 shadow-2xl">
                <h3 className="font-['DM_Serif_Display'] text-[#F0F6FC] text-2xl mb-1">Green River, Utah</h3>
                <p className="font-['IBM_Plex_Mono'] text-[#8B949E] text-xs mb-6">March 8, 2026 • 7:42 AM</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[{ n: "14", l: "Fish" }, { n: "3h 12m", l: "Duration" }, { n: `18"`, l: "Best" }].map((s) => (
                    <div key={s.l}>
                      <div className="font-['IBM_Plex_Mono'] text-[#E8923A] text-3xl font-normal">{s.n}</div>
                      <div className="text-[#8B949E] text-xs">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["54°F", "#18 RS2", "Clear", "1,240 cfs"].map((tag) => (
                    <span key={tag} className="font-['IBM_Plex_Mono'] text-xs bg-[rgba(0,180,216,0.1)] border border-[rgba(0,180,216,0.2)] text-[#00B4D8] rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
            {/* Copy */}
            <ScrollAnimation delay={0.2}>
              <p className="font-['IBM_Plex_Mono'] text-[#00B4D8] text-xs uppercase tracking-[0.15em] mb-4">EXECUTIVE ANGLER APP</p>
              <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl mb-4">
                Your journal.<br />Your data.<br />Your river.
              </h2>
              <p className="text-[#8B949E] text-lg leading-relaxed mb-6">
                Every session on the water, captured in full. Species, length, fly, conditions — all in one place. Public or private. Your data, yours forever.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Start a session. Log fish as you catch them.",
                  "Share your best days. Keep the rest private.",
                  "See what others are catching on your home water.",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[#3FB950] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-[#8B949E] text-sm">{line}</span>
                  </div>
                ))}
              </div>
              <Link href="#" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg">
                Download on App Store
              </Link>
              <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs mt-3">iPhone + Apple Watch • Free to start</p>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── 5. WAITLIST ───────────────────────────────────────────────────── */}
      <WaitlistSection initialCount={waitlistCount} />

      {/* ── 6. FROM THE WATER (articles) ──────────────────────────────────── */}
      <section className="bg-[#0D1117] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-4xl text-center mb-3">
              From the Water
            </h2>
            <p className="text-[#8B949E] text-center mb-12 max-w-2xl mx-auto">
              Dispatches, technique, and destination guides from serious anglers.
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article, i) => (
              <ScrollAnimation key={article.id} delay={i * 0.1}>
                <Link href={`/articles/${article.slug}`} className="group block bg-[#161B22] border border-[#21262D] rounded-2xl overflow-hidden hover:border-[#484F58] transition-colors">
                  <div className="p-6">
                    <div className="text-[#00B4D8] text-xs uppercase tracking-wider mb-3 font-['IBM_Plex_Mono']">{article.category}</div>
                    <h3 className="font-['DM_Serif_Display'] text-xl text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors mb-2 leading-tight">{article.title}</h3>
                    <p className="text-[#8B949E] text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                    <p className="font-['IBM_Plex_Mono'] text-[#484F58] text-xs">{article.readingTimeMinutes} min • {article.author}</p>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
          <ScrollAnimation delay={0.3}>
            <div className="mt-10 text-center">
              <Link href="/articles" className="inline-flex items-center gap-2 text-[#00B4D8] hover:text-[#E8923A] font-medium transition-colors">
                Read all articles →
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 6. FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] border-t border-[#21262D] py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <ScrollAnimation>
            <h2 className="text-[#F0F6FC] font-['DM_Serif_Display'] text-5xl mb-4">
              Join the water.<br />Log your first session.
            </h2>
            <p className="text-[#8B949E] text-lg mb-10 max-w-xl mx-auto">
              Executive Angler is free to start. Track your sessions, log your catches, and explore the world&apos;s best fly fishing — all in one place.
            </p>
            <Link href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors shadow-lg text-lg">
              Download on App Store
            </Link>
            <p className="mt-4 font-['IBM_Plex_Mono'] text-[#484F58] text-xs">
              iPhone + Apple Watch • watchOS companion included
            </p>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}
