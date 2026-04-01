"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, Search, User, Star, Package, Bell,
  MessageSquare, Map, Mountain, Fish, Building2, Compass,
  BookOpen, ShoppingBag, Users2, Newspaper, Bug,
  Plus, FishSymbol, Lightbulb, GitPullRequest, Sparkles
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationDropdown";
import { MessageIcon } from "@/components/notifications/MessageIcon";

/* ── Category bar links (Tier 2) ── */
const CATEGORY_NAV = [
  { label: "Rivers", href: "/rivers" },
  { label: "Flies", href: "/flies" },
  { label: "Species", href: "/species" },
  { label: "Destinations", href: "/destinations" },
  { label: "Lodges", href: "/lodges" },
  { label: "Guides", href: "/guides" },
  { label: "Fly Shops", href: "/fly-shops" },
  { label: "Articles", href: "/articles" },
];

/* ── Explore deep-link data (mobile hamburger accordion) ── */
const EXPLORE_SECTIONS = [
  {
    title: "Destinations",
    icon: Mountain,
    links: [
      { label: "Montana", href: "/destinations/montana" },
      { label: "Wyoming", href: "/destinations/wyoming" },
      { label: "Colorado", href: "/destinations/colorado" },
      { label: "Idaho", href: "/destinations/idaho" },
      { label: "Alaska", href: "/destinations/alaska" },
      { label: "New Zealand", href: "/destinations/new-zealand" },
    ],
    viewAll: { label: "All Destinations", href: "/destinations" },
  },
  {
    title: "Rivers",
    icon: Map,
    links: [
      { label: "Madison River", href: "/rivers/madison-river" },
      { label: "Yellowstone River", href: "/rivers/yellowstone-river" },
      { label: "Missouri River", href: "/rivers/missouri-river" },
      { label: "Gallatin River", href: "/rivers/gallatin-river" },
      { label: "Green River", href: "/rivers/green-river" },
      { label: "Provo River", href: "/rivers/provo-river" },
    ],
    viewAll: { label: "All Rivers", href: "/rivers" },
  },
  {
    title: "Species",
    icon: Fish,
    links: [
      { label: "Rainbow Trout", href: "/species/rainbow-trout" },
      { label: "Brown Trout", href: "/species/brown-trout" },
      { label: "Cutthroat Trout", href: "/species/cutthroat-trout" },
      { label: "Brook Trout", href: "/species/brook-trout" },
    ],
    viewAll: { label: "All Species", href: "/species" },
  },
  {
    title: "Fly Library",
    icon: Bug,
    links: [
      { label: "Dry Flies", href: "/flies/category/dry" },
      { label: "Nymphs", href: "/flies/category/nymph" },
      { label: "Streamers", href: "/flies/category/streamer" },
      { label: "Emergers", href: "/flies/category/emerger" },
      { label: "Terrestrials", href: "/flies/category/terrestrial" },
    ],
    viewAll: { label: "All Patterns", href: "/flies" },
  },
  {
    title: "Directory",
    icon: Building2,
    links: [
      { label: "Lodges", href: "/lodges" },
      { label: "Guides", href: "/guides" },
      { label: "Fly Shops", href: "/fly-shops" },
    ],
  },
  {
    title: "Learn",
    icon: Newspaper,
    links: [
      { label: "Articles", href: "/articles" },
      { label: "Techniques", href: "/articles?category=technique" },
      { label: "Gear Reviews", href: "/articles?category=gear" },
      { label: "Conservation", href: "/articles?category=conservation" },
    ],
  },
];

/* ── Main nav items (Tier 1, app-level) ── */
const MAIN_NAV = [
  { label: "Journal", href: "/journal", authOnly: true },
  { label: "Flies", href: "/flies", authOnly: false },
  { label: "Rivers", href: "/rivers", authOnly: false },
  { label: "Feed", href: "/feed", authOnly: true },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; avatarUrl?: string; displayName?: string; isPremium?: boolean } | null>(null);
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setPlusOpen(false); }, [pathname]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUserProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setUser(null); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, is_premium")
        .eq("user_id", authUser.id)
        .maybeSingle();
      setUser({
        email: authUser.email ?? undefined,
        avatarUrl: profile?.avatar_url || undefined,
        displayName: profile?.display_name || authUser.user_metadata?.display_name || undefined,
        isPremium: profile?.is_premium || false,
      });
    }

    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchUserProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        window.location.href = "/search";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close plus menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setPlusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* ── Tier 1: Primary Bar ── */}
        <div className="ea-header-primary border-b border-[#21262D]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0 cursor-pointer select-none">
                <Image
                  src="/images/logo-horizontal-white.svg"
                  alt="Executive Angler"
                  width={160}
                  height={32}
                  className="h-7 w-auto block dark-logo pointer-events-none"
                  priority
                  draggable={false}
                />
                <Image
                  src="/images/logo-horizontal-forest.svg"
                  alt="Executive Angler"
                  width={160}
                  height={32}
                  className="h-7 w-auto hidden light-logo pointer-events-none"
                  priority
                  draggable={false}
                />
              </Link>

              {/* ── Desktop App Nav (Tier 1 center) ── */}
              <nav className="hidden lg:flex items-center gap-1">
                {MAIN_NAV.map((link) => {
                  if (link.authOnly && !user) return null;
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "text-[#F0F6FC]"
                          : "text-[#A8B2BD] hover:text-[#F0F6FC]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {!user?.isPremium && (
                  <Link
                    href="/pricing"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/pricing"
                        ? "text-[#E8923A]"
                        : "text-[#E8923A]/70 hover:text-[#E8923A]"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Pro
                  </Link>
                )}
              </nav>

              {/* ── Right Actions ── */}
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Link
                  href="/search"
                  className="flex items-center px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-[#1F2937] text-[#A8B2BD] hover:text-[#F0F6FC]"
                  title="Search (⌘K)"
                >
                  <Search className="h-4.5 w-4.5" />
                </Link>

                {user ? (
                  <div className="hidden sm:flex items-center gap-0.5">
                    <NotificationBell />
                    <MessageIcon />
                    <Link href="/account" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1F2937] transition-colors ml-1">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-[#1F2937] flex items-center justify-center flex-shrink-0 ring-2 ring-transparent hover:ring-[#E8923A]/40 transition-all">
                        {user?.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs font-bold text-[#A8B2BD]">
                            {(user?.displayName || user?.email || "A")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#E8923A] text-white hover:bg-[#d17d28] transition-colors"
                    >
                      Join Free
                    </Link>
                  </div>
                )}

                {/* ── Plus / Quick Actions ── */}
                {user && (
                  <div ref={plusRef} className="relative">
                    <button
                      onClick={() => setPlusOpen(!plusOpen)}
                      aria-label="Quick actions"
                      className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#E8923A] text-white hover:bg-[#F0A65A] transition-all shadow-md hover:shadow-lg active:scale-95 ${plusOpen ? "rotate-45" : ""} duration-200`}
                    >
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                    </button>

                    {plusOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-[#161B22] border border-[#21262D] rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                        <div className="h-0.5 bg-[#E8923A]" />
                        <div className="py-1">
                          <Link
                            href="/journal/new"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-[#F0F6FC] hover:bg-[#0D1117] transition-colors"
                          >
                            <FishSymbol className="h-5 w-5 text-[#E8923A] flex-shrink-0" />
                            Log a Session
                          </Link>
                          <div className="h-px bg-[#21262D] mx-4" />
                          <Link
                            href="/contribute"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-[#F0F6FC] hover:bg-[#0D1117] transition-colors"
                          >
                            <GitPullRequest className="h-5 w-5 text-[#E8923A] flex-shrink-0" />
                            Contribute
                          </Link>
                          <Link
                            href="/feedback"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-[#F0F6FC] hover:bg-[#0D1117] transition-colors"
                          >
                            <Lightbulb className="h-5 w-5 text-[#E8923A] flex-shrink-0" />
                            Share an Idea
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2 rounded-lg text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tier 2: Category Bar ── */}
        <div className="ea-header-category border-b border-[#21262D]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-9 overflow-x-auto scrollbar-hide category-bar-fade lg:overflow-visible lg:justify-center">
              <div className="flex items-center gap-1 whitespace-nowrap lg:whitespace-normal">
                {CATEGORY_NAV.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-colors border-b-2 ${
                        isActive
                          ? "text-[#F0F6FC] border-[#E8923A]"
                          : "text-[#A8B2BD] border-transparent hover:text-[#F0F6FC]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ top: "84px" }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-[#161B22] shadow-2xl overflow-y-auto animate-fade-in border-l border-[#21262D]">
            <div className="p-5">
              {/* Search */}
              <Link
                href="/search"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC] transition-colors"
              >
                <Search className="h-5 w-5" />
                Search
              </Link>

              {/* Main nav */}
              {user && (
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    pathname === "/dashboard" ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/feed"
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  pathname === "/feed" ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                }`}
              >
                Feed
              </Link>
              {user && (
                <Link
                  href="/journal"
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    pathname.startsWith("/journal") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                  }`}
                >
                  Journal
                </Link>
              )}
              <Link
                href="/pricing"
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  pathname === "/pricing" ? "bg-[#E8923A]/10 text-[#E8923A]" : "text-[#E8923A]/70 hover:text-[#E8923A] hover:bg-[#E8923A]/5"
                }`}
              >
                <Sparkles className="h-5 w-5" />
                Pro
              </Link>

              {/* Explore accordion */}
              <div className="mt-4 pt-4 border-t border-[#21262D]">
                <button
                  onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-[#E8923A] rounded-lg hover:bg-[#0D1117] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Explore
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileExploreOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileExploreOpen && (
                  <div className="mt-1 space-y-3 pb-2">
                    {EXPLORE_SECTIONS.map((section) => {
                      const Icon = section.icon;
                      return (
                        <div key={section.title} className="px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-3.5 w-3.5 text-[#E8923A]" />
                            <span className="text-[10px] font-bold text-[#6E7681] uppercase tracking-widest">{section.title}</span>
                          </div>
                          {section.links.map((link) => (
                            <Link
                              key={link.href + link.label}
                              href={link.href}
                              className="block px-3 py-2 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#0D1117] rounded transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                          {section.viewAll && (
                            <Link
                              href={section.viewAll.href}
                              className="block px-3 py-1.5 text-xs font-medium text-[#0BA5C7] hover:text-[#F0F6FC] transition-colors"
                            >
                              {section.viewAll.label} &rarr;
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick actions — mobile */}
              {user && (
                <div className="mt-4 pt-4 border-t border-[#21262D] space-y-1">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">Quick Actions</p>
                  <Link href="/journal/new" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#F0F6FC] rounded-lg hover:bg-[#0D1117] transition-colors">
                    <FishSymbol className="h-5 w-5 text-[#E8923A]" /> Log a Session
                  </Link>
                  <Link href="/contribute" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC] transition-colors">
                    <GitPullRequest className="h-5 w-5 text-[#E8923A]" /> Contribute
                  </Link>
                  <Link href="/feedback" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC] transition-colors">
                    <Lightbulb className="h-5 w-5 text-[#E8923A]" /> Share an Idea
                  </Link>
                </div>
              )}

              {/* User section */}
              <div className="mt-4 pt-4 border-t border-[#21262D] space-y-1">
                {user ? (
                  <>
                    <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <Bell className="h-5 w-5" /> Notifications
                    </Link>
                    <Link href="/messages" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <MessageSquare className="h-5 w-5" /> Messages
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <Star className="h-5 w-5" /> Favorites
                    </Link>
                    <Link href="/account/gear" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <Package className="h-5 w-5" /> Gear Locker
                    </Link>
                    <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <User className="h-5 w-5" /> Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block px-4 py-3 text-base font-medium text-white bg-[#E8923A] rounded-lg text-center hover:bg-[#d17d28]">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-center"><ThemeToggle /></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
