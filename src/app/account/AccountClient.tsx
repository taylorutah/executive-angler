"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Fish, MapPin, Feather, Trophy, LogOut, Save, Heart, Camera, Package, X, Bell, Users, Shield, Key, Link2, ChevronRight, Settings, User, Award } from "lucide-react";
import { formatDate } from "@/lib/date";
import Image from "next/image";
import AvatarCropModal from "@/components/AvatarCropModal";

const BADGE_SVG_MAP: Record<string, string> = {
  first_timer: "/badges/sessions_10.svg",
  regular: "/badges/sessions_50.svg",
  veteran: "/badges/sessions_100.svg",
  legend: "/badges/sessions_500.svg",
  centurion: "/badges/catches_100.svg",
  master_angler: "/badges/catches_1000.svg",
  consistent_producer: "/badges/catches_500.svg",
  species_hunter: "/badges/species_5.svg",
  sessions_10: "/badges/sessions_10.svg",
  sessions_50: "/badges/sessions_50.svg",
  sessions_100: "/badges/sessions_100.svg",
  sessions_500: "/badges/sessions_500.svg",
  catches_100: "/badges/catches_100.svg",
  catches_500: "/badges/catches_500.svg",
  catches_1000: "/badges/catches_1000.svg",
  species_5: "/badges/species_5.svg",
  species_15: "/badges/species_15.svg",
  species_30: "/badges/species_30.svg",
  rivers_5: "/badges/rivers_5.svg",
  rivers_15: "/badges/rivers_15.svg",
  rivers_30: "/badges/rivers_30.svg",
  streak_4: "/badges/streak_4.svg",
  streak_12: "/badges/streak_12.svg",
};

type Section = "overview" | "profile" | "notifications" | "security" | "connected";

interface Props {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    username?: string;
    bio?: string;
    homeLocation?: string;
    isPrivate?: boolean;
  };
  feedDisplay: "collage" | "map";
  stats: {
    totalSessions: number;
    totalFish: number;
    totalRivers: number;
    totalFlies: number;
    totalFavorites: number;
    biggestFish: number | null;
    bestSession: { river_name: string; date: string; total_fish: number; location?: string } | null;
  };
  awards?: Array<{
    award_key: string;
    river_name?: string;
    awarded_at: string;
    metadata: { badge_icon?: string; badge_color?: string; display_name?: string; description?: string };
  }>;
  welcome?: boolean;
  socialCounts?: {
    followers: number;
    following: number;
  };
  notificationPrefs: {
    emailNotifyFollows: boolean;
    emailNotifyComments: boolean;
    emailNotifyLikes: boolean;
    emailDigestFrequency: "none" | "daily" | "weekly";
  };
}

export default function AccountClient({ user, feedDisplay: initialFeedDisplay, stats, awards = [], welcome, socialCounts, notificationPrefs }: Props) {
  const router = useRouter();

  // Determine initial section from URL hash
  const getInitialSection = (): Section => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["overview", "profile", "notifications", "security", "connected"].includes(hash)) return hash as Section;
    }
    return "overview";
  };

  const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [homeLocation, setHomeLocation] = useState(user.homeLocation || "");
  const [isPrivate, setIsPrivate] = useState(user.isPrivate ?? false);
  const [feedDisplay, setFeedDisplay] = useState<"collage" | "map">(initialFeedDisplay);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [showWelcome, setShowWelcome] = useState(welcome ?? false);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleLinking, setGoogleLinking] = useState(false);

  // Notification preferences
  const [notifyFollows, setNotifyFollows] = useState(notificationPrefs.emailNotifyFollows);
  const [notifyComments, setNotifyComments] = useState(notificationPrefs.emailNotifyComments);
  const [notifyLikes, setNotifyLikes] = useState(notificationPrefs.emailNotifyLikes);
  const [digestFrequency, setDigestFrequency] = useState<"none" | "daily" | "weekly">(notificationPrefs.emailDigestFrequency);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Username availability
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(
    async (val: string) => {
      const clean = val.trim().toLowerCase();
      if (!clean || clean.length < 3) { setUsernameAvailable(null); return; }
      if (clean === (user.username || "").toLowerCase()) { setUsernameAvailable(true); return; }
      setUsernameChecking(true);
      try {
        const res = await fetch(`/api/user/username/check?username=${encodeURIComponent(clean)}&current=${encodeURIComponent((user.username || "").toLowerCase())}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch { setUsernameAvailable(null); } finally { setUsernameChecking(false); }
    },
    [user.username]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!username) { setUsernameAvailable(null); setUsernameChecking(false); return; }
    debounceRef.current = setTimeout(() => checkUsername(username), 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, checkUsername]);

  useEffect(() => {
    async function checkGoogleLinked() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.identities) setGoogleLinked(data.user.identities.some((i) => i.provider === "google"));
    }
    checkGoogleLinked();
  }, []);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["overview", "profile", "notifications", "security", "connected"].includes(hash)) {
      setActiveSection(hash as Section);
    }
  }, []);

  function navigateSection(section: Section) {
    setActiveSection(section);
    window.history.replaceState(null, "", `#${section}`);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCropSave(blob: Blob) {
    setCropSrc(null);
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", blob, "avatar.jpg");
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to upload avatar"); return; }
      if (data.url) setAvatarUrl(data.url + `?t=${Date.now()}`);
    } catch { alert("Failed to upload avatar."); } finally { setAvatarUploading(false); }
  }

  const saveDisabled = saving || (username.length >= 3 && usernameAvailable === false) || usernameChecking;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (saveDisabled) return;
    setSaving(true);
    const supabase = createClient();
    const cleanUsername = username.trim().toLowerCase() || null;
    await supabase.auth.updateUser({ data: { display_name: displayName } });
    await supabase.from("profiles").upsert(
      { user_id: user.id, display_name: displayName, username: cleanUsername, bio: bio || null, home_location: homeLocation || null, is_private: isPrivate, feed_display: feedDisplay },
      { onConflict: "user_id" }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match"); return; }
    if (newPassword.length < 8) { setPwError("Min 8 characters"); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPwError(error.message); return; }
    setNewPassword(""); setConfirmPassword("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  }

  async function handleLinkGoogle() {
    setGoogleLinking(true);
    const supabase = createClient();
    await supabase.auth.linkIdentity({ provider: "google", options: { redirectTo: window.location.origin + "/auth/callback?next=/account" } });
  }

  async function handleSaveNotifications() {
    setNotifSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      email_notify_follows: notifyFollows,
      email_notify_comments: notifyComments,
      email_notify_likes: notifyLikes,
      email_digest_frequency: digestFrequency,
    }).eq("user_id", user.id);
    setNotifSaving(false);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const inputCls = "w-full rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-3 text-[#F0F6FC] placeholder:text-[#484F58] focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A] transition-colors";
  const labelCls = "block text-sm font-medium text-[#8B949E] mb-1.5";

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview", icon: User, label: "Overview" },
    { key: "profile", icon: Settings, label: "Edit Profile" },
    { key: "notifications", icon: Bell, label: "Notifications" },
    { key: "security", icon: Key, label: "Security" },
    { key: "connected", icon: Link2, label: "Connected Accounts" },
  ];

  // ─── Quick nav cards ───
  const quickLinks = [
    { href: "/journal", icon: BookOpen, label: "Fishing Journal", sub: `${stats.totalSessions} sessions`, color: "text-[#E8923A]", bg: "bg-[#E8923A]/10" },
    { href: "/journal/flies", icon: Feather, label: "Fly Patterns", sub: `${stats.totalFlies} patterns`, color: "text-purple-400", bg: "bg-purple-400/10" },
    { href: "/account/gear", icon: Package, label: "Gear Locker", sub: "Rods, reels & more", color: "text-[#0BA5C7]", bg: "bg-[#0BA5C7]/10" },
    { href: "/favorites", icon: Heart, label: "Favorites", sub: `${stats.totalFavorites} saved`, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {cropSrc && <AvatarCropModal imageSrc={cropSrc} onSave={handleCropSave} onCancel={() => setCropSrc(null)} />}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Welcome banner */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-[#E8923A] to-[#D4782A] text-white rounded-xl p-4 mb-8 flex items-center justify-between">
            <p className="font-medium">Welcome to Executive Angler! Set up your profile below to get started.</p>
            <button onClick={() => setShowWelcome(false)} className="text-white/80 hover:text-white transition-colors ml-4 flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ─── Profile header (full width) ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
          <label className="cursor-pointer group relative flex-shrink-0">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-[#E8923A]/10 border-2 border-[#21262D] shadow-lg flex items-center justify-center">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="text-3xl font-bold text-[#E8923A]">{(displayName || user.email)[0].toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {avatarUploading ? (
                <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-[#F0F6FC] truncate">{displayName || "Angler"}</h1>
              {username && <span className="text-sm text-[#8B949E] font-mono">@{username}</span>}
            </div>
            <p className="text-sm text-[#484F58] mt-0.5">{user.email}</p>
            {socialCounts && (
              <div className="flex items-center gap-4 mt-2">
                <Link href={`/anglers/${username || user.id}?tab=followers`} className="flex items-center gap-1.5 text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                  <span className="font-semibold text-[#F0F6FC]">{socialCounts.followers}</span> follower{socialCounts.followers !== 1 ? "s" : ""}
                </Link>
                <span className="text-[#21262D]">·</span>
                <Link href={`/anglers/${username || user.id}?tab=following`} className="flex items-center gap-1.5 text-sm text-[#8B949E] hover:text-[#E8923A] transition-colors">
                  <span className="font-semibold text-[#F0F6FC]">{socialCounts.following}</span> following
                </Link>
              </div>
            )}
          </div>

          <button onClick={handleSignOut} className="hidden sm:inline-flex items-center gap-2 text-sm text-[#484F58] hover:text-red-400 transition-colors border border-[#21262D] rounded-lg px-4 py-2 hover:border-red-800">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* ─── Quick nav cards (full width, horizontal) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {quickLinks.map(({ href, icon: Icon, label, sub, color, bg }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-3 bg-[#161B22] border border-[#21262D] rounded-xl p-4 hover:border-[#E8923A]/40 transition-all hover:shadow-lg hover:shadow-[#E8923A]/5">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#F0F6FC] text-sm truncate">{label}</p>
                <p className="text-xs text-[#8B949E]">{sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#21262D] group-hover:text-[#8B949E] transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* ─── Sidebar + Main Content ─── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:sticky lg:top-24">
              {sidebarItems.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => navigateSection(key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === key
                      ? "bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/20"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right main content */}
          <main className="flex-1 min-w-0">
            {/* ═══════ OVERVIEW ═══════ */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { icon: BookOpen, label: "Sessions", value: stats.totalSessions, color: "text-[#E8923A]" },
                    { icon: Fish, label: "Fish Caught", value: stats.totalFish, color: "text-blue-400" },
                    { icon: MapPin, label: "Rivers", value: stats.totalRivers, color: "text-amber-500" },
                    { icon: Feather, label: "Fly Patterns", value: stats.totalFlies, color: "text-purple-400" },
                    { icon: Heart, label: "Favorites", value: stats.totalFavorites, color: "text-red-400" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
                      <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
                      <p className="text-2xl font-bold text-[#F0F6FC] font-mono">{value}</p>
                      <p className="text-xs text-[#8B949E] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Personal bests */}
                {(stats.biggestFish || stats.bestSession) && (
                  <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" /> Personal Bests
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {stats.biggestFish && (
                        <div className="rounded-lg bg-[#0D1117] border border-[#21262D] p-4">
                          <p className="text-xs text-[#8B949E] mb-1">Biggest Fish</p>
                          <p className="text-2xl font-bold text-[#E8923A] font-mono">{stats.biggestFish.toFixed(1)}&quot;</p>
                        </div>
                      )}
                      {stats.bestSession && (
                        <div className="rounded-lg bg-[#0D1117] border border-[#21262D] p-4">
                          <p className="text-xs text-[#8B949E] mb-1">Best Day</p>
                          <p className="text-lg font-bold text-[#E8923A] font-mono">{stats.bestSession.total_fish} fish</p>
                          <p className="text-xs text-[#8B949E] mt-0.5">
                            {stats.bestSession.river_name} · {formatDate(stats.bestSession.date, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievements — compact inline strip */}
                {awards.length > 0 && (
                  <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" /> Achievements
                      </h3>
                      <span className="text-xs text-[#484F58] font-mono">{awards.length} earned</span>
                    </div>
                    {/* Compact badge grid — small circles with tooltips */}
                    <div className="flex flex-wrap gap-2">
                      {awards.slice(0, 20).map((award, i) => {
                        const badgeSrc = BADGE_SVG_MAP[award.award_key];
                        return (
                          <div key={i} className="group relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0D1117] border border-[#21262D] hover:border-[#E8923A]/40 transition-colors cursor-default flex items-center justify-center">
                              {badgeSrc ? (
                                <Image src={badgeSrc} alt={award.metadata.display_name || award.award_key} width={32} height={32} className="w-8 h-8" />
                              ) : (
                                <span className="text-sm">{award.metadata.badge_icon || "🏆"}</span>
                              )}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1F2937] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                              <p className="font-semibold">{award.metadata.display_name || award.award_key}</p>
                              {award.river_name && <p className="text-[#E8923A]">{award.river_name}</p>}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1F2937]" />
                            </div>
                          </div>
                        );
                      })}
                      {awards.length > 20 && (
                        <div className="w-10 h-10 rounded-full bg-[#0D1117] border border-[#21262D] flex items-center justify-center">
                          <span className="text-xs text-[#8B949E] font-mono">+{awards.length - 20}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ EDIT PROFILE ═══════ */}
            {activeSection === "profile" && (
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-6">Edit Profile</h2>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Display Name</label>
                      <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <label className={labelCls}>Username</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-[#484F58] pointer-events-none select-none">@</span>
                        <input
                          className={inputCls + " pl-8 pr-10"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                          placeholder="yourhandle"
                          maxLength={30}
                        />
                        {username.length >= 3 && (
                          <span className="absolute right-3 text-sm pointer-events-none">
                            {usernameChecking ? <span className="text-[#8B949E]">…</span> : usernameAvailable === true ? <span className="text-green-500">✓</span> : usernameAvailable === false ? <span className="text-red-500">✗</span> : null}
                          </span>
                        )}
                      </div>
                      {username.length >= 3 && usernameAvailable === false && <p className="text-xs text-red-500 mt-1">Taken.</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Bio</label>
                    <textarea className={inputCls + " resize-none"} rows={3} maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other anglers about yourself…" />
                    <p className="text-xs text-[#484F58] mt-1 text-right">{bio.length}/160</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Home Location</label>
                      <input className={inputCls} value={homeLocation} onChange={(e) => setHomeLocation(e.target.value)} placeholder="e.g. Salt Lake City, UT" />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input className={inputCls + " opacity-50 cursor-not-allowed"} value={email} disabled />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Profile Visibility</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setIsPrivate(false)}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${!isPrivate ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]/40"}`}>
                          Public
                        </button>
                        <button type="button" onClick={() => setIsPrivate(true)}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${isPrivate ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]/40"}`}>
                          Private
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Journal Feed Display</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFeedDisplay("collage")}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "collage" ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]/40"}`}>
                          Collage
                        </button>
                        <button type="button" onClick={() => setFeedDisplay("map")}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "map" ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]/40"}`}>
                          Map
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={saveDisabled}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#E8923A] px-6 py-2.5 text-white text-sm font-semibold hover:bg-[#D4782A] disabled:opacity-50 transition-colors">
                      <Save className="h-4 w-4" />
                      {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══════ NOTIFICATIONS ═══════ */}
            {activeSection === "notifications" && (
              <div id="notifications" className="bg-[#161B22] border border-[#21262D] rounded-xl p-6 scroll-mt-24">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-2">Email Notifications</h2>
                <p className="text-sm text-[#8B949E] mb-6">Choose what emails you receive from Executive Angler.</p>

                <div className="space-y-1">
                  {/* Activity section */}
                  <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-3">Activity</p>

                  {[
                    { label: "New followers", desc: "When someone starts following you", value: notifyFollows, set: setNotifyFollows },
                    { label: "Session comments", desc: "When someone comments on your session", value: notifyComments, set: setNotifyComments },
                    { label: "Session kudos", desc: "When someone gives kudos on your session", value: notifyLikes, set: setNotifyLikes },
                  ].map(({ label, desc, value, set }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-[#21262D] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#F0F6FC]">{label}</p>
                        <p className="text-xs text-[#484F58]">{desc}</p>
                      </div>
                      <button type="button" onClick={() => set(!value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#E8923A]" : "bg-[#21262D]"}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  ))}

                  {/* Digest section */}
                  <div className="pt-4 mt-4">
                    <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-3">Digest</p>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-[#F0F6FC]">Activity digest</p>
                        <p className="text-xs text-[#484F58]">Summary of activity on your profile</p>
                      </div>
                      <div className="flex gap-1.5">
                        {(["none", "daily", "weekly"] as const).map((freq) => (
                          <button key={freq} type="button" onClick={() => setDigestFrequency(freq)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                              digestFrequency === freq
                                ? "bg-[#E8923A] text-white"
                                : "bg-[#0D1117] border border-[#21262D] text-[#8B949E] hover:border-[#E8923A]/40"
                            }`}>
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#21262D]">
                  <button type="button" onClick={handleSaveNotifications} disabled={notifSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#E8923A] px-6 py-2.5 text-white text-sm font-semibold hover:bg-[#D4782A] disabled:opacity-50 transition-colors">
                    <Save className="h-4 w-4" />
                    {notifSaving ? "Saving…" : notifSaved ? "Saved ✓" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════ SECURITY ═══════ */}
            {activeSection === "security" && (
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                  </div>
                  {pwError && <p className="text-sm text-red-500">{pwError}</p>}
                  <button type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1F2937] border border-[#21262D] px-6 py-2.5 text-[#F0F6FC] text-sm font-semibold hover:bg-[#161B22] transition-colors">
                    <Shield className="h-4 w-4" />
                    {pwSaved ? "Updated ✓" : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {/* ═══════ CONNECTED ACCOUNTS ═══════ */}
            {activeSection === "connected" && (
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-6">Connected Accounts</h2>

                <div className="rounded-lg bg-[#0D1117] border border-[#21262D] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[#F0F6FC]">Google</p>
                      <p className="text-xs text-[#484F58]">{googleLinked ? "Connected" : "Not connected"}</p>
                    </div>
                  </div>
                  {!googleLinked ? (
                    <button type="button" onClick={handleLinkGoogle} disabled={googleLinking}
                      className="text-sm font-medium text-[#E8923A] hover:text-[#D4782A] transition-colors disabled:opacity-50">
                      {googleLinking ? "Connecting…" : "Connect"}
                    </button>
                  ) : (
                    <span className="text-sm text-green-500 font-medium">Connected ✓</span>
                  )}
                </div>
              </div>
            )}

            {/* Mobile sign out */}
            <button onClick={handleSignOut} className="sm:hidden w-full mt-6 flex items-center justify-center gap-2 rounded-lg border border-red-800/40 text-red-400 px-5 py-3 text-sm font-medium hover:bg-red-900/10 transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </main>
        </div>
      </div>
    </div>
  );
}
