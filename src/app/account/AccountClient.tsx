"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Fish, MapPin, Feather, Trophy, LogOut, Save, Star, Camera, Package, X, Bell, Users, Shield, Key, Link2, ChevronRight, Settings, User, Award, Database, Trash2 } from "@/icons";
import { formatDate } from "@/lib/date";
import Image from "next/image";
import AvatarCropModal from "@/components/AvatarCropModal";
import { compressImage } from "@/lib/image-compress";
import { Button } from "@/components/ui/Button";

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

type Section = "profile" | "notifications" | "security" | "connected" | "data";

interface Props {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    username?: string;
    bio?: string;
    homeLocation?: string;
    // Legacy boolean kept for backward compat; superseded by profileVisibility.
    isPrivate?: boolean;
    profileVisibility?: "public" | "followers_only" | "private";
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
}

export default function AccountClient({ user, feedDisplay: initialFeedDisplay, tiesOwnFlies: initialTiesOwnFlies = true, stats, awards = [], welcome, socialCounts, notificationPrefs, isAdmin = false }: Props) {
  const router = useRouter();

  // Determine initial section from URL hash
  const getInitialSection = (): Section => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["profile", "notifications", "security", "connected", "data"].includes(hash)) return hash as Section;
    }
    return "profile";
  };

  const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [homeLocation, setHomeLocation] = useState(user.homeLocation || "");
  // Three-way profile visibility (supersedes the binary isPrivate toggle).
  // Default from profileVisibility; fall back to deriving from isPrivate for
  // legacy rows that predate the column.
  const deriveVisibility = (): "public" | "followers_only" | "private" => {
    if (user.profileVisibility) return user.profileVisibility;
    return (user.isPrivate ?? false) ? "followers_only" : "public";
  };
  const [profileVisibility, setProfileVisibility] = useState<"public" | "followers_only" | "private">(deriveVisibility);
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
    if (["profile", "notifications", "security", "connected", "data"].includes(hash)) {
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
      {
        user_id: user.id,
        display_name: displayName,
        username: cleanUsername,
        bio: bio || null,
        home_location: homeLocation || null,
        // profile_visibility is the source of truth; is_private is synced by
        // the DB trigger (sync_is_private_from_visibility) for old clients.
        profile_visibility: profileVisibility,
        searchable,
        feed_display: feedDisplay,
        ties_own_flies: tiesOwnFlies,
      },
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

  const inputCls = "ea-input";
  const labelCls = "ea-label";

  const hasDemoContent = demoSessionCount > 0 || demoCatchCount > 0;

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "profile", icon: Settings, label: "Edit Profile" },
    { key: "notifications", icon: Bell, label: "Notifications" },
    { key: "security", icon: Key, label: "Security" },
    { key: "connected", icon: Link2, label: "Connected Accounts" },
    ...(hasDemoContent ? [{ key: "data" as const, icon: Database, label: "Data" }] : []),
  ];

  // ─── Quick nav cards ───
  const quickLinks = [
    { href: "/journal", icon: BookOpen, label: "Fishing Journal", sub: `${stats.totalSessions} sessions`, color: "text-[var(--action)]", bg: "bg-[var(--action)]/10" },
    { href: "/journal/flies", icon: Feather, label: "Fly Patterns", sub: `${stats.totalFlies} patterns`, color: "text-purple-400", bg: "bg-purple-400/10" },
    { href: "/account/gear", icon: Package, label: "Gear Locker", sub: "Rods, reels & more", color: "text-[var(--signal-live)]", bg: "bg-[var(--signal-live)]/10" },
    { href: "/favorites", icon: Star, label: "Favorites", sub: `${stats.totalFavorites} saved`, color: "text-[var(--action)]", bg: "bg-[var(--action)]/10" },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {cropSrc && <AvatarCropModal imageSrc={cropSrc} onSave={handleCropSave} onCancel={() => setCropSrc(null)} />}

      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Welcome banner */}
        {showWelcome && (
          <div className="rounded-[var(--radius-md)] border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-4 py-3 mb-8 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--accent)]">Welcome to Executive Angler! Set up your profile below to get started.</p>
            <button onClick={() => setShowWelcome(false)} className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors ml-4 flex-shrink-0" aria-label="Dismiss welcome message">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ─── Profile header (full width) ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
          <label className="cursor-pointer group relative flex-shrink-0">
            <div className="h-20 w-20 rounded-[var(--radius-card)] overflow-hidden bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="ea-photo object-cover w-full h-full" />
              ) : (
                <span className="font-display text-2xl font-semibold text-[var(--accent)]">{(displayName || user.email)[0].toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-[var(--radius-card)] bg-[var(--ink)]/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
              <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] truncate">{displayName || "Angler"}</h1>
              {username && <span className="text-sm text-[var(--text-3)]">@{username}</span>}
            </div>
            <p className="text-sm text-[var(--text-3)] mt-0.5">{user.email}</p>
            {socialCounts && (
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-2)]">
                  <span className="font-semibold text-[var(--text-1)] num">{socialCounts.followers}</span> follower{socialCounts.followers !== 1 ? "s" : ""}
                </span>
                <span className="text-[var(--text-3)]">·</span>
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-2)]">
                  <span className="font-semibold text-[var(--text-1)] num">{socialCounts.following}</span> following
                </span>
              </div>
            )}
          </div>

          <button onClick={handleSignOut} className="hidden sm:inline-flex ea-btn ea-btn-secondary ea-btn-sm">
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-standard ${
                    activeSection === key
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/40"
                      : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}

              {/* Admin link — only visible to admins */}
              {isAdmin && (
                <>
                  <div className="h-px bg-[var(--border)] my-2" />
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium whitespace-nowrap text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors duration-150 ease-standard"
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
              <div className="ea-card">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-6">Edit Profile</h2>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Display Name</label>
                      <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <label className={labelCls}>Username</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--text-3)] pointer-events-none select-none">@</span>
                        <input
                          className={inputCls + " pl-7 pr-10"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                          placeholder="yourhandle"
                          maxLength={30}
                        />
                        {username.length >= 3 && (
                          <span className="absolute right-3 text-sm pointer-events-none">
                            {usernameChecking ? <span className="text-[var(--text-3)]">…</span> : usernameAvailable === true ? <span className="text-[var(--success)]">✓</span> : usernameAvailable === false ? <span className="text-[var(--danger)]">✗</span> : null}
                          </span>
                        )}
                      </div>
                      {username.length >= 3 && usernameAvailable === false && <p className="ea-field-error">Taken.</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Bio</label>
                    <textarea className={inputCls + " resize-none"} rows={3} maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other anglers about yourself…" />
                    <p className="ea-field-helper text-right">{bio.length}/160</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Home Location</label>
                      <input className={inputCls} value={homeLocation} onChange={(e) => setHomeLocation(e.target.value)} placeholder="e.g. Salt Lake City, UT" />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input className={inputCls} value={email} disabled />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Profile Visibility</label>
                      <p className="text-xs text-[var(--text-3)] mb-2 -mt-1">
                        {profileVisibility === "public" && "Anyone can see your session feed."}
                        {profileVisibility === "followers_only" && "Only accepted followers see your session feed."}
                        {profileVisibility === "private" && "Only you can see your session feed and sessions."}
                      </p>
                      <div className="ea-segmented w-full">
                        {(["public", "followers_only", "private"] as const).map((v) => {
                          const labels = { public: "Public", followers_only: "Followers", private: "Private" };
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setProfileVisibility(v)}
                              aria-pressed={profileVisibility === v}
                              className="ea-segment flex-1"
                            >
                              {labels[v]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Journal Feed Display</label>
                      <div className="ea-segmented w-full">
                        <button type="button" onClick={() => setFeedDisplay("collage")}
                          aria-pressed={feedDisplay === "collage"}
                          className="ea-segment flex-1">
                          Collage
                        </button>
                        <button type="button" onClick={() => setFeedDisplay("map")}
                          aria-pressed={feedDisplay === "map"}
                          className="ea-segment flex-1">
                          Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search & Discovery — Strava's "Show profile in search results"
                      toggle. Only meaningful for public profiles; followers_only
                      and private are never indexed regardless, so we disable
                      the toggle (and visually dim it) for those. */}
                  <div>
                    <label className={labelCls}>Search &amp; Discovery</label>
                    <div
                      className={`flex items-center justify-between py-1 ${
                        profileVisibility !== "public" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium text-[var(--text-1)]">
                          Show my profile in search results
                        </p>
                        <p className="text-xs text-[var(--text-3)] mt-0.5">
                          {profileVisibility !== "public"
                            ? "Non-public profiles are never indexed by search engines."
                            : "Allow search engines to index your profile and include you in Executive Angler\u2019s angler search."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => profileVisibility === "public" && setSearchable(!searchable)}
                        disabled={profileVisibility !== "public"}
                        role="switch"
                        aria-checked={profileVisibility === "public" && searchable}
                        aria-label="Show my profile in search results"
                        className={`relative inline-flex h-6 w-11 items-center rounded-[var(--radius-md)] transition-colors duration-150 ease-standard flex-shrink-0 disabled:cursor-not-allowed ${
                          profileVisibility === "public" && searchable ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-[var(--radius-sm)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-150 ease-standard ${
                            profileVisibility === "public" && searchable ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Fly Tying Workbench</label>
                    <p className="text-xs text-[var(--text-3)] mb-2">Hide the workbench and tie-next tabs if you don&apos;t tie your own flies. Your fly box and shared patterns still work normally.</p>
                    <div className="ea-segmented w-full">
                      <button type="button" onClick={() => setTiesOwnFlies(true)}
                        aria-pressed={tiesOwnFlies}
                        className="ea-segment flex-1 whitespace-normal">
                        I tie my own flies
                      </button>
                      <button type="button" onClick={() => setTiesOwnFlies(false)}
                        aria-pressed={!tiesOwnFlies}
                        className="ea-segment flex-1 whitespace-normal">
                        I buy my flies
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={saveDisabled}
                      loading={saving}
                      variant="solid"
                      size="md"
                      icon={Save}
                     
                    >
                      {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══════ NOTIFICATIONS ═══════ */}
            {activeSection === "notifications" && (
              <div id="notifications" className="ea-card scroll-mt-24">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-2">Email Notifications</h2>
                <p className="text-sm text-[var(--text-2)] mb-6">Choose what emails you receive from Executive Angler.</p>

                <div className="space-y-1">
                  {/* Activity section */}
                  <p className="ea-overline mb-3">Activity</p>

                  {[
                    { label: "New followers", desc: "When someone starts following you", value: notifyFollows, set: setNotifyFollows },
                    { label: "Session comments", desc: "When someone comments on your session", value: notifyComments, set: setNotifyComments },
                    { label: "Session kudos", desc: "When someone gives kudos on your session", value: notifyLikes, set: setNotifyLikes },
                  ].map(({ label, desc, value, set }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-1)]">{label}</p>
                        <p className="text-xs text-[var(--text-3)]">{desc}</p>
                      </div>
                      <button type="button" onClick={() => set(!value)}
                        role="switch"
                        aria-checked={value}
                        aria-label={label}
                        className={`relative inline-flex h-6 w-11 items-center rounded-[var(--radius-md)] transition-colors duration-150 ease-standard flex-shrink-0 ${value ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"}`}>
                        <span className={`inline-block h-4 w-4 rounded-[var(--radius-sm)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-150 ease-standard ${value ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  ))}

                  {/* Digest section */}
                  <div className="pt-4 mt-4">
                    <p className="ea-overline mb-3">Digest</p>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-1)]">Activity digest</p>
                        <p className="text-xs text-[var(--text-3)]">Summary of activity on your profile</p>
                      </div>
                      <div className="ea-segmented">
                        {(["none", "daily", "weekly"] as const).map((freq) => (
                          <button key={freq} type="button" onClick={() => setDigestFrequency(freq)}
                            aria-pressed={digestFrequency === freq}
                            className="ea-segment capitalize">
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    onClick={handleSaveNotifications}
                    disabled={notifSaving}
                    loading={notifSaving}
                    variant="solid"
                    size="md"
                    icon={Save}
                   
                  >
                    {notifSaving ? "Saving…" : notifSaved ? "Saved ✓" : "Save Preferences"}
                  </Button>
                </div>
              </div>
            )}

            {/* ═══════ SECURITY ═══════ */}
            {activeSection === "security" && (
              <div className="ea-card">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                  </div>
                  {pwError && <p className="ea-field-error">{pwError}</p>}
                  <Button type="submit" variant="outline" size="md" icon={Shield}>
                    {pwSaved ? "Updated ✓" : "Update Password"}
                  </Button>
                </form>
              </div>
            )}

            {/* ═══════ CONNECTED ACCOUNTS ═══════ */}
            {activeSection === "connected" && (
              <div className="ea-card">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-6">Connected Accounts</h2>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-1)]">Google</p>
                      <p className="text-xs text-[var(--text-3)]">{googleLinked ? "Connected" : "Not connected"}</p>
                    </div>
                  </div>
                  {!googleLinked ? (
                    <button type="button" onClick={handleLinkGoogle} disabled={googleLinking}
                      className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 ease-standard disabled:opacity-50">
                      {googleLinking ? "Connecting…" : "Connect"}
                    </button>
                  ) : (
                    <span className="text-sm text-[var(--success)] font-medium">Connected ✓</span>
                  )}
                </div>
              </div>
            )}

            {/* ═══════ DATA ═══════ */}
            {activeSection === "data" && (
              <div className="ea-card">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-2">Data</h2>
                <p className="text-sm text-[var(--text-2)] mb-6">Manage sample content added to your account during onboarding.</p>

                {demoProbed && !hasDemoContent ? (
                  <p className="text-sm text-[var(--text-2)]">
                    No demo content on your account. Your journal is clean.
                  </p>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                        <Database className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-1)]">Sample sessions</p>
                        <p className="text-xs text-[var(--text-2)] mt-0.5">
                          {demoProbed
                            ? `${demoSessionCount} session${demoSessionCount === 1 ? "" : "s"} · ${demoCatchCount} catch${demoCatchCount === 1 ? "" : "es"} were added to your journal to help you explore the app.`
                            : "Checking for demo content…"}
                        </p>
                        <p className="text-xs text-[var(--text-3)] mt-1">
                          Clearing won&apos;t touch any sessions you logged yourself.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                      <Button
                        type="button"
                        onClick={handleClearDemoContent}
                        disabled={demoClearing || !demoProbed || !hasDemoContent}
                        loading={demoClearing}
                        variant="destructive"
                        size="md"
                        icon={Trash2}
                      >
                        {demoClearing ? "Clearing…" : demoCleared ? "Cleared ✓" : "Clear Demo Content"}
                      </Button>
                      {demoCleared && (
                        <span className="text-xs text-[var(--success)]">Your journal is empty and ready.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile sign out */}
            <button onClick={handleSignOut} className="sm:hidden w-full mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--danger)] px-5 py-3 text-sm font-medium hover:bg-[var(--danger)]/10 transition-colors duration-150 ease-standard">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </main>
        </div>
      </div>
    </div>
  );
}
