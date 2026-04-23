"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Fish, MapPin, Feather, Trophy, LogOut, Save, Star, Camera, Package, X, Bell, Users, Shield, Key, Link2, ChevronRight, Settings, User, Award, Crown, Sparkles, CreditCard, Database, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/date";
import Image from "next/image";
import AvatarCropModal from "@/components/AvatarCropModal";
import { compressImage } from "@/lib/image-compress";

const AWARD_EMOJI_MAP: Record<string, string> = {
  first_timer: "🪝", sessions_10: "🪝",
  regular: "🎣", sessions_50: "🎣",
  veteran: "🥾", sessions_100: "🥾",
  legend: "👑", sessions_500: "👑",
  centurion: "💯", catches_100: "💯",
  master_angler: "🐋", catches_1000: "🐋",
  consistent_producer: "🔥", catches_500: "🔥",
  species_hunter: "🦎", species_5: "🦎",
  species_15: "🌊", species_30: "🏔️",
  rivers_5: "🗺️", rivers_15: "🧭", rivers_30: "🌍",
  streak_4: "⚡", streak_12: "💎",
};

type Section = "profile" | "subscription" | "notifications" | "security" | "connected" | "data";

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
    searchable?: boolean;
  };
  feedDisplay: "collage" | "map";
  tiesOwnFlies?: boolean;
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
  isAdmin?: boolean;
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
  isPremium?: boolean;
  subscription?: {
    source: "apple" | "google" | "stripe";
    plan: "monthly" | "annual";
    status: "active" | "trialing";
    currentPeriodEnd: string | null;
  } | null;
  hasStripeCustomer?: boolean;
}

export default function AccountClient({ user, feedDisplay: initialFeedDisplay, tiesOwnFlies: initialTiesOwnFlies = true, stats, awards = [], welcome, socialCounts, notificationPrefs, isAdmin = false, isPremium = false, subscription = null, hasStripeCustomer = false }: Props) {
  const router = useRouter();

  // Determine initial section from URL hash
  const getInitialSection = (): Section => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["profile", "subscription", "notifications", "security", "connected", "data"].includes(hash)) return hash as Section;
    }
    return "profile";
  };

  const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [homeLocation, setHomeLocation] = useState(user.homeLocation || "");
  const [isPrivate, setIsPrivate] = useState(user.isPrivate ?? false);
  // Default to true (indexable) so legacy accounts stay in discovery surfaces
  // until the angler explicitly opts out — matches the DB column default.
  const [searchable, setSearchable] = useState(user.searchable ?? true);
  const [feedDisplay, setFeedDisplay] = useState<"collage" | "map">(initialFeedDisplay);
  const [tiesOwnFlies, setTiesOwnFlies] = useState<boolean>(initialTiesOwnFlies);
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

  // Subscription portal
  const [portalLoading, setPortalLoading] = useState(false);

  // Demo content state
  const [demoProbed, setDemoProbed] = useState(false);
  const [demoSessionCount, setDemoSessionCount] = useState(0);
  const [demoCatchCount, setDemoCatchCount] = useState(0);
  const [demoClearing, setDemoClearing] = useState(false);
  const [demoCleared, setDemoCleared] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/user/demo-content");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setDemoSessionCount(data.sessionCount ?? 0);
        setDemoCatchCount(data.catchCount ?? 0);
      } finally {
        if (active) setDemoProbed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleClearDemoContent() {
    const msg =
      `This will permanently delete your ${demoSessionCount} sample session${demoSessionCount === 1 ? "" : "s"}` +
      ` and ${demoCatchCount} associated catch${demoCatchCount === 1 ? "" : "es"}.` +
      ` Your real sessions will not be touched. Continue?`;
    if (!confirm(msg)) return;

    setDemoClearing(true);
    try {
      const res = await fetch("/api/user/demo-content", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to clear demo content");
        return;
      }
      setDemoSessionCount(0);
      setDemoCatchCount(0);
      setDemoCleared(true);
      setTimeout(() => setDemoCleared(false), 3000);
      // Refresh stats/counts that server-rendered based on old totals.
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDemoClearing(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/checkout/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

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
    if (["profile", "subscription", "notifications", "security", "connected", "data"].includes(hash)) {
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
      const compressed = await compressImage(blob, { maxDimension: 800 });
      const fd = new FormData();
      fd.append("avatar", new File([compressed], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to upload avatar"); return; }
      if (data.url) setAvatarUrl(data.url + `?t=${Date.now()}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to upload avatar.";
      alert(msg);
    } finally { setAvatarUploading(false); }
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
      { user_id: user.id, display_name: displayName, username: cleanUsername, bio: bio || null, home_location: homeLocation || null, is_private: isPrivate, searchable, feed_display: feedDisplay, ties_own_flies: tiesOwnFlies },
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

  const inputCls = "w-full rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-3 text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A] transition-colors";
  const labelCls = "block text-sm font-medium text-[#A8B2BD] mb-1.5";

  const hasDemoContent = demoSessionCount > 0 || demoCatchCount > 0;

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "profile", icon: Settings, label: "Edit Profile" },
    { key: "subscription", icon: CreditCard, label: "Subscription" },
    { key: "notifications", icon: Bell, label: "Notifications" },
    { key: "security", icon: Key, label: "Security" },
    { key: "connected", icon: Link2, label: "Connected Accounts" },
    ...(hasDemoContent ? [{ key: "data" as const, icon: Database, label: "Data" }] : []),
  ];

  // ─── Quick nav cards ───
  const quickLinks = [
    { href: "/journal", icon: BookOpen, label: "Fishing Journal", sub: `${stats.totalSessions} sessions`, color: "text-[#E8923A]", bg: "bg-[#E8923A]/10" },
    { href: "/journal/flies", icon: Feather, label: "Fly Patterns", sub: `${stats.totalFlies} patterns`, color: "text-purple-400", bg: "bg-purple-400/10" },
    { href: "/account/gear", icon: Package, label: "Gear Locker", sub: "Rods, reels & more", color: "text-[#0BA5C7]", bg: "bg-[#0BA5C7]/10" },
    { href: "/favorites", icon: Star, label: "Favorites", sub: `${stats.totalFavorites} saved`, color: "text-[#E8923A]", bg: "bg-[#E8923A]/10" },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {cropSrc && <AvatarCropModal imageSrc={cropSrc} onSave={handleCropSave} onCancel={() => setCropSrc(null)} />}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
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
              {username && <span className="text-sm text-[#A8B2BD] font-mono">@{username}</span>}
            </div>
            <p className="text-sm text-[#6E7681] mt-0.5">{user.email}</p>
            {socialCounts && (
              <div className="flex items-center gap-4 mt-2">
                <Link href={`/anglers/${username || user.id}?tab=followers`} className="flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                  <span className="font-semibold text-[#F0F6FC]">{socialCounts.followers}</span> follower{socialCounts.followers !== 1 ? "s" : ""}
                </Link>
                <span className="text-[#21262D]">·</span>
                <Link href={`/anglers/${username || user.id}?tab=following`} className="flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
                  <span className="font-semibold text-[#F0F6FC]">{socialCounts.following}</span> following
                </Link>
              </div>
            )}
          </div>

          <button onClick={handleSignOut} className="hidden sm:inline-flex items-center gap-2 text-sm text-[#6E7681] hover:text-red-400 transition-colors border border-[#21262D] rounded-lg px-4 py-2 hover:border-red-800">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
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
                      : "text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}

              {/* Admin link — only visible to admins */}
              {isAdmin && (
                <>
                  <div className="h-px bg-[#21262D] my-2" />
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    Admin Dashboard
                  </Link>
                </>
              )}
            </nav>
          </aside>

          {/* Right main content */}
          <main className="flex-1 min-w-0">
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
                        <span className="absolute left-4 text-[#6E7681] pointer-events-none select-none">@</span>
                        <input
                          className={inputCls + " pl-8 pr-10"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                          placeholder="yourhandle"
                          maxLength={30}
                        />
                        {username.length >= 3 && (
                          <span className="absolute right-3 text-sm pointer-events-none">
                            {usernameChecking ? <span className="text-[#A8B2BD]">…</span> : usernameAvailable === true ? <span className="text-green-500">✓</span> : usernameAvailable === false ? <span className="text-red-500">✗</span> : null}
                          </span>
                        )}
                      </div>
                      {username.length >= 3 && usernameAvailable === false && <p className="text-xs text-red-500 mt-1">Taken.</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Bio</label>
                    <textarea className={inputCls + " resize-none"} rows={3} maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other anglers about yourself…" />
                    <p className="text-xs text-[#6E7681] mt-1 text-right">{bio.length}/160</p>
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
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${!isPrivate ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"}`}>
                          Public
                        </button>
                        <button type="button" onClick={() => setIsPrivate(true)}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${isPrivate ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"}`}>
                          Private
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Journal Feed Display</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFeedDisplay("collage")}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "collage" ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"}`}>
                          Collage
                        </button>
                        <button type="button" onClick={() => setFeedDisplay("map")}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "map" ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"}`}>
                          Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search & Discovery — Strava's "Show profile in search results"
                      toggle. Off means the public profile page emits
                      `noindex, nofollow` and the angler is hidden from in-app
                      search/suggested-anglers surfaces. Private profiles are
                      already hidden from search regardless, so we disable
                      the toggle (and visually dim it) when isPrivate is on. */}
                  <div>
                    <label className={labelCls}>Search &amp; Discovery</label>
                    <div
                      className={`flex items-center justify-between rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-3 ${
                        isPrivate ? "opacity-60" : ""
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium text-[#F0F6FC]">
                          Show my profile in search results
                        </p>
                        <p className="text-xs text-[#6E7681] mt-0.5">
                          {isPrivate
                            ? "Private profiles are never indexed — turn off Private to make this toggle active."
                            : "Allow search engines to index your profile and include you in Executive Angler\u2019s angler search."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => !isPrivate && setSearchable(!searchable)}
                        disabled={isPrivate}
                        aria-pressed={!isPrivate && searchable}
                        aria-label="Show my profile in search results"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:cursor-not-allowed ${
                          !isPrivate && searchable ? "bg-[#E8923A]" : "bg-[#21262D]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            !isPrivate && searchable ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Fly Tying Workbench</label>
                    <p className="text-xs text-[#6E7681] mb-2">Hide the workbench and tie-next tabs if you don&apos;t tie your own flies. Your fly box and shared patterns still work normally.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setTiesOwnFlies(true)}
                        className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${tiesOwnFlies ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"}`}>
                        I tie my own flies
                      </button>
                      <button type="button" onClick={() => setTiesOwnFlies(false)}
                        className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${!tiesOwnFlies ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"}`}>
                        I buy my flies
                      </button>
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

            {/* ═══════ SUBSCRIPTION ═══════ */}
            {activeSection === "subscription" && (
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-6">Subscription</h2>

                {isPremium ? (
                  <div className="space-y-6">
                    {/* Status card */}
                    <div className="rounded-xl bg-gradient-to-br from-[#E8923A]/10 via-[#E8923A]/5 to-transparent border border-[#E8923A]/20 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-[#E8923A]/15 flex items-center justify-center">
                          <Crown className="h-5 w-5 text-[#E8923A]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#F0F6FC]">Executive Angler Pro</p>
                          <p className="text-xs text-[#2EA44F] font-medium">
                            {subscription?.status === "trialing" ? "Free Trial" : "Active"}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-[#6E7681] uppercase tracking-wider">Plan</p>
                          <p className="text-sm text-[#F0F6FC] font-medium mt-0.5 capitalize">
                            {subscription?.plan || "Pro"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#6E7681] uppercase tracking-wider">Source</p>
                          <p className="text-sm text-[#F0F6FC] font-medium mt-0.5 capitalize">
                            {subscription?.source === "apple" ? "Apple App Store" : subscription?.source === "google" ? "Google Play" : subscription?.source === "stripe" ? "Web (Stripe)" : "—"}
                          </p>
                        </div>
                        {subscription?.currentPeriodEnd && (
                          <div>
                            <p className="text-[10px] font-bold text-[#6E7681] uppercase tracking-wider">Renews</p>
                            <p className="text-sm text-[#F0F6FC] font-medium mt-0.5">
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Management options */}
                    <div className="space-y-3">
                      {subscription?.source === "stripe" || hasStripeCustomer ? (
                        <button
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#0D1117] border border-[#21262D] hover:border-[#E8923A]/40 transition-colors disabled:opacity-50"
                        >
                          <span className="text-sm font-medium text-[#F0F6FC]">Manage Subscription</span>
                          <ChevronRight className="h-4 w-4 text-[#6E7681]" />
                        </button>
                      ) : null}

                      {subscription?.source === "apple" && (
                        <div className="rounded-lg bg-[#0D1117] border border-[#21262D] px-4 py-3">
                          <p className="text-sm text-[#A8B2BD]">
                            Your subscription is managed through the <strong className="text-[#F0F6FC]">Apple App Store</strong>.
                          </p>
                          <p className="text-xs text-[#6E7681] mt-1">
                            Open Settings → Apple ID → Subscriptions on your iPhone to manage billing.
                          </p>
                        </div>
                      )}

                      {subscription?.source === "google" && (
                        <div className="rounded-lg bg-[#0D1117] border border-[#21262D] px-4 py-3">
                          <p className="text-sm text-[#A8B2BD]">
                            Your subscription is managed through <strong className="text-[#F0F6FC]">Google Play</strong>.
                          </p>
                          <p className="text-xs text-[#6E7681] mt-1">
                            Open the Google Play Store app → Payments & subscriptions to manage billing.
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-[#6E7681]">
                      Your Pro access syncs across iOS, Android, and web — regardless of where you subscribed.
                    </p>
                  </div>
                ) : (
                  /* Not premium — upgrade CTA */
                  <div className="text-center py-6">
                    <div className="h-14 w-14 rounded-full bg-[#E8923A]/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-7 w-7 text-[#E8923A]" />
                    </div>
                    <h3 className="font-serif text-xl text-[#F0F6FC] mb-2">Upgrade to Pro</h3>
                    <p className="text-sm text-[#A8B2BD] max-w-sm mx-auto mb-6">
                      Unlock live river conditions, advanced analytics, AI insights, hatch reports, and more.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold hover:bg-[#D4751F] transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      View Plans
                    </Link>
                    <p className="text-[11px] text-[#6E7681] mt-4">
                      Starting at $2.50/mo. Same price on iOS, Android, and web.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ NOTIFICATIONS ═══════ */}
            {activeSection === "notifications" && (
              <div id="notifications" className="bg-[#161B22] border border-[#21262D] rounded-xl p-6 scroll-mt-24">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-2">Email Notifications</h2>
                <p className="text-sm text-[#A8B2BD] mb-6">Choose what emails you receive from Executive Angler.</p>

                <div className="space-y-1">
                  {/* Activity section */}
                  <p className="text-xs font-semibold text-[#A8B2BD] uppercase tracking-wider mb-3">Activity</p>

                  {[
                    { label: "New followers", desc: "When someone starts following you", value: notifyFollows, set: setNotifyFollows },
                    { label: "Session comments", desc: "When someone comments on your session", value: notifyComments, set: setNotifyComments },
                    { label: "Session kudos", desc: "When someone gives kudos on your session", value: notifyLikes, set: setNotifyLikes },
                  ].map(({ label, desc, value, set }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-[#21262D] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#F0F6FC]">{label}</p>
                        <p className="text-xs text-[#6E7681]">{desc}</p>
                      </div>
                      <button type="button" onClick={() => set(!value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#E8923A]" : "bg-[#21262D]"}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  ))}

                  {/* Digest section */}
                  <div className="pt-4 mt-4">
                    <p className="text-xs font-semibold text-[#A8B2BD] uppercase tracking-wider mb-3">Digest</p>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-[#F0F6FC]">Activity digest</p>
                        <p className="text-xs text-[#6E7681]">Summary of activity on your profile</p>
                      </div>
                      <div className="flex gap-1.5">
                        {(["none", "daily", "weekly"] as const).map((freq) => (
                          <button key={freq} type="button" onClick={() => setDigestFrequency(freq)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                              digestFrequency === freq
                                ? "bg-[#E8923A] text-white"
                                : "bg-[#0D1117] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40"
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
                      <p className="text-xs text-[#6E7681]">{googleLinked ? "Connected" : "Not connected"}</p>
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

            {/* ═══════ DATA ═══════ */}
            {activeSection === "data" && (
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F0F6FC] mb-2">Data</h2>
                <p className="text-sm text-[#A8B2BD] mb-6">Manage sample content added to your account during onboarding.</p>

                {demoProbed && !hasDemoContent ? (
                  <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4 text-sm text-[#A8B2BD]">
                    No demo content on your account. Your journal is clean.
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-[#E8923A]/10 flex items-center justify-center flex-shrink-0">
                        <Database className="h-5 w-5 text-[#E8923A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#F0F6FC]">Sample sessions</p>
                        <p className="text-xs text-[#A8B2BD] mt-0.5">
                          {demoProbed
                            ? `${demoSessionCount} session${demoSessionCount === 1 ? "" : "s"} · ${demoCatchCount} catch${demoCatchCount === 1 ? "" : "es"} were added to your journal to help you explore the app.`
                            : "Checking for demo content…"}
                        </p>
                        <p className="text-xs text-[#6E7681] mt-1">
                          Clearing won&apos;t touch any sessions you logged yourself.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-[#21262D]">
                      <button
                        type="button"
                        onClick={handleClearDemoContent}
                        disabled={demoClearing || !demoProbed || !hasDemoContent}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-2 text-sm font-semibold hover:bg-red-900/50 hover:text-red-300 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        {demoClearing ? "Clearing…" : demoCleared ? "Cleared ✓" : "Clear demo content"}
                      </button>
                      {demoCleared && (
                        <span className="text-xs text-[#2EA44F]">Your journal is empty and ready.</span>
                      )}
                    </div>
                  </div>
                )}
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
